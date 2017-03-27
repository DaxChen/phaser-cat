import Bullet from './Bullet'
import { CATEGORY_BULLET } from '../config'

export class FireballNormalBullet extends Bullet {
  constructor ({ game }) {
    super({ game, asset: 'fireball_normal' })

    this.animations.add('fly', [0, 1, 2, 3], 12, true)
    this.animations.add('end', [4, 5, 6], 12, false)
      .onComplete.add(() => this.kill())

    this.data.ATK = 10
    this.data.flyAnim = 'fly'
  }
  resetBody () {
    Bullet.prototype.resetBody.call(this)
    this.body.setRectangle(12, 12, 8, 0)
    this.body.setCollisionCategory(CATEGORY_BULLET)
  }
  preKill () {
    this.dying = true
    this.killBody()
    this.play('end')
  }
}

export class FireballChargedBullet extends Bullet {
  constructor ({ game }) {
    super({ game, asset: 'fireball_charged' })

    this.animations.add('fly', [0, 1, 2, 3], 12, true)
    this.animations.add('end', [4, 5, 6], 12, false)
      .onComplete.add(() => this.kill())

    this.data.ATK = 20
    this.data.flyAnim = 'fly'
  }
  resetBody () {
    Bullet.prototype.resetBody.call(this)
    this.body.setRectangle(16, 16, 4, 0)
    this.body.setCollisionCategory(CATEGORY_BULLET)
  }
  preKill () {
    this.dying = true
    this.killBody()
    this.play('end')
  }
}

export class FireballSuperBullet extends Bullet {
  constructor ({ game }) {
    super({ game, asset: 'fireball_super' })

    this.animations.add('fly', [0, 1, 2, 3], 12, true)
    this.animations.add('end', [4, 5, 6], 12, false)
      .onComplete.add(() => this.kill())

    this.data.ATK = 40
    this.data.flyAnim = 'fly'
  }
  resetBody () {
    Bullet.prototype.resetBody.call(this)
    this.body.setRectangle(16, 42, 4, 2)
    this.body.setCollisionCategory(CATEGORY_BULLET)
  }
  preKill () {
    this.dying = true
    this.killBody()
    this.play('end')
  }
}
