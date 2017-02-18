import PIXI from 'pixi'
import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor ({ game, asset }) {
    super(game, 0, 0, asset)

    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST

    this.anchor.setTo(0.5)
    this.animations.add('fly', [0, 1, 2, 3], 8, true)
    this.animations.add('end', [4, 5, 6], 8, true)
    this.animations.play('fly')

    this.checkWorldBounds = true
    this.outOfBoundsKill = true
    this.exists = false

    this.tracking = true
    this.scaleSpeed = 0
  }

  fire (x, y, angle, speed, gx, gy) {
    gx = gx || 0
    gy = gy || 0

    this.reset(x, y)
    this.scale.set(1)

    this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity)

    this.angle = angle

    this.body.gravity.set(gx, gy)
  }

  update () {
    if (this.tracking) {
      this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x)
    }

    if (this.scaleSpeed > 0) {
      this.scale.x += this.scaleSpeed
      this.scale.y += this.scaleSpeed
    }
  }

}
