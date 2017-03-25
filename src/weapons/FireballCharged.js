import Weapon from './Weapon'
import { FireballChargedBullet } from './FireballBullets'

export default class FireballCharged extends Weapon {
  constructor ({ game }) {
    super({ game, name: 'Fireball Charged' })

    // must set the bullet class
    this._bulletClass = FireballChargedBullet

    // override settings
    this.bulletSpeed = 600
    this.fireRate = 100
    this.bulletKillDistance = 200

    // finally create bullets
    this.createBullets(2)
  }
}
