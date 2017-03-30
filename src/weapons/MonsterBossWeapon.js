// import Phaser from 'phaser'
import Weapon from './Weapon'
import MonsterBossBullet from './MonsterBossBullet'

export default class MonsterBossWeapon extends Weapon {
  constructor ({ game }) {
    super({ game, name: 'MonsterBossWeapon' })

    // must set the bullet class
    this._bulletClass = MonsterBossBullet

    // override settings
    this.bulletSpeed = 200
    // this.fireRate = 100
    this.bulletKillDistance = 500

    // finally create bullets
    this.createBullets(5)
  }
}
