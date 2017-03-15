import Phaser from 'phaser'
import HealthBar from '../plugins/HealthBar'
import {
  invincibleTimer,
  updateHealthBar
} from '../utils/player-util'
import { getBulletUID } from '../weapons/weapon-config'

export default class CatFighter extends Phaser.Sprite {
  constructor ({ game, x, y, asset }) {
    super(game, x, y, asset)

    // debug
    if (__DEV__) { window.player = this } /* global __DEV__ */

    //  enable physics on the player
    game.physics.box2d.enable(this)
    this.body.setRectangle(13, 28, -1, 8)
    this.body.fixedRotation = true

    // animations
    this.initAnimations()

    // states to determine animations
    this.hurting = false
    this.dying = false
    this.fireballing = false // this determines the animation, not the fireButton pressing
    // the animation part, 'ready'. 'charge', 'charge-super', 'shot' or 'shot-super'
    this.fireballChargeState = 'ready'
    // fireball charge time
    this.fireballCharging = false // this is wheather fireButton is pressing
    this.fireballChargeStartTime = 0
    // direction of fireball, calculated via `Math.atan2`, with the following results:
    // east: 0, north: -90, west: 180, south: 90 this is so wrong... Math.atan2 is (Y, X) not (X, Y)
    // north-east: -45, north-west: -135, south-east: 45, south-west: 135
    this.direction = 0

    // settings
    this.speed = 200
    this.maxHealth = 100
    this.health = this.maxHealth
    this.DEF = 0
    this.FIREBALL_SUPER_CHARGE_TIME = 1500

    // weapons
    this.currentWeapon = 'fireball'
    this.weapons = {}

    // setup initial invincible timer
    invincibleTimer({ game, player: this })

    // healthBar
    this.healthBar = new HealthBar(this.game, {
      width: 24,
      height: 3,
      bg: { color: '#651828' },
      bar: { color: '#00FF00' }
    })

    // controls
    this.cursors = game.input.keyboard.createCursorKeys()
    this.fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR)
    // stop the event from propagating up to the browser
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ])
  }

  initAnimations () {
    this.animations.add('idle', [0, 1, 2, 3], 12, true)
    this.animations.add('walk', [16, 17, 18, 19, 20, 21, 22, 23], 30, true)
    this.animations.add('hurt', [64, 65, 66, 65], 12, false)
      .onComplete.add(() => { this.hurting = false })
    this.animations.add('death', [64, 65, 66, 67, 68, 69, 70], 12, false)
      .onComplete.add(() => { this.myReset(this.world.centerX, this.world.centerY, this.maxHealth) })
    this.animations.add('fireball-ready', [80, 81, 82], 12, false)
      .onComplete.add(() => { this.fireballChargeState = 'charge' })
    this.animations.add('fireball-charge', [83, 84], 12, true)
    this.animations.add('fireball-charge-super', [87, 88], 12, true)
    const fireballShotOnComplete = () => {
      this.fireballing = false
      this.fireballChargeState = 'ready'
    }
    this.animations.add('fireball-shot', [85, 86], 12, false)
      .onComplete.add(fireballShotOnComplete)
    this.animations.add('fireball-shot-super', [89, 90, 91, 92, 93, 94], 12, false)
      .onComplete.add(fireballShotOnComplete)
  }

  addWeapon (name, weapon) {
    this.weapons[name] = weapon
    weapon.trackedSprite = this
  }

  checkAnim () {
    // dying
    if (this.dying) { return this.play('death') }
    // fireballing
    if (this.fireballing) {
      return this.play(`fireball-${this.fireballChargeState}`)
    }
    // hurt
    if (this.hurting) { return this.play('hurt') }
    // move
    if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) { return this.play('walk') }
    // idle
    this.play('idle')
  }

  update () {
    const { body, cursors, scale, speed } = this
    body.setZeroVelocity()

    if (cursors.left.isDown) {
      body.moveLeft(speed)
      scale.setTo(-1, 1)
    } else if (cursors.right.isDown) {
      body.moveRight(speed)
      scale.setTo(1, 1)
    }

    if (cursors.up.isDown) {
      body.moveUp(speed)
    } else if (cursors.down.isDown) {
      body.moveDown(speed)
    }

    const { velocity } = body
    // if just starting to fireball, not 'charge' yet (i.e. still in 'ready'),
    // lock the direction so fireball won't fly to wrong direction
    if ((velocity.x !== 0 || velocity.y !== 0) && (!this.fireballCharging || this.fireballChargeState === 'charge')) {
      // update direction
      this.direction = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI)
    }

    // fireball
    if (this.fireButton.isDown) {
      if (!this.fireballCharging) {
        // new start
        this.fireballCharging = true
        this.fireballing = true
        this.fireballChargeState = 'ready'
        this.fireballChargeStartTime = this.game.time.time
      }
      if (this.game.time.time - this.fireballChargeStartTime > this.FIREBALL_SUPER_CHARGE_TIME) {
        this.fireballChargeState = 'charge-super'
      }
      body.setZeroVelocity()
    } else {
      if (this.fireballCharging) {
        // just released!
        this.fireballCharging = false
        this.fireFireball(this.game.time.time - this.fireballChargeStartTime)
      }
    }

    // healthBar position
    this.healthBar.setPosition(this.x, this.y - 15)

    // finally update the animation
    this.checkAnim()
  }

  fireFireball (chargeTime) {
    let type = 'fireballNormal'
    if (this.fireballChargeState !== 'ready') {
      type = chargeTime > this.FIREBALL_SUPER_CHARGE_TIME ? 'fireballSuper' : 'fireballCharged'
    }

    this.weapons[type].fireAngle = this.direction

    // trackOffset
    this.weapons[type].trackOffset.x = 0
    this.weapons[type].trackOffset.y = 0
    if (this.direction <= 45 && this.direction >= -45) {
      // right
      this.weapons[type].trackOffset.x = 10
    } else if (this.direction <= -135 || this.direction >= 135) {
      // left
      this.weapons[type].trackOffset.x = -10
    }
    if (this.direction >= 45 && this.direction <= 135) {
      // down
      this.weapons[type].trackOffset.y = 10
    } else if (this.direction <= -45 && this.direction >= -135) {
      // up
      this.weapons[type].trackOffset.y = -10
    }

    const bullet = this.weapons[type].fire()
    // bullet can be fales or null if not enough time has expired since the last fire
    if (bullet) { bullet.bulletUID = getBulletUID() }

    // update animation
    this.fireballChargeState = type === 'fireballSuper' ? 'shot-super' : 'shot'
  }

  hit (enemy) {
    if (this.invincible) { return }

    this.hurting = true
    this.health -= enemy.ATK - this.DEF
    updateHealthBar(this)
    if (this.health <= 0) {
      this.dying = true
    }
  }

  myReset (x, y) {
    this.reset(this.game.world.centerX, this.game.world.centerY, this.maxHealth)
    this.hurting = false
    this.dying = false
    this.fireballing = false
    this.fireballCharging = false
    updateHealthBar(this)
    invincibleTimer({ game: this.game, player: this })
  }
}
