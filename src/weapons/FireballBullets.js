import Bullet from './Bullet'
import { CATEGORY_BULLET } from '../config'

export class FireballNormalBullet extends Bullet {
  constructor ({ game }) {
    super({ game, asset: 'fireball_normal' })

    // customBody
    this.body.setRectangle(12, 12, 8, 0)
  }
  resetBody () {
    Bullet.prototype.resetBody.call(this)
    this.body.setRectangle(12, 12, 8, 0)
    this.body.setCollisionCategory(CATEGORY_BULLET)
  }
}

export class FireballChargedBullet extends Bullet {
  constructor ({ game }) {
    super({ game, asset: 'fireball_charged' })

    // customBody
    this.body.setRectangle(16, 12, 4, 0)
  }
  resetBody () {
    Bullet.prototype.resetBody.call(this)
    this.body.setRectangle(16, 12, 4, 0)
    this.body.setCollisionCategory(CATEGORY_BULLET)
  }
}

export class FireballSuperBullet extends Bullet {
  constructor ({ game }) {
    super({ game, asset: 'fireball_super' })

    // customBody
    this.body.setRectangle(16, 12, 4, 0)
  }
  resetBody () {
    Bullet.prototype.resetBody.call(this)
    this.body.setRectangle(16, 12, 4, 0)
    this.body.setCollisionCategory(CATEGORY_BULLET)
  }
}
