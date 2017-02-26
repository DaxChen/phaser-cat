import Phaser from 'phaser'
import HealthBar from '../plugins/HealthBar'
import {
  invincibleTimer,
  updateHealthBar
} from '../utils/player-util'
import { getBulletUID } from '../weapons/weapon-config'

export default class CatFighter extends Phaser.Sprite {

  constructor ({ game, x, y, asset }) {
    super(game, x, y, asset)

    //  We need to enable physics on the player
    game.physics.arcade.enable(this)

    //  Player physics properties. Give the little guy a slight bounce.
    // this.body.bounce.y = 0.2
    // this.body.gravity.y = 900
    this.body.collideWorldBounds = true

    // settings
    this.anchor.setTo(0.5, 0.5)
    this.body.setSize(13, 28, 24, 26)
    // this.scale.setTo(2, 2)
    this.speed = 150

    // direction is calculated via `Math.atan2`, with the following results:
    // east: 0, north: -90, west: 180, south: 90 this is so wrong... Math.atan2 is (Y, X) not (X, Y)
    // north-east: -45, north-west: -135, south-east: 45, south-west: 135
    this.direction = 0

    // animations
    this.animations.add('idle', [0, 1, 2, 3], 12, true)
    this.animations.add('walk', [16, 17, 18, 19, 20, 21, 22, 23], 16, true)
    this.animations.add('hurt', [64, 65, 66, 65], 12, false)
      .onComplete.add(() => { this.hurting = false })
    this.animations.add('death', [64, 65, 66, 67, 68, 69, 70], 12, false)
      .onComplete.add(() => { this.myReset(this.world.centerX, this.world.centerY, this.maxHealth) })
    this.animations.add('fireball-ready', [80, 81, 82], 12, false)
      .onComplete.add(() => { this.fireballChargeState = 'charge' })
    this.animations.add('fireball-charge', [83, 84], 12, true)
    this.animations.add('fireball-charge-super', [87, 88], 12, true)
    const fireballShotOnComplete = () => {
      this.fireballing = false
      this.fireballChargeState = 'ready'
    }
    this.animations.add('fireball-shot', [85, 86], 12, false)
      .onComplete.add(fireballShotOnComplete)
    this.animations.add('fireball-shot-super', [89, 90, 91, 92, 93, 94], 12, false)
      .onComplete.add(fireballShotOnComplete)
    this.animations.play('idle')
    // states to determine animations
    this.hurting = false
    this.dying = false
    this.fireballing = false // this determines the animation, not the fireButton pressing
    // the animation part, 'ready'. 'charge', 'charge-super', 'shot' or 'shot-super'
    this.fireballChargeState = 'ready'
    // fireball charge time
    this.fireballCharging = false // this is wheather fireButton is pressing
    this.fireballChargeStartTime = 0

    // setup initial invincible timer
    invincibleTimer({ game, player: this })

    // healthBar
    this.healthBar = new HealthBar(this.game, {
      width: 24,
      height: 3,
      bg: { color: '#651828' },
      bar: { color: '#00FF00' }
    })

    // settings
    this.maxHealth = 100
    this.health = this.maxHealth
    this.DEF = 0
    this.FIREBALL_SUPER_CHARGE_TIME = 1500

    // weapons
    this.currentWeapon = 'fireball'
    this.weapons = {}
    this.initFireball()

    // camara
    // the camera will follow the player in the world
    this.game.camera.follow(this)

    // controls
    this.cursors = game.input.keyboard.createCursorKeys()
    this.fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR)
    // stop the event from propagating up to the browser
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ])
  }

  initFireball () {
    // Creates 30 bullets, using the 'bullet' graphic
    this.weapons.fireballNormal = this.game.add.weapon(6, 'fireball_normal')
    this.weapons.fireballCharged = this.game.add.weapon(1, 'fireball_charged')
    this.weapons.fireballSuper = this.game.add.weapon(1, 'fireball_super')

    const { fireballNormal, fireballCharged, fireballSuper } = this.weapons
    // auto expand if bullets not enough (all bullets are in flight)
    fireballNormal.autoExpandBulletsGroup = true
    fireballCharged.autoExpandBulletsGroup = true
    fireballSuper.autoExpandBulletsGroup = true
    // The bullet will be automatically killed when it reaches `bulletKillDistance` (pixels)
    fireballNormal.bulletKillType = Phaser.Weapon.KILL_DISTANCE
    fireballCharged.bulletKillType = Phaser.Weapon.KILL_DISTANCE
    fireballSuper.bulletKillType = Phaser.Weapon.KILL_DISTANCE
    fireballNormal.bulletKillDistance = 100
    fireballCharged.bulletKillDistance = 200
    fireballSuper.bulletKillDistance = 300
    // The speed at which the bullet is fired
    fireballNormal.bulletSpeed = 300
    fireballCharged.bulletSpeed = 600
    fireballSuper.bulletSpeed = 900
    // Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
    fireballNormal.fireRate = 300
    //  Tell the Weapon to track the 'player' Sprite
    //  With no offsets from the position
    //  But the 4th 'true' argument tells the weapon to track sprite rotation
    fireballNormal.trackSprite(this, 0, 0)
    fireballCharged.trackSprite(this, 0, 0)
    fireballSuper.trackSprite(this, 0, 0)
    fireballNormal.trackOffset.y = 6
    fireballCharged.trackOffset.y = 6
    fireballSuper.trackOffset.y = 6
    fireballNormal.bulletRotateToVelocity = true
    fireballCharged.bulletRotateToVelocity = true
    fireballSuper.bulletRotateToVelocity = true
    fireballNormal.setBulletBodyOffset(16, 16, 12, 9)
    fireballCharged.setBulletBodyOffset(16, 11, 12, 12)
    fireballSuper.setBulletBodyOffset(16, 46, 26, 10)
    fireballNormal.addBulletAnimation('end', [4, 5, 6], 12, false)
    fireballCharged.addBulletAnimation('end', [4, 5, 6], 12, false)
    fireballSuper.addBulletAnimation('end', [4, 5, 6], 12, false)
    fireballNormal.addBulletAnimation('fly', [0, 1, 2, 3], 12, true)
    fireballCharged.addBulletAnimation('fly', [0, 1, 2, 3], 12, true)
    fireballSuper.addBulletAnimation('fly', [0, 1, 2, 3], 12, true)
    const fireballOnKill = (bullet) => {
      bullet.exists = true
      bullet.dying = true
      bullet.body.velocity.setTo(bullet.body.velocity.x / 10, bullet.body.velocity.y / 10)
      // bullet.body.velocity.setTo(0, 0)
      bullet.play('end').onComplete.add(() => {
        bullet.exists = false
        bullet.dying = false
        bullet.bulletUID = null
      })
    }
    fireballNormal.onKill.add(fireballOnKill)
    fireballCharged.onKill.add(fireballOnKill)
    fireballSuper.onKill.add(fireballOnKill)
  }

  checkAnim () {
    // dying
    if (this.dying) { return this.play('death') }
    // fireballing
    if (this.fireballing) {
      return this.play(`fireball-${this.fireballChargeState}`)
    }
    // hurt
    if (this.hurting) { return this.play('hurt') }
    // move
    if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) { return this.play('walk') }
    // idle
    this.play('idle')
  }

  update () {
    // Reset the players velocity (movement)
    const { velocity } = this.body
    velocity.set(0)

    if (this.cursors.left.isDown) {
      //  Move to the left
      velocity.x = -this.speed
      this.scale.setTo(-1, 1)
    } else if (this.cursors.right.isDown) {
      //  Move to the right
      velocity.x = this.speed
      this.scale.setTo(1, 1)
    }

    if (this.cursors.up.isDown) {
      //  Move to the left
      velocity.y = -this.speed
    } else if (this.cursors.down.isDown) {
      //  Move to the right
      velocity.y = this.speed
    }

    // if just starting to fireball, not 'charge' yet (i.e. still in 'ready'),
    // lock the direction so fireball won't fly to wrong direction
    if ((velocity.x !== 0 || velocity.y !== 0) && (!this.fireballCharging || this.fireballChargeState === 'charge')) {
      // update direction
      this.direction = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI)
    }

    // fireball
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
      velocity.set(0)
    } else {
      if (this.fireballCharging) {
        // just released!
        this.fireballCharging = false
        this.fireFireball(this.game.time.time - this.fireballChargeStartTime)
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
    this.weapons[type].trackOffset.x = 0
    if (this.direction <= 45 && this.direction >= -45) {
      this.weapons[type].trackOffset.x = 10
    } else if (this.direction <= -135 || this.direction >= 135) {
      this.weapons[type].trackOffset.x = -10
    }
    const bullet = this.weapons[type].fire()
    // bullet can be fales or null if not enough time has expired since the last fire
    if (bullet) { bullet.bulletUID = getBulletUID() }

    // update animation
    this.fireballChargeState = type === 'fireballSuper' ? 'shot-super' : 'shot'
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
