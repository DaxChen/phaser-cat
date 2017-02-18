import PIXI from 'pixi'
import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor ({ game, asset }) {
    super(game, 0, 0, asset)

    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST

    this.anchor.setTo(0.5)
    this.animations.add('move', [0, 1, 2, 3, 4], 12, true)
    this.animations.play('move')

    this.checkWorldBounds = true
    this.outOfBoundsKill = true
    this.exists = false
  }

  update () {
  }

  spawn (x, y) {
    this.reset(x, y)
  }
}
