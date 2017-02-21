import Enemy from './Enemy'

export default class extends Enemy {
  constructor ({ game, target }) {
    super({ game, asset: 'monster1' })
    this.target = target

    this.animations.add('move', [0, 1, 2, 3, 4], 12, true)
    this.animations.add('attack', [8, 9, 10, 11, 12], 12, true)
    this.animations.add('hurt', [17, 18, 17], 12, false).onComplete.add(() => {
      console.log(this.hurting)
      this.hurting = false
      console.log(this.hurting)
    })
    this.animations.add('death', [16, 17, 18, 19, 20, 21, 22, 23], 15, false).onComplete.add(this.death, this)

    // settings
    this.body.setSize(25, 24, 19, 26)
    this.speed = 60
    this.MIN_DISTANCE = 32
    this.maxHealth = 20
    this.setHealth(20)
  }

  spawn (x, y) {
    this.stdReset(x, y) // Reset everything from Enemy class
    this.play('move')

    // start in a random direction
    // if (Math.random() < 0.5) {
    //   this.body.velocity.x = -this.speed
    // } else {
    //   this.body.velocity.x = this.speed
    // }
  }

  /* The update method will be called automatically by Phaser, just as in the pure Phaser.Sprite class */
  update () {
    if (!this.stdUpdate()) { return } // Do a standard update from Enemy class to check if update should even be done
    // this.game.physics.arcade.collide(this, this.game.collisionLayer)
    // if (this.body.blocked.right) {
    //   this.scale.x = -1
    //   this.body.velocity.x = -this.speed
    // } else if (this.body.blocked.left) {
    //   this.scale.x = 1
    //   this.body.velocity.x = this.speed
    // }

    // Calculate distance to target
    const distance = this.game.math.distance(this.x, this.y, this.target.x, this.target.y)

    if (distance > this.MIN_DISTANCE) {
      // Calculate the angle to the target
      const rotation = this.game.math.angleBetween(this.x, this.y, this.target.x, this.target.y)

      // Calculate velocity vector based on rotation and this.speed
      this.body.velocity.x = Math.cos(rotation) * this.speed
      this.body.velocity.y = Math.sin(rotation) * this.speed

      if (this.body.velocity.x > 0) {
        this.scale.x = 1
      } else {
        this.scale.x = -1
      }
    } else {
      this.body.velocity.setTo(0, 0)
    }

    // finally update the animation
    this.checkAnim()
  }
}
