import Enemy from './Enemy'

export default class Monster1 extends Enemy {
  constructor ({ game }) {
    super({ game, asset: 'monster1' })

    // physics
    this.body.setCircle(13, 0, 3)

    // configs
    this.MOVE_SPEED = 100
    this.ATTACK_RANGE = 36
    this.ATK = 10
    this.maxHealth = 20

    this.initAnimations()
  }

  initAnimations () {
    this.animations.add('move', [0, 1, 2, 3, 4], 12, true)
    this.animations.add('pre-attack', [8, 9, 10], 10, false)
      .onComplete.add(() => {
        this.attacking = 'post-attack'
        this.checkAttackHit()
      })
    this.animations.add('post-attack', [11, 12], 10, false)
      .onComplete.add(() => { this.attacking = false })
    this.animations.add('hurt', [17, 18, 17], 12, false)
      .onComplete.add(() => { this.hurting = false })
    this.animations.add('death', [16, 17, 18, 19, 20, 21, 22, 23], 15, false)
      .onComplete.add(() => {
        this.kill()
        this.body.kill()
      })
  }

  spawn (x, y) {
    this.stdReset(x, y) // Reset everything from Enemy class
    this.play('move')
  }

  update () {
    this.stdUpdate() // use default update in Enemy.js

    this.stdCheckAnim()
  }

  attack () {
    this.attacking = this.attacking || 'pre-attack'
    this.stop()
  }

  checkAttackHit () {
    const distance = this.game.math.distance(this.x, this.y, this.target.x, this.target.y)

    // check if the distance is less than attack distance
    if (distance < this.ATTACK_RANGE + 5) { // TODO how to handle offset
      this.target.hit(this)
    }
  }

  // @Override death to play animation
  death () {
    this.dying = true
    this.stop()
  }
}
