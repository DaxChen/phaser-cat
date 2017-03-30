import Phaser from 'phaser'

/**
 * A weapon is basically a Bullet pool manager,
 * which is a Phaser.Group containing a bunch of bullets and some helper methods.
 *
 * Entend this Class to create new weapon.
 */
export default class Weapon extends Phaser.Group {
  /**
   * @constructor
   * @param {Object} obj - pass in an object
   * @param {Phaser.Game} obj.game - reference to game
   * @param {string} obj.name - the name of this Phaser.Group
   */
  constructor ({ game, name }) {
    super(game, game.world, name)

    // internal time to track if next bullet can be fired
    this._nextFire = 0
    // the bullet flying speed
    this.bulletSpeed = 300
    // the rate you can fire this weapon
    this.fireRate = 100
    // the direction to fire the next bullet (updated before firing)
    this.fireAngle = Phaser.ANGLE_UP
    // the sprite this weapon should be tracking, ie. the player holding this weapon
    this.trackedSprite = null
    // the offset when the bullet is fired, from the center of the trackedSprite
    this.trackOffset = new Phaser.Point()
    // the bullet Class this weapon is using, must be set!
    this._bulletClass = null
    // the bullet will be killed when it reaches a distance from it's fired point
    this.bulletKillType = Phaser.Weapon.KILL_DISTANCE
    this.bulletKillDistance = 200

    // this event will be fired when its bullets are killed
    this.onKill = new Phaser.Signal()

    return this
  }

  /**
   * creates a pool of bullets in this group
   * call this in the extended class's constructor
   */
  createBullets (quantity = 1) {
    for (var i = 0; i < quantity; i++) {
      this.add(new this._bulletClass({ game: this.game }), true)
    }

    this.setAll('bulletManager', this)
    this.setAll('killDistance', this.bulletKillDistance)
  }

  /**
   * Fires a bullet, the direction of the bullet is controlled by `this.fireAngle`,
   * so update that before calling this method
   */
  fire () {
    if (this.game.time.now < this._nextFire) { return }

    const x = this.trackedSprite.x + this.trackOffset.x
    const y = this.trackedSprite.y + this.trackOffset.y

    // check if there's available bullets in the pool
    let bullet = this.getFirstExists(false)
    // if no, create a new one and add it to the pool
    if (!bullet) {
      bullet = new this._bulletClass({ game: this.game })
      bullet.bulletManager = this
      bullet.bulletKillDistance = this.bulletKillDistance
      this.add(bullet, true)
    }

    bullet.fromX = x
    bullet.fromY = y

    bullet.fire(x, y, this.fireAngle, this.bulletSpeed)

    this._nextFire = this.game.time.now + this.fireRate
  }
}
