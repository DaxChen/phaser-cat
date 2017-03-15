import Phaser from 'phaser'
import Bullet from './Bullet'

export default class Box2DWeapon extends Phaser.Plugin {
  constructor (game, parent) {
    super(game, parent)

    this.bullets = null
    this.autoExpandBulletsGroup = true // make the default true
    this.autofire = false
    this.shots = 0
    this.fireLimit = 0
    this.fireRate = 100
    this.fireRateVariance = 0
    this.fireFrom = new Phaser.Point() // change to a point
    this.fireAngle = Phaser.ANGLE_UP
    this.bulletInheritSpriteSpeed = false
    this.bulletAnimation = ''
    this.bulletAngleOffset = 0
    this.bulletAngleVariance = 0
    this.bulletSpeed = 200
    this.bulletSpeedVariance = 0
    this.bulletKillDistance = 0
    this.bulletRotateToVelocity = false
    this.bulletKey = ''

    this._bulletClass = Bullet
    this._bulletCollideWorldBounds = false
    this._bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS
    this._data = {
      customBody: false,
      width: 0,
      height: 0,
      offsetX: 0,
      offsetY: 0
    }

    this.bounds = new Phaser.Rectangle()
    this.bulletBounds = game.world.bounds
    this.anims = {}

    this.onFire = new Phaser.Signal()
    this.onKill = new Phaser.Signal()
    this.onFireLimit = new Phaser.Signal()

    this.trackedSprite = null
    this.trackRotation = false
    this.trackOffset = new Phaser.Point()

    this._nextFire = 0
    this._rotatedPoint = new Phaser.Point()
  }

  createBullets ({ quantity, key, group }) {
    if (quantity === undefined) { quantity = 1 }
    if (group === undefined) { group = this.game.world }

    if (!this.bullets) {
      this.bullets = this.game.add.physicsGroup(Phaser.Physics.BOX2D, group)
      this.bullets.classType = this._bulletClass
    }

    if (quantity !== 0) {
      if (quantity === -1) {
        this.autoExpandBulletsGroup = true
        quantity = 1
      }

      this.bullets.createMultiple(quantity, key)

      this.bullets.setAll('data.bulletManager', this)

      this.bulletKey = key
    }

    return this
  }

  forEach (callback, callbackContext) {
    this.bullets.forEachExists(callback, callbackContext, arguments)
    return this
  }

  pauseAll () {
    this.bullets.setAll('body.enable', false)
    return this
  }

  resumeAll () {
    this.bullets.setAll('body.enable', true)
    return this
  }

  killAll () {
    this.bullets.callAllExists('kill', true)
    this.bullets.setAll('body.enable', true)
    return this
  }

  resetShots (newLimit) {
    this.shots = 0
    if (newLimit !== undefined) {
      this.fireLimit = newLimit
    }
    return this
  }

  destroy () {
    this.parent.remove(this, false)
    this.bullets.destroy()

    this.game = null
    this.parent = null
    this.active = false
    this.visible = false
  }

  // Internal update method, called by the PluginManager
  update () {
    if (this._bulletKillType === Phaser.Weapon.KILL_WEAPON_BOUNDS) {
      if (this.trackedSprite) {
        this.trackedSprite.updateTransform()
        this.bounds.centerOn(this.trackedSprite.worldPosition.x, this.trackedSprite.worldPosition.y)
      // } else if (this.trackedPointer) {
      //   this.bounds.centerOn(this.trackedPointer.worldX, this.trackedPointer.worldY)
      }
    }

    if (this.autofire) {
      this.fire()
    }
  }

  trackSprite (sprite, offsetX, offsetY, trackRotation) {
    if (offsetX === undefined) { offsetX = 0 }
    if (offsetY === undefined) { offsetY = 0 }
    if (trackRotation === undefined) { trackRotation = false }

    this.trackedPointer = null
    this.trackedSprite = sprite
    this.trackRotation = trackRotation

    this.trackOffset.set(offsetX, offsetY)

    return this
  }

  fire (from, x, y) {
    if (this.game.time.now < this._nextFire || (this.fireLimit > 0 && this.shots === this.fireLimit)) {
      return false
    }

    let speed = this.bulletSpeed

    //  Apply +- speed variance
    if (this.bulletSpeedVariance !== 0) {
      speed += Phaser.Math.between(-this.bulletSpeedVariance, this.bulletSpeedVariance)
    }

    if (from) {
      this.fireFrom.x = from.x
      this.fireFrom.y = from.y
    } else if (this.trackedSprite) {
      if (this.trackRotation) {
        this._rotatedPoint.set(this.trackedSprite.world.x + this.trackOffset.x, this.trackedSprite.world.y + this.trackOffset.y)
        this._rotatedPoint.rotate(this.trackedSprite.world.x, this.trackedSprite.world.y, this.trackedSprite.rotation)

        this.fireFrom.x = this._rotatedPoint.x
        this.fireFrom.y = this._rotatedPoint.y
      } else {
        this.fireFrom.x = this.trackedSprite.world.x + this.trackOffset.x
        this.fireFrom.y = this.trackedSprite.world.y + this.trackOffset.y
      }

      if (this.bulletInheritSpriteSpeed) {
        speed += Math.sqrt(
          this.trackedSprite.body.velocity.x * this.trackedSprite.body.velocity.x +
          this.trackedSprite.body.velocity.y * this.trackedSprite.body.velocity.y
        )
      }
    }

    const fromX = /* (this.fireFrom.width > 1) ? this.fireFrom.randomX : */this.fireFrom.x
    const fromY = /* (this.fireFrom.height > 1) ? this.fireFrom.randomY : */this.fireFrom.y

    let angle = this.trackRotation ? this.trackedSprite.angle : this.fireAngle

    //  The position (in world space) to fire the bullet towards, if set
    if (x !== undefined && y !== undefined) {
      angle = this.game.math.radToDeg(Math.atan2(y - fromY, x - fromX))
    }

    //  Apply +- angle variance
    if (this.bulletAngleVariance !== 0) {
      angle += Phaser.Math.between(-this.bulletAngleVariance, this.bulletAngleVariance)
    }

    let moveX = 0
    let moveY = 0

    //  Avoid sin/cos for right-angled shots
    if (angle === 0 || angle === 180) {
      moveX = Math.cos(this.game.math.degToRad(angle)) * speed
    } else if (angle === 90 || angle === 270) {
      moveY = Math.sin(this.game.math.degToRad(angle)) * speed
    } else {
      moveX = Math.cos(this.game.math.degToRad(angle)) * speed
      moveY = Math.sin(this.game.math.degToRad(angle)) * speed
    }

    let bullet = null

    if (this.autoExpandBulletsGroup) {
      bullet = this.bullets.getFirstExists(false, true, fromX, fromY, this.bulletKey, this.bulletFrame)

      bullet.data.bulletManager = this
    } else {
      bullet = this.bullets.getFirstExists(false)
    }

    if (bullet) {
      bullet.reset(fromX, fromY)

      bullet.data.fromX = fromX
      bullet.data.fromY = fromY
      bullet.data.killType = this.bulletKillType
      bullet.data.killDistance = this.bulletKillDistance
      bullet.data.rotateToVelocity = this.bulletRotateToVelocity

      if (this.bulletKillType === Phaser.Weapon.KILL_LIFESPAN) {
        bullet.lifespan = this.bulletLifespan
      }

      bullet.angle = angle + this.bulletAngleOffset

      //  Frames and Animations
      if (this.bulletAnimation !== '') {
        if (bullet.animations.getAnimation(this.bulletAnimation) === null) {
          const anim = this.anims[this.bulletAnimation]

          bullet.animations.add(anim.name, anim.frames, anim.frameRate, anim.loop, anim.useNumericIndex)
        }

        bullet.animations.play(this.bulletAnimation)
      // } else {
      //   if (this.bulletFrameCycle) {
      //     bullet.frame = this.bulletFrames[this.bulletFrameIndex]

      //     this.bulletFrameIndex++

      //     if (this.bulletFrameIndex >= this.bulletFrames.length) {
      //       this.bulletFrameIndex = 0
      //     }
      //   } else if (this.bulletFrameRandom) {
      //     bullet.frame = this.bulletFrames[Math.floor(Math.random() * this.bulletFrames.length)]
      //   }
      }

      // if (bullet.data.bodyDirty) { // TODO
      //   if (this._data.customBody) {
      //     bullet.body.setSize(this._data.width, this._data.height, this._data.offsetX, this._data.offsetY)
      //   }

      //   bullet.body.collideWorldBounds = this.bulletCollideWorldBounds

      //   bullet.data.bodyDirty = false
      // }

      bullet.body.velocity.set(moveX, moveY)
      // bullet.body.gravity.set(this.bulletGravity.x, this.bulletGravity.y)

      if (this.bulletSpeedVariance !== 0) {
        let rate = this.fireRate

        rate += Phaser.Math.between(-this.fireRateVariance, this.fireRateVariance)

        if (rate < 0) { rate = 0 }

        this._nextFire = this.game.time.now + rate
      } else {
        this._nextFire = this.game.time.now + this.fireRate
      }

      this.shots++

      this.onFire.dispatch(bullet, this, speed)

      if (this.fireLimit > 0 && this.shots === this.fireLimit) {
        this.onFireLimit.dispatch(this, this.fireLimit)
      }
    }
    return bullet
  }
}
