import Phaser from 'phaser'

export default class extends Phaser.Sprite {

  constructor ({ game, asset }) {
    super(game, 0, 0, asset)
    this.exists = false
    this.anchor.setTo(0.5)
    // body
    game.physics.arcade.enable(this)
    // this.body.immovable = true

    // settings
    // this.body.setSize(13, 28, 24, 26)
    // this.scale.setTo(2, 2)
    // this.speed = 150
  }

  /* Standard reset is called from the spawn-function (se example enemy later in the tutorial */
  stdReset (x, y) {
    this.reset(x, y)
    // this.frozen = false
    // this.energy = this.maxHealth
    this.exists = true
    this.dying = false
    this.sleeping = true // the enemy is sleeping, and will cancel it's update
  }

  /* stdUpdate is called from the enemies' update methods to do generic stuff. If it return false the update loop in the enemy calling stdUpdate should be broken. */
  stdUpdate () {
    if (!this.exists || this.dying) {
      return false
    }
    if (this.sleeping) {
      if (this.inCamera) { // the enemy is within camera, and wakes up and stays awake even outside camera after this.
        this.sleeping = false
      }
      return false
    }
    return true // Continue update-loop
  }

  hit (bullet) {
    if (this.dying) { // While the enemy sprite plays it's death animation it should ignore all bullets
      return
    }
    // if (bullet.type === 'ice' && !this.frozen) { // Ice will freeze if not frozen, but defrost if the enemy is frozen
    //   this.frozen = true
    //   this.play('frozen')
    // } else {
      // this.frozen = false // I don't care about resetting animation, this should be done by the enemy itself in its now continued update loop
      // this.health -= this.vulnerabilities[bullet.type]
    this.health -= 10 // TODO
      // if (this.vulnerabilities[bullet.type] === 0) { // A metallic 'klonk' when there is no damage
      //   // this.game.sound.play('ricochetShort')
      // }
    // }

    if (this.health < 1) {
      this.dying = true
      this.body.velocity.x = 0
      this.body.velocity.y = 0
      this.play('death')
    }
  }

  death () {
    this.exists = false
  }
}
