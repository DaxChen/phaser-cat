import Phaser from 'phaser'
import PIXI from 'pixi'
import { CATEGORY_ENEMY, CATEGORY_BULLET } from '../config'
import { getBulletUID } from './weapon-config'

export default class Bullet extends Phaser.Sprite {
  constructor ({ game, asset }) {
    super(game, 0, 0, asset)

    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST

    // physics
    this.resetBody()

    // kill
    this.alive = false
    this.exists = false
    this.visible = false
    this.body.kill()

    // these are relative expensive
    // this.checkWorldBounds = true
    // this.outOfBoundsKill = true

    this.data = {
      bulletManager: null,
      bulletUID: null,
      fromX: 0,
      fromY: 0,
      // bodyDirty: true,
      rotateToVelocity: true,
      killType: Phaser.Weapon.KILL_DISTANCE,
      killDistance: 400
    }
  }

  resetBody () {
    if (!this.body) {
      this.game.physics.box2d.enable(this)
    }
    this.body.fixedRotation = true
    this.body.setCollisionCategory(CATEGORY_BULLET)
    // this.body.bullet = true
    // this.body.sensor = true

    // contact callbacks
    this.body.setCategoryContactCallback(CATEGORY_ENEMY, this.hitEnemy, this)
  }

  reset (x, y, health) {
    Phaser.Sprite.prototype.reset.call(this, x, y, health)

    this.resetBody()

    return this
  }

  kill () {
    this.body.destroy()
    this.body = null

    this.alive = false
    this.exists = false
    this.visible = false
    this.data.bulletUID = null

    this.data.bulletManager.onKill.dispatch(this)

    return this
  }

  fire (x, y, angle, speed, gx, gy) {
    gx = gx || 0
    gy = gy || 0

    this.reset(x, y)
    // this.scale.set(1)

    // although we are using Box2D physics, this helper method is still okay!
    const v = this.game.physics.arcade.velocityFromAngle(angle, speed)
    this.body.velocity.x = v.x
    this.body.velocity.y = v.y

    this.angle = angle

    // first frame rotation
    if (this.data.rotateToVelocity) {
      this.body.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x)
    }

    // this.body.gravity.set(gx, gy)
    this.data.bulletUID = getBulletUID()
  }

  update () {
    if (!this.exists) { return }

    if (this.data.killType > Phaser.Weapon.KILL_LIFESPAN) {
      if (this.data.killType === Phaser.Weapon.KILL_DISTANCE) {
        if (this.game.physics.arcade.distanceToXY(this, this.data.fromX, this.data.fromY, true) > this.data.killDistance) {
          this.kill()
          return
        }
      } else {
        if (!this.data.bulletManager.bulletBounds.intersects(this)) {
          this.kill()
          return
        }
      }
    }

    if (this.data.rotateToVelocity) {
      this.body.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x)
    }

    // if (this.scaleSpeed > 0) {
    //   this.scale.x += this.scaleSpeed
    //   this.scale.y += this.scaleSpeed
    // }
  }

  // body1 is the bullet, body2 is the enemy. use body1.sprite, body2.sprite to get sprite
  hitEnemy (body1, body2, fixture1, fixture2, begin) {
    if (!begin) { return }

    if (body2.sprite) {
      body2.sprite.hit(body1.sprite)
    }

    // It is possible for the bullet to collide with more than one tile body
    // in the same timestep, in which case this will run twice, so we need to
    // check if the sprite has already been destroyed.
    if (body1.sprite) {
      this.kill()
      // this.destroy()
    }
  }
}
