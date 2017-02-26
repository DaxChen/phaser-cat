import Phaser from 'phaser'
import { ATK as bulletATK } from '../weapons/weapon-config'
import { snapToGrid } from '../utils'
import { gridsize } from '../config'

export default class Enemy extends Phaser.Sprite {

  constructor ({ game, asset }) {
    super(game, 0, 0, asset)
    this.exists = false
    this.anchor.setTo(0.5)
    // body
    game.physics.arcade.enable(this)
    // this.body.immovable = true

    // These are the default settings for the enemy, you should override this!
    this.speed = 60
    this.ATTACK_RANGE = 48

    // this is a collection of bulletUIDs this enemy had hit already
    this.hitBullets = []

    // some states
    this.dying = false // for death animation
    this.hurting = false // for hurt animation
    this.attacking = false // for attack animation

    // there are three moving states: 'moving', 'waiting' and 'turning'
    this.movingState = 'moving'
    // the destination is a Phaser.Point, it is where this creature is heading,
    // when movingState is 'moving', destination should be 'a tile towards the closest player'
    // when movingState is 'turning', this means this enemy is trying to move away from a collision,
    // so destination will be 'a tile away from the original point', and facing 90 degrees clockwise
    this.destination = new Phaser.Point(0, 0)
    // the closest player, this enemy is chasing him, should be updated during destination changes
    this.target = null
    // when movingState is 'waiting', this will be compared with game.time.time
    this.waitingTime = 0
    // when turing, turn to this direction
    this.turningDirection = null
  }

  /* Standard reset is called from the spawn-function (se example enemy later in the tutorial */
  stdReset (x, y) {
    this.reset(x, y, this.maxHealth)
    // this.frozen = false
    // this.energy = this.maxHealth
    this.exists = true
    this.dying = false
    this.hurting = false // for hurt animation
    this.attacking = false // for attack animation
    // this.sleeping = true // the enemy is sleeping, and will cancel it's update
    this.hitBullets = []

    this.updateDestination()
  }

  shouldUpdate () {
    if (!this.exists || this.dying) {
      return false
    }
    // if (this.sleeping) {
    //   if (this.inCamera) { // the enemy is within camera, and wakes up and stays awake even outside camera after this.
    //     this.sleeping = false
    //   }
    //   return false
    // }
    return true // Continue update-loop
  }

  stdUpdate () {
    if (!this.shouldUpdate()) { return }

    // check if can attack
    if (this.game.math.distance(this.x, this.y, this.target.x, this.target.y) <= this.ATTACK_RANGE) {
      this.body.velocity.setTo(0)
      this.attack()
    } else {
      // nope, let's move!
      this.move()
    }
  }

  // you should override this
  attack () {}

  move () {
    if (this.movingState === 'moving') {
      if (this.game.math.distance(this.x, this.y, this.destination.x, this.destination.y) > 3) {
        // Calculate the angle to the target
        const rotation = this.game.math.angleBetween(this.x, this.y, this.destination.x, this.destination.y)

        // Calculate velocity vector based on rotation and this.speed
        this.body.velocity.x = Math.cos(rotation) * this.speed
        this.body.velocity.y = Math.sin(rotation) * this.speed
      } else {
        // this.attacking = this.attacking || 'pre-attack' // TODO attacking should be done somewhere else
        // this.body.velocity.setTo(0, 0)
        this.updateDestination()
      }
    } else if (this.movingState === 'waiting') {
      if (this.game.time.time > this.waitingTime) {
        // times up!
        this.movingState = 'turning'
      } else {
        // to prevent rear collision velocity boost...
        // this.body.velocity.setTo(0)
      }
    } else { // turning
      this.turn()
    }

    // facing
    this.updateRotation()
  }

  wait (collisionVectorX, collisionVectorY) {
    this.movingState = 'waiting'
    this.waitingTime = this.game.time.time + 1000 // TODO waitingTime
    // turningDirection = originalDirection - PI/2
    // console.log('originally facing', Math.atan2(this.body.velocity.y, this.body.velocity.x) * 180 / Math.PI)
    this.turningDirection = Math.atan2(this.body.velocity.y, this.body.velocity.x) + Math.PI / 2
    // console.log('turningDirection', this.turningDirection * 180 / Math.PI)
    this.body.velocity.setTo(0)
  }

  turn () {
    this.destination.setTo(
      snapToGrid(this.x + Math.cos(this.turningDirection) * gridsize),
      snapToGrid(this.y + Math.sin(this.turningDirection) * gridsize)
    )
    this.movingState = 'moving'
  }

  // can be override
  updateRotation () {
    if (this.body.velocity.x > 0) {
      this.scale.x = 1
    } else {
      this.scale.x = -1
    }
  }

  updateDestination () {
    this.updateTarget()
    // angleBetween this and the target
    let targetAngle = this.game.math.angleBetween(this.x, this.y, this.target.x, this.target.y)

    this.destination.setTo(
      snapToGrid(this.x + Math.cos(targetAngle) * gridsize),
      snapToGrid(this.y + Math.sin(targetAngle) * gridsize)
    )
  }

  updateTarget () {
    this.target = this.game.state.states.Game.player // TODO find closest player when doing multiplayer
  }

  hit (bullet) {
    if (this.dying) { // While the enemy sprite plays it's death animation it should ignore all bullets
      return
    }
    // check bulletUID
    if (!bullet.bulletUID) { return console.error('no bulletUID') }
    if (this.hitBullets.indexOf(bullet.bulletUID) >= 0) { return } // already hit by this
    // add to hitBullets
    this.hitBullets.push(bullet.bulletUID)

    // if (bullet.type === 'ice' && !this.frozen) { // Ice will freeze if not frozen, but defrost if the enemy is frozen
    //   this.frozen = true
    //   this.play('frozen')
    // } else {
      // this.frozen = false // I don't care about resetting animation, this should be done by the enemy itself in its now continued update loop
      // this.health -= this.vulnerabilities[bullet.type]
    this.hurting = true

    this.health -= bulletATK[bullet.key]
    // console.log(this.health + '/' + this.maxHealth)
      // if (this.vulnerabilities[bullet.type] === 0) { // A metallic 'klonk' when there is no damage
      //   // this.game.sound.play('ricochetShort')
      // }
    // }

    if (this.health <= 0) {
      this.death()
    }
  }

  death () {
    this.exists = false
  }
}
