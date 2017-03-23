import Phaser from 'phaser'
import Bullet from './Bullet'

export default class Weapon extends Phaser.Group {
  constructor ({ game, name = 'Weapon Group', bulletClass }) {
    super(game, game.world, name)

    this.shots = 0
    this.fireLimit = 0
    this.fireRate = 300
    this.fireAngle = Phaser.ANGLE_UP
    this.bulletAngleOffset = 0
    this.bulletAngleVariance = 0
    this.bulletSpeed = 600
    this.bulletKillDistance = 0
    this.bulletRotateToVelocity = false
    this.bulletKey = bulletKey

    this._bulletClass = bulletClass
    this._bulletCollideWorldBounds = false
    this.bounds = new Phaser.Rectangle()
    this.bulletBounds = game.world.bounds

    this.onFire = new Phaser.Signal()
    this.onKill = new Phaser.Signal()
    this.onFireLimit = new Phaser.Signal()

    this.trackedSprite = null
    this.trackRotation = false
    this.trackOffset = new Phaser.Point()

    this._nextFire = 0
    this._rotatedPoint = new Phaser.Point()

    for (var i = 0; i < 10; i++) {
      this.add(new bulletClass({ game }), true)
    }
  }

  createBullets ({ quantity, key, group }) {
    if (quantity === undefined) { quantity = 1 }
    if (group === undefined) { group = this.game.world }

    if (!this.bullets) {
      this.bullets = this.game.add.physicsGroup(Phaser.Physics.BOX2D, group) // TODO bullets already have enable
      this.bullets.classType = this._bulletClass
    }

    if (quantity !== 0) {
      if (quantity === -1) {
        this.autoExpandBulletsGroup = true
        quantity = 1
      }

      this.bullets.createMultiple(quantity, key)

      this.bullets.setAll('data.bulletManager', this)

      this.bulletKey = key
    }

    return this
  }

  fire (x, y) {
    if (this.game.time.time < this._nextFire || (this.fireLimit > 0 && this.shots === this.fireLimit)) { return }

    let bullet = this.getFirstExists(false)
    if (!bullet) {
      bullet = new Bullet({ game: this.game, asset: this.bulletKey })
      this.add(bullet, true)
    }
    bullet.fire(x, y)
  }
}
