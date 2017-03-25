import Weapon from './Weapon'
import { FireballSuperBullet } from './FireballBullets'

export default class FireballSuper extends Weapon {
  constructor ({ game }) {
    super({ game, name: 'Fireball Super' })

    // must set the bullet class
    this._bulletClass = FireballSuperBullet

    // override settings
    this.bulletSpeed = 900
    this.fireRate = 100
    this.bulletKillDistance = 300

    // finally create bullets
    this.createBullets(1)
  }
}
