import Phaser from 'phaser'
import PIXI from 'pixi'
import { CATEGORY_ENEMY, CATEGORY_BULLET } from '../config'
import { getBulletUID } from './weapon-config'

/**
 * A Bullet is a Phaser.Sprite with physics body enabled, and is fired by a weapon.
 * Because bullets often show and disappear freqeuntly, so we use a `pool` to manage them.
 * In other words, when a bullet is killed, we don't really destroy them,
 * but to mark its `exists` and `visible` to false,
 * and recycle them back to the pool for future use.
 *
 * But!!! For some reason, when using Box2D physics, we can't make the body.kill() to work,
 * Therefore, when this sprite is killed, we fully destroy the Box2D body.
 * And because the body is destroyed, we create new body (via `resetBody`) when reset is called.
 */
export default class Bullet extends Phaser.Sprite {
  constructor ({ game, asset }) {
    super(game, 0, 0, asset)

    // round coordinates, no sub-pixel positions
    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST

    // states to track if the dying animation is playing
    this.dying = false

    // mark this sprite as killed, so won't show in the world
    this.alive = false
    this.exists = false
    this.visible = false

    // these are some settings, you should override them in extended child's constructor
    this.data = {
      bulletManager: null, // this is the Weapon Class holding this bullet
      bulletUID: null, // a UID for this bullet, different on every fire
      fromX: 0, // the point where this was fired
      fromY: 0,
      rotateToVelocity: true, // should this rotate based on the velocity direction
      killType: Phaser.Weapon.KILL_DISTANCE, // the bullet gets killed when flying for a distance
      killDistance: 400,
      flyAnim: '' // the animation played when bullet is fired
    }
  }

  /**
   * creates a new Box2D body, you can overrid this method to set body size and shape.
   * BUT REMEMBER TO CALL `setCollisionCategory` after calling `setCircle/setRectangle/etc`,
   * because it resets the collision category
   */
  resetBody () {
    // create new body
    if (!this.body) {
      this.game.physics.box2d.enable(this)
    }
    // do not react on rotation when colliding with others
    this.body.fixedRotation = true
    // the collision category of this body
    this.body.setCollisionCategory(CATEGORY_BULLET)

    // this.body.bullet = true // wheather to use CCD

    // contact callbacks
    this.body.setCategoryContactCallback(CATEGORY_ENEMY, this.hitEnemy, this)
  }

  /** What animation should be played when the bullet just got reset (fired) */
  resetAnim () {
    if (this.data.flyAnim) {
      this.play(this.data.flyAnim)
    }
  }

  /**
   * Extends the Phaser.Sprite.reset method by calling it first,
   * and calls some other methods to reset physics body and some states.
   *
   * @param {number} x - the x coordinate where this bullet is fired
   * @param {number} y - the y coordinate where this bullet is fired
   */
  reset (x, y) {
    // call the parent method
    Phaser.Sprite.prototype.reset.call(this, x, y)

    this.resetBody()

    this.resetAnim()

    this.dying = false

    return this
  }

  /**
   * This is called when this bullet gets killed.
   * If you call this.kill() here immediately, this sprite will disappear,
   * so you should override this to add death animations.
   */
  preKill () {
    this.dying = true
    this.kill()
  }

  /**
   * Completely destroy the Box2D body by calling destroy
   * and setting this.body to null, so the old body is garbage collected
   */
  killBody () {
    if (this.body) {
      this.body.destroy()
      this.body = null
    }
  }

  /**
   * This overrides Phaser.Sprite.kill,
   * because we want to fully kill the body here, and dispatch the onKill event
   */
  kill () {
    // Completely destroy the body
    this.killBody()

    this.alive = false
    this.exists = false
    this.visible = false

    this.data.bulletUID = null

    this.data.bulletManager.onKill.dispatch(this)

    return this
  }

  /**
   * This is called by the weapon's fire method.
   * Fires this bullet from the `(x, y)` point with the `speed` facing the `angle`.
   */
  fire (x, y, angle, speed) {
    // first reset the sprite and body at this position
    this.reset(x, y)

    // this helper calculates the velocity from the given angle and speed
    // although we are using Box2D physics, this helper method is still okay!
    const v = this.game.physics.arcade.velocityFromAngle(angle, speed)
    this.body.velocity.x = v.x
    this.body.velocity.y = v.y

    // set the initial rotation
    if (this.data.rotateToVelocity) {
      this.body.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x)
    }

    // get a new bulletUID
    this.data.bulletUID = getBulletUID()
  }

  /**
   * Update loop
   * Responsible for checking if the distance between current position and (fromX, fromY)
   * is larger than this.data.killDistance
   */
  update () {
    // return if not exist or dying, because the body is already destroy
    if (!this.exists || this.dying) { return }

    // check distance (x, y) to (fromX, fromY)
    if (this.data.killType === Phaser.Weapon.KILL_DISTANCE) {
      if (this.game.physics.arcade.distanceToXY(this, this.data.fromX, this.data.fromY, true) > this.data.killDistance) {
        this.preKill()
        return // return because body is killed
      }
    }

    // update rotation
    if (this.data.rotateToVelocity) {
      this.body.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x)
    }
  }

  /**
   * The contact callback when bullet hits enemy
   * use body1.sprite, body2.sprite to get sprite
   * @param {Box2D.Body} body1 - the bullet body, so basically this === body1.sprite
   * @param {Box2D.Body} body2 - the enemy body
   * @param {box2d.b2Fixture} fixture1 - the bullet fixture
   * @param {box2d.b2Fixture} fixture2 - the enemy fixture
   * @param {boolean} begin - whether it was a begin or end event the contact object
   */
  hitEnemy (body1, body2, fixture1, fixture2, begin) {
    // we only care about the begin, no the end event
    if (!begin) { return }

    if (body2.sprite) {
      body2.sprite.hit(this)
    }

    // It is possible for the bullet to collide with more than one tile body
    // in the same timestep, in which case this will run twice, so we need to
    // check if the sprite has already been destroyed.
    if (this.exists) {
      this.preKill()
    }
  }
}
