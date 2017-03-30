import Enemy from './Enemy'
import { CATEGORY_ENEMY } from '../config'
import MonsterBossWeapon from '../weapons/MonsterBossWeapon'

export default class MonsterBoss extends Enemy {
  constructor ({ game }) {
    super({ game, asset: 'monster_boss' })

    // BIG!!!
    this.scale.setTo(2)

    // configs
    this.MOVE_SPEED = 60
    this.ATTACK_RANGE = 300
    // this.ATK = 10
    this.BASE_SCORE = 100
    this.maxHealth = 50

    this.initAnimations()
    // init weapon
    this.weapon = new MonsterBossWeapon({ game })
    this.weapon.trackedSprite = this
  }

  resetBody () {
    Enemy.prototype.resetBody.call(this)

    // physics
    // this.body.setRectangle(20, 34, 0, 4) // this resets `setCollisionCategory`, so let's call it again
    this.body.setRectangle(40, 68, 0, 8) // this resets `setCollisionCategory`, so let's call it again
    this.body.setCollisionCategory(CATEGORY_ENEMY)
  }

  initAnimations () {
    this.animations.add('move', [16, 17, 18, 19, 20, 21, 22, 23, 24], 12, true)
    this.animations.add('pre-attack', [48, 49, 50, 51, 52, 53, 54, 55, 56, 57], 12, false)
      .onComplete.add(() => {
        this.attacking = 'post-attack'
        this.fireBullet()
      })
    this.animations.add('post-attack', [58, 59, 60, 61], 12, false)
      .onComplete.add(() => { this.attacking = false })
    this.animations.add('hurt', [65, 66, 65], 12, false)
      .onComplete.add(() => { this.hurting = false })
    this.animations.add('death', [64, 65, 66, 67, 68, 69, 70, 71], 15, false)
      .onComplete.add(() => {
        this.kill()
      })
  }

  spawn (x, y) {
    this.stdReset(x, y) // Reset everything from Enemy class
    this.play('move')
  }

  // override this so the facing is towards the trackedSprite
  updateRotation () {
    if (this.x > this.target.x) {
      this.scale.x = this.scale.x < 0 ? -this.scale.x : this.scale.x
    } else {
      this.scale.x = this.scale.x < 0 ? this.scale.x : -this.scale.x
    }
  }
  update () {
    this.stdUpdate() // use default update in Enemy.js

    this.stdCheckAnim()

    if (this.shouldUpdate()) {
      this.updateRotation()
    }
  }

  attack () {
    this.attacking = this.attacking || 'pre-attack'
    this.stop()
  }

  fireBullet () {
    const rad = this.game.math.angleBetween(this.x, this.y, this.target.x, this.target.y)
    this.weapon.fireAngle = this.game.math.radToDeg(rad)
    this.weapon.trackOffset.setTo(
      Math.cos(rad) * 35 * Math.abs(this.scale.x),
      Math.sin(rad) * 35 * Math.abs(this.scale.y)
    )
    this.weapon.fire()
  }

  // @Override death to play animation
  death () {
    this.dying = true
    this.stop()
    this.body.destroy()
    this.body = null
  }
}
