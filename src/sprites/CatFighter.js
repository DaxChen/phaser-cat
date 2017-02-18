import Phaser from 'phaser'
import FireballNormal from '../weapons/FireballNormal'

export default class extends Phaser.Sprite {

  constructor ({ game, x, y, asset }) {
    super(game, x, y, asset)

    //  We need to enable physics on the player
    game.physics.arcade.enable(this)

    //  Player physics properties. Give the little guy a slight bounce.
    // this.body.bounce.y = 0.2
    // this.body.gravity.y = 900
    this.body.collideWorldBounds = true

    // settings
    this.anchor.setTo(0.5, 0.5)
    this.body.setSize(13, 28, 24, 26)
    // this.scale.setTo(2, 2)
    this.speed = 150

    // direction is defined as
    // east: 0, north: -90 or 270, west: +_180, south: 90
    // north-east: -45, north-west: -135, south-east: 45, south-west: 135
    this.direction = 0

    // animations
    this.animations.add('idle', [0, 1, 2, 3], 10, true)
    this.animations.add('walk', [16, 17, 18, 19, 20, 21, 22, 23], 16, true)
    this.animations.add('power-shot', [80, 81, 82, 83, 84, 85, 86], 12, false)

    // weapons
    this.currentWeapon = 'fireball'
    this.weapons = {}
    this.weapons.fireball = new FireballNormal(game)

    // camara
    // the camera will follow the player in the world
    this.game.camera.follow(this)

    // controls
    this.cursors = game.input.keyboard.createCursorKeys()
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ])

    this.animations.play('idle')
  }

  update () {
    //  Reset the players velocity (movement)
    const { velocity } = this.body
    velocity.set(0)

    if (this.cursors.left.isDown) {
      //  Move to the left
      velocity.x = -this.speed
      // this.scale.setTo(-1, 1)
      this.animations.play('walk')
    } else if (this.cursors.right.isDown) {
      //  Move to the right
      velocity.x = this.speed
      this.scale.setTo(1, 1)
      this.animations.play('walk')
    }

    if (this.cursors.up.isDown) {
      //  Move to the left
      velocity.y = -this.speed
      this.animations.play('walk')
    } else if (this.cursors.down.isDown) {
      //  Move to the right
      velocity.y = this.speed
      this.animations.play('walk')
    }

    if (velocity.x === 0 && velocity.y === 0) {
      //  Stand still
      this.animations.play('idle')
    } else {
      // update direction
      this.direction = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI)
    }

    if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      this.weapons[this.currentWeapon].fire(this)
    }
  }
}
