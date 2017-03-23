import Phaser from 'phaser'
import { FireballNormalBullet } from './FireballBullets'

export default class FireballNormal extends Phaser.Group {
  constructor ({ game }) {
    super(game, game.world, 'Fireball Normal')

    this._nextFire = 0
    this.bulletSpeed = 600
    this.fireRate = 100
    this.fireAngle = Phaser.ANGLE_UP
    this.trackedSprite = null
    this.trackOffset = new Phaser.Point()
    this._bulletClass = FireballNormalBullet
    this.bulletKillType = Phaser.Weapon.KILL_DISTANCE
    this.bulletKillDistance = 100

    this.onKill = new Phaser.Signal()

    this.createBullets()

    return this
  }

  createBullets () {
    for (var i = 0; i < 30; i++) {
      this.add(new this._bulletClass({ game: this.game }), true)
    }

    this.setAll('data.bulletManager', this)
  }

  fire () {
    if (this.game.time.now < this.nextFire) { return }

    const x = this.trackedSprite.x + this.trackOffset.x
    const y = this.trackedSprite.y + this.trackOffset.y

    let bullet = this.getFirstExists(false)
    if (!bullet) {
      bullet = new this._bulletClass({ game: this.game })
      bullet.data.bulletManager = this
      this.add(bullet, true)
    }

    bullet.data.fromX = x
    bullet.data.fromY = y

    bullet.fire(x, y, this.fireAngle, this.bulletSpeed, 0, 0)

    this.nextFire = this.game.time.now + this.fireRate
  }
}
