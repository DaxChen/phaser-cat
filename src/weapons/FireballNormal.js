import Weapon from './Weapon'
import { FireballNormalBullet } from './FireballBullets'

export default class FireballNormal extends Weapon {
  constructor ({ game }) {
    super({ game, name: 'Fireball Normal' })

    // must set the bullet class
    this._bulletClass = FireballNormalBullet

    // override settings
    this.bulletSpeed = 300
    this.fireRate = 100
    this.bulletKillDistance = 100

    // finally create bullets
    this.createBullets(10)
  }
}
