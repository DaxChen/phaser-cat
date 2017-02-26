import Enemy from './Enemy'

export default class DebugEnemy extends Enemy {
  constructor ({ game, target }) {
    super({ game, asset: 'arrow' })
    this.target = target

    // settings
    // this.body.setSize(25, 24, 19, 26)
    this.speed = 60
    this.MIN_DISTANCE = 32
    this.ATTACK_DISTANCE = this.MIN_DISTANCE + 2
    this.ATK = 10
    this.maxHealth = 20
    this.setHealth(20)
  }

  spawn (x, y) {
    this.stdReset(x, y) // Reset everything from Enemy class
  }

  updateRotation () {
    if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
      this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x)
    }
  }

  update () {
    this.stdUpdate()
  }

  checkAttackHit () {
    const distance = this.game.math.distance(this.x, this.y, this.target.x, this.target.y)

    // check if the distance is less than attack distance
    if (distance < this.ATTACK_DISTANCE) {
      this.target.hit(this)
    }
  }
}
