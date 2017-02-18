import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor ({ game, x, y, asset }) {
    super(game, x, y, asset)
    this.anchor.setTo(0.5, 1)
    // this.scale.setTo(2, 2)

    //  We need to enable physics on the player
    game.physics.arcade.enable(this)

    //  Player physics properties. Give the little guy a slight bounce.
    this.body.bounce.y = 0.2
    this.body.gravity.y = 900
    this.body.collideWorldBounds = true
    // this.body.setSize(18, 28, 23, 26)

    // this.animations.add('idle', [0, 1, 2, 3], 10, true)
    // this.animations.add('walk', [16, 17, 18, 19, 20, 21, 22, 23], 15, true)
    // this.animations.add('power-shot', [80, 81, 82, 83, 84, 85, 86], 12, false)
    this.animations.add('idle', Phaser.Animation.generateFrameNames('Idle (', 1, 15, ').png'), 12, true)
    this.animations.add('walk', Phaser.Animation.generateFrameNames('Walk (', 1, 10, ').png'), 12, true)
    this.animations.add('attack', Phaser.Animation.generateFrameNames('Attack (', 1, 8, ').png'), 12, true)

    this.cursors = game.input.keyboard.createCursorKeys()

    this.animations.play('idle')
  }

  update () {
    //  Reset the players velocity (movement)
    this.body.velocity.x = 0

    if (this.cursors.down.isDown) {
      this.animations.play('attack')
    }
    if (this.cursors.left.isDown) {
      //  Move to the left
      this.body.velocity.x = -150

      this.animations.play('walk')
      this.scale.setTo(-1, 1)
    } else if (this.cursors.right.isDown) {
      //  Move to the right
      this.body.velocity.x = 150

      this.animations.play('walk')
      this.scale.setTo(1, 1)
    } else {
      //  Stand still
      this.animations.play('idle')
    }

    //  Allow the player to jump if they are touching the ground.
    if (this.cursors.up.isDown && this.body.touching.down) {
      this.body.velocity.y = -650
    }
  }
}
