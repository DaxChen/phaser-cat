import Weapon from './Weapon'
import RifleBullet from './RifleBullet'

export default class Rifle extends Weapon {
  constructor ({ game }) {
    super({ game, name: 'Rifle' })

    // must set the bullet class
    this._bulletClass = RifleBullet

    // override settings
    this.bulletSpeed = 1000
    this.fireRate = 100
    this.bulletKillDistance = 300

    // finally create bullets
    this.createBullets(100)
  }
}
