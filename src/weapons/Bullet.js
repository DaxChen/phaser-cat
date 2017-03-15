import Phaser from 'phaser'
import PIXI from 'pixi'

export default class Bullet extends Phaser.Sprite {
  constructor ({ game, asset }) {
    super(game, 0, 0, asset)

    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST

    // physics
    game.physics.box2d.enable(this)
    this.body.fixedRotation = true
    this.body.setCollisionCategory(2) // this is a bitmask
    this.body.sensor = true // TODO ?????

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
      fromX: 0,
      fromY: 0,
      // bodyDirty: true,
      rotateToVelocity: true,
      killType: Phaser.Weapon.KILL_DISTANCE,
      killDistance: 800
    }
  }

  kill () {
    this.alive = false
    this.exists = false
    this.visible = false
    this.body.kill()

    this.data.bulletManager.onKill.dispatch(this)

    return this
  }

  fire (x, y, angle, speed, gx, gy) {
    gx = gx || 0
    gy = gy || 0

    this.reset(x, y)
    this.scale.set(1)

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
  }

  update () {
    if (!this.exists) { return }

    if (this.data.killType > Phaser.Weapon.KILL_LIFESPAN) {
      if (this.data.killType === Phaser.Weapon.KILL_DISTANCE) {
        if (this.game.physics.arcade.distanceToXY(this, this.data.fromX, this.data.fromY, true) > this.data.killDistance) {
          this.kill()
        }
      } else {
        if (!this.data.bulletManager.bulletBounds.intersects(this)) {
          this.kill()
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
}
