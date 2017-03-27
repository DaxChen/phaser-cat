import Phaser from 'phaser'
import { CATEGORY_ENEMY } from '../config'

export default class Enemy extends Phaser.Sprite {
  constructor ({ game, asset }) {
    super(game, 0, 0, asset)

    this.kill()

    // default settings of enemy, you should override these
    this.MOVE_SPEED = 50
    this.ATTACK_RANGE = 40
    this.ATK = 1
    this.BASE_SCORE = 1
    this.maxHealth = 1

    // some variables
    this.hitBullets = [] // this is a collection of bulletUIDs this enemy had hit already
    this.target = null // the target currently chasing/attacking

    // some states
    this.dying = false // for death animation
    this.hurting = false // for hurt animation
    this.attacking = false // for attack animation
  }

  resetBody () {
    if (!this.body) {
      this.game.physics.box2d.enable(this)
    }
    // physics
    this.body.setCollisionCategory(CATEGORY_ENEMY)
    this.body.fixedRotation = true
  }

  /* Standard reset is called from the spawn-function (se example enemy later in the tutorial */
  stdReset (x, y) {
    this.reset(x, y, this.maxHealth)
    this.resetBody()

    this.dying = false
    this.hurting = false // for hurt animation
    this.attacking = false // for attack animation
    this.hitBullets = []
    this.updateTarget() // TODO do we need this?
  }

  shouldUpdate () {
    return this.exists && !this.dying
  }

  stdUpdate () {
    if (!this.shouldUpdate()) { return }

    // check if can attack
    if (this.game.math.distance(this.x, this.y, this.target.x, this.target.y) <= this.ATTACK_RANGE) {
      this.stop()
      this.attack()
    } else {
      // nope, let's move!
      this.move()
    }
  }

  stdCheckAnim () {
    // dying
    if (this.dying) { return this.play('death') }

    // hurting
    if (this.hurting) { return this.play('hurt') }

    // attacking
    if (this.attacking) { return this.play(this.attacking) }

    // else
    this.play('move')
  }

  updateRotation () {
    if (this.body.velocity.x > 0) {
      this.scale.x = this.scale.x < 0 ? -this.scale.x : this.scale.x
    } else {
      this.scale.x = this.scale.x < 0 ? this.scale.x : -this.scale.x
    }
  }

  updateTarget () {
    this.target = this.game.state.states.Game.player // TODO find closest player when doing multiplayer
  }

  /**************************************************
  *    ACTIONS (move, stop, attack, hit, etc.)
  **************************************************/
  move () {
    const rotation = this.game.math.angleBetween(this.x, this.y, this.target.x, this.target.y)

    // Calculate velocity vector based on rotation and this.speed
    this.body.velocity.x = Math.cos(rotation) * this.MOVE_SPEED
    this.body.velocity.y = Math.sin(rotation) * this.MOVE_SPEED

    this.updateRotation()
  }

  stop () {
    this.body.setZeroVelocity()
  }

  attack () {}

  hit (bullet) {
    if (!bullet || this.dying) { // While the enemy sprite plays it's death animation it should ignore all bullets
      return
    }
    // check bulletUID
    if (!bullet.data.bulletUID) { return console.error('no bulletUID') }
    if (this.hitBullets.indexOf(bullet.data.bulletUID) >= 0) { return } // already hit by this
    // add to hitBullets
    this.hitBullets.push(bullet.data.bulletUID)

    this.hurting = true

    this.health -= bullet.data.ATK
    // console.log(this.health + '/' + this.maxHealth)

    if (this.health <= 0) {
      this.parent.onChildKill.dispatch(this)
      this.stop()
      this.death() // we call death here, if you have dying animation, override the death method
    }
  }

  death () {
    this.kill()
    this.body.destroy()
    this.body = null
  }
}
