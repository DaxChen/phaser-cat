import Enemy from './Enemy'

export default class Monster1 extends Enemy {
  constructor ({ game, target }) {
    super({ game, asset: 'monster1' })
    this.target = target

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
      .onComplete.add(() => { this.exists = false })

    // settings
    this.body.setSize(25, 24, 19, 26)
    this.speed = 60
    this.ATTACK_RANGE = 32
    this.ATK = 10
    this.maxHealth = 20
    this.setHealth(20)
  }

  spawn (x, y) {
    this.stdReset(x, y) // Reset everything from Enemy class
    this.play('move')
  }

  update () {
    if (!this.shouldUpdate()) { return } // Do a standard update from Enemy class to check if update should even be done

    // check if can attack
    console.log(Math.round(this.game.math.distance(this.x, this.y, this.target.x, this.target.y)), this.ATTACK_RANGE)
    if (this.game.math.distance(this.x, this.y, this.target.x, this.target.y) <= this.ATTACK_RANGE) {
      this.body.velocity.setTo(0)
      this.attack()
    } else {
      // nope, let's move!
      this.move()
    }

    // finally update the animation
    this.checkAnim()
  }

  attack () {
  }

  checkAnim () {
    // console.log(`checkAnim: dying:${this.dying}, hurting:${this.hurting}, attacking:${this.attacking}`)
    // when this.dying, stdUpdate returns false, checkAnim won't be called...
    // if (this.dying) { return this.play('death') }

    // hurting
    if (this.hurting) { return this.play('hurt') }

    // attacking
    if (this.attacking) { return this.play(this.attacking) }

    // else
    this.play('move')
  }

  checkAttackHit () {
    const distance = this.game.math.distance(this.x, this.y, this.target.x, this.target.y)

    // check if the distance is less than attack distance
    if (distance < this.ATTACK_RANGE + 3) { // TODO the offset 3
      this.target.hit(this)
    }
  }

  // @Override death to play animation
  death () {
    this.dying = true
    // we have to play animation here because stdUpdate will return false when dying
    this.play('death')
    this.body.velocity.x = 0
    this.body.velocity.y = 0
  }
}
