import Phaser from 'phaser'

export default class extends Phaser.Sprite {

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
    // east: 0, north: -90, west: 180, south: 90
    // north-east: -45, north-west: -135, south-east: 45, south-west: 135
    this.direction = 0

    // animations
    this.animations.add('idle', [0, 1, 2, 3], 10, true)
    this.animations.add('walk', [16, 17, 18, 19, 20, 21, 22, 23], 16, true)
    this.animations.add('fireball', [80, 81, 82, 83, 84, 85, 86], 12, false)
    this.animations.play('idle')

    // weapons
    this.currentWeapon = 'fireball'
    this.weapons = {}
    // Creates 30 bullets, using the 'bullet' graphic
    this.weapons.fireball = game.add.weapon(30, 'fireball_charged')
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
    const { fireball } = this.weapons
    // The bullet will be automatically killed when it reaches `bulletKillDistance` (pixels)
    fireball.bulletKillType = Phaser.Weapon.KILL_DISTANCE
    fireball.bulletKillDistance = 300
    // The speed at which the bullet is fired
    fireball.bulletSpeed = 400
    // Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
    fireball.fireRate = 300
    //  Tell the Weapon to track the 'player' Sprite
    //  With no offsets from the position
    //  But the 4th 'true' argument tells the weapon to track sprite rotation
    fireball.trackSprite(this, 0, 0)
    fireball.trackOffset.y = 6
    fireball.bulletRotateToVelocity = true
    // fireball.addBulletAnimation('end', [4, 5, 6], 12, true)
    fireball.addBulletAnimation('fly', [0, 1, 2, 3], 12, true)
    // fireball.onKill.add((bullet) => { console.log('onKill'); bullet.animations.play('end') })
  }

  update () {
    //  Reset the players velocity (movement)
    const { velocity } = this.body
    velocity.set(0)

    if (this.cursors.left.isDown) {
      //  Move to the left
      velocity.x = -this.speed
      this.scale.setTo(-1, 1)
      this.animations.play('walk')
    } else if (this.cursors.right.isDown) {
      //  Move to the right
      velocity.x = this.speed
      this.scale.setTo(1, 1)
      this.animations.play('walk')
      this.animations.play('walk')
    }

    if (this.cursors.up.isDown) {
      //  Move to the left
      velocity.y = -this.speed
      this.animations.play('walk')
    } else if (this.cursors.down.isDown) {
      //  Move to the right
      velocity.y = this.speed
      this.animations.play('walk')
    }

    if (velocity.x === 0 && velocity.y === 0) {
      //  Stand still
      this.animations.play('idle')
    } else {
      // update direction
      this.direction = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI)
    }

    if (this.fireButton.isDown) {
      // this.animations.play('fireball')
      this.weapons[this.currentWeapon].fireAngle = this.direction
      this.weapons[this.currentWeapon].trackOffset.x = 0
      if (this.direction <= 45 && this.direction >= -45) {
        this.weapons[this.currentWeapon].trackOffset.x = 10
      } else if (this.direction <= -135 || this.direction >= 135) {
        this.weapons[this.currentWeapon].trackOffset.x = -10
      }
      this.weapons[this.currentWeapon].fire()
    }
  }
}
