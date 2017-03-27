import Phaser from 'phaser'
import HealthBar from '../plugins/HealthBar'
import {
  invincibleTimer,
  updateHealthBar
} from '../utils/player-util'
import { getBulletUID } from '../weapons/weapon-config'
import FireballNormal from '../weapons/FireballNormal'
import FireballCharged from '../weapons/FireballCharged'
import FireballSuper from '../weapons/FireballSuper'
import Rifle from '../weapons/Rifle'

export default class CatFighter extends Phaser.Sprite {
  constructor ({ game, x, y, asset }) {
    super(game, x, y, asset)

    // debug
    if (__DEV__) { window.player = this } /* global __DEV__ */

    // enable physics on the player
    game.physics.box2d.enable(this)
    // the body shape of this cat is a rectangle
    this.body.setRectangle(13, 28, -1, 8)
    // do not spin when collide
    this.body.fixedRotation = true

    // animations
    this.initAnimations()

    // weapon
    this.initWeapons()

    // states to determine animations
    this.hurting = false
    this.dying = false
    this.fireballing = false // this determines the animation, not the fireButton pressing
    // the animation part, 'ready'. 'charge', 'charge-super', 'shot' or 'shot-super'
    this.fireballChargeState = 'ready'
    // fireball charge time
    this.fireballCharging = false // this is wheather fireButton is pressing
    this.fireballChargeStartTime = 0
    // direction of fireball, calculated via `Math.atan2`, with the following results:
    // east: 0, north: -90, west: 180, south: 90 this is so wrong... Math.atan2 is (Y, X) not (X, Y)
    // north-east: -45, north-west: -135, south-east: 45, south-west: 135
    this.direction = 0

    // settings
    this.speed = 200 // the walking speed of this player
    this.maxHealth = 100 // the max health of this player
    this.health = this.maxHealth // the current health
    this.DEF = 0 // the defend point
    // how long does the player has to charge to make the fireballSuper
    this.FIREBALL_SUPER_CHARGE_TIME = 1500 // ms

    // setup initial invincible timer, make the player flash and invincible
    invincibleTimer({ game, player: this })

    // the healthBar plugin
    this.healthBar = new HealthBar(this.game, {
      width: 24,
      height: 3,
      bg: { color: '#651828' },
      bar: { color: '#00FF00' }
    })

    // controls
    this.cursors = game.input.keyboard.createCursorKeys()
    this.fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR)
    this.changeWeaponButton = game.input.keyboard.addKey(Phaser.KeyCode.E)
    this.changeWeaponButton.onDown.add(() => { this.changeWeapon() })

    // stop the event from propagating up to the browser
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ])
  }

  initAnimations () {
    const onHurtEnd = () => { this.hurting = false }
    const onDeathEnd = () => {
      this.myReset(this.world.centerX, this.world.centerY, this.maxHealth)
    }
    // rifle
    this.animations.add('rifle-on', [0, 1, 2, 3], 12, false)
      .onComplete.add(() => { this.weaponChanging = false })
    this.animations.add('rifle-off', [3, 2, 1, 0], 12, false)
      .onComplete.add(() => { this.weaponChanging = false })
    this.animations.add('rifle-idle', [16, 17, 18, 19, 20, 21, 22, 23], 12, true)
    this.animations.add('rifle-walk', [48, 49, 50, 51, 52, 53, 54, 55], 30, true)
    this.animations.add('rifle-fire-stand', [32, 33, 34, 35, 36, 37, 38, 39], 30, true)
    this.animations.add('rifle-fire-walk', [64, 65, 66, 67, 68, 69, 70, 71], 30, true)
    this.animations.add('rifle-hurt', [80, 81, 82, 81], 12, false)
      .onComplete.add(onHurtEnd)
    this.animations.add('rifle-death', [80, 81, 82, 83, 84, 85, 86], 12, false)
      .onComplete.add(onDeathEnd)

    // fireball
    this.animations.add('fireball-idle', [96, 97, 98, 99], 12, true)
    this.animations.add('fireball-walk', [112, 113, 114, 115, 116, 117, 118, 119], 30, true)
    this.animations.add('fireball-hurt', [128, 129, 130, 129], 12, false)
      .onComplete.add(onHurtEnd)
    this.animations.add('fireball-death', [128, 129, 130, 131, 132, 133, 134], 12, false)
      .onComplete.add(onDeathEnd)
    this.animations.add('fireball-ready', [144, 145, 146], 12, false)
      .onComplete.add(() => { this.fireballChargeState = 'charge' })
    this.animations.add('fireball-charge', [147, 148], 12, true)
    this.animations.add('fireball-charge-super', [151, 152], 12, true)

    const fireballShotOnComplete = () => {
      this.fireballing = false
      this.fireballChargeState = 'ready'
    }
    this.animations.add('fireball-shot', [149, 150], 12, false)
      .onComplete.add(fireballShotOnComplete)
    this.animations.add('fireball-shot-super', [153, 154, 155, 156, 157, 158], 12, false)
      .onComplete.add(fireballShotOnComplete)
  }

  initWeapons () {
    // weapons
    this.currentWeapon = 'rifle'
    this.weapons = {}

    // fireball
    this.weapons.fireballNormal = new FireballNormal({ game: this.game })
    this.weapons.fireballNormal.trackedSprite = this // let the weapon follow this player
    this.weapons.fireballCharged = new FireballCharged({ game: this.game })
    this.weapons.fireballCharged.trackedSprite = this // let the weapon follow this player
    this.weapons.fireballSuper = new FireballSuper({ game: this.game })
    this.weapons.fireballSuper.trackedSprite = this // let the weapon follow this player

    // rifle
    this.weapons.rifle = new Rifle({ game: this.game })
    this.weapons.rifle.trackedSprite = this
  }

  changeWeapon () {
    if (this.currentWeapon === 'fireball') {
      this.currentWeapon = 'rifle'

      this.fireballCharging = false
      this.fireballing = false
    } else {
      this.currentWeapon = 'fireball'
    }

    this.weaponChanging = true
  }

  /**
   * Called in update, check which animation should be played
   */
  checkAnim () {
    const prefix = this.currentWeapon + '-'
    if (this.currentWeapon === 'fireball') {
      // dying
      if (this.dying) { return this.play(prefix + 'death') }
      // fireballing
      if (this.fireballing) {
        return this.play(`fireball-${this.fireballChargeState}`)
      }
      // hurt
      if (this.hurting) { return this.play(prefix + 'hurt') }
      // changeWeapon
      if (this.weaponChanging) { return this.play('rifle-off') }
      // move
      if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) { return this.play(prefix + 'walk') }
      // idle
      return this.play(prefix + 'idle')
    } else if (this.currentWeapon === 'rifle') {
      // dying
      if (this.dying) { return this.play(prefix + 'death') }
      // hurt
      if (this.hurting) { return this.play(prefix + 'hurt') }
      // changeWeapon
      if (this.weaponChanging) { return this.play('rifle-on') }
      // firing
      if (this.fireButton.isDown) {
        // fire + move
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
          return this.play('rifle-fire-walk')
        }
        // fire + idle
        return this.play('rifle-fire-stand')
      } else {
        // move
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
          return this.play('rifle-walk')
        }
        // idle
        return this.play('rifle-idle')
      }
    }
  }

  update () {
    const { body, cursors, scale, speed } = this
    body.setZeroVelocity()

    // movement cursors
    if (cursors.left.isDown) {
      body.moveLeft(speed)
      scale.setTo(-1, 1)
    } else if (cursors.right.isDown) {
      body.moveRight(speed)
      scale.setTo(1, 1)
    }

    if (cursors.up.isDown) {
      body.moveUp(speed)
    } else if (cursors.down.isDown) {
      body.moveDown(speed)
    }

    const { velocity } = body
    // if just starting to fireball, not 'charge' yet (i.e. still in 'ready'),
    // lock the direction so fireball won't fly to wrong direction
    if ((velocity.x !== 0 || velocity.y !== 0) && (!this.fireballCharging || this.fireballChargeState === 'charge')) {
      // update direction
      this.direction = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI)
    }

    // fireball
    if (this.currentWeapon === 'fireball') {
      if (this.fireButton.isDown) {
        if (!this.fireballCharging) {
          // new start
          this.fireballCharging = true
          this.fireballing = true
          this.fireballChargeState = 'ready'
          this.fireballChargeStartTime = this.game.time.time
        }
        if (this.game.time.time - this.fireballChargeStartTime > this.FIREBALL_SUPER_CHARGE_TIME) {
          this.fireballChargeState = 'charge-super'
        }
        body.setZeroVelocity()
      } else {
        if (this.fireballCharging) {
          // just released!
          this.fireballCharging = false
          this.fireFireball(this.game.time.time - this.fireballChargeStartTime)
        }
      }
    } else if (this.currentWeapon === 'rifle') {
      if (this.fireButton.isDown) {
        this.fireRifle()
      }
    }

    // healthBar position
    this.healthBar.setPosition(this.x, this.y - 15)

    // finally update the animation
    this.checkAnim()
  }

  fireFireball (chargeTime) {
    let type = 'fireballNormal'
    if (this.fireballChargeState !== 'ready') {
      type = chargeTime > this.FIREBALL_SUPER_CHARGE_TIME ? 'fireballSuper' : 'fireballCharged'
    }

    this.weapons[type].fireAngle = this.direction

    // trackOffset
    this.weapons[type].trackOffset.x = 0
    this.weapons[type].trackOffset.y = 0
    if (this.direction <= 45 && this.direction >= -45) {
      // right
      this.weapons[type].trackOffset.x = 10
    } else if (this.direction <= -135 || this.direction >= 135) {
      // left
      this.weapons[type].trackOffset.x = -10
    }
    if (this.direction >= 45 && this.direction <= 135) {
      // down
      this.weapons[type].trackOffset.y = 20
    } else if (this.direction <= -45 && this.direction >= -135) {
      // up
      this.weapons[type].trackOffset.y = -10
    }

    const bullet = this.weapons[type].fire()
    // bullet can be fales or null if not enough time has expired since the last fire
    if (bullet) { bullet.bulletUID = getBulletUID() }

    // update animation
    this.fireballChargeState = type === 'fireballSuper' ? 'shot-super' : 'shot'
  }

  fireRifle () {
    const { rifle } = this.weapons
    rifle.fireAngle = this.direction
    // trackOffset
    rifle.trackOffset.x = 0
    rifle.trackOffset.y = 8
    if (this.direction <= 45 && this.direction >= -45) {
      // right
      rifle.trackOffset.x += 10
    } else if (this.direction <= -135 || this.direction >= 135) {
      // left
      rifle.trackOffset.x -= 10
    }
    if (this.direction >= 45 && this.direction <= 135) {
      // down
      rifle.trackOffset.y += 10
    } else if (this.direction <= -45 && this.direction >= -135) {
      // up
      rifle.trackOffset.y -= 20
    }

    const bullet = rifle.fire()
    // bullet can be fales or null if not enough time has expired since the last fire
    if (bullet) { bullet.bulletUID = getBulletUID() }
  }

  hit (enemy) {
    if (this.invincible) { return }

    this.hurting = true
    this.health -= enemy.ATK - this.DEF
    updateHealthBar(this)
    if (this.health <= 0) {
      this.dying = true
    }
  }

  myReset (x, y) {
    this.reset(this.game.world.centerX, this.game.world.centerY, this.maxHealth)
    this.hurting = false
    this.dying = false
    this.fireballing = false
    this.fireballCharging = false
    updateHealthBar(this)
    invincibleTimer({ game: this.game, player: this })
  }
}
