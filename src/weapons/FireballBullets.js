import Phaser from 'phaser'
import Bullet from './Bullet'

export class FireballNormalBullet extends Bullet {
  constructor ({ game }) {
    super({ game, asset: 'fireball_normal' })

    // customBody
    this.body.setRectangle(12, 12, 8, 0)
  }
}

export class FireballChargedBullet extends Bullet {
  constructor ({ game }) {
    super({ game, asset: 'fireball_charged' })

    // customBody
    this.body.setRectangle(16, 12, 4, 0)
  }
}

export class FireballSuperBullet extends Bullet {
  constructor ({ game }) {
    super({ game, asset: 'fireball_super' })

    // customBody
    this.body.setRectangle(16, 12, 4, 0)
  }
}
