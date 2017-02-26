/* globals __DEV__ */
import Phaser from 'phaser'
import CatFighter from '../sprites/CatFighter'
// import Monster1Group from '../sprites/Monster1Group'
import DebugEnemyGroup from '../sprites/DebugEnemyGroup'

export default class Game extends Phaser.State {
  init () {
  }
  preload () {
  }

  create () {
    // banner
    const bannerText = 'use ← ↑ → ↓ to move, spacebar to fire!'
    let banner = this.add.text(this.world.centerX, this.game.height - 80, bannerText)
    banner.font = 'Bangers'
    banner.padding.set(10, 16)
    banner.fontSize = 40
    banner.fill = '#77BFA3'
    banner.smoothed = false
    banner.anchor.setTo(0.5)

    // // map
    // // this.map = this.game.add.tilemap('level1')
    // // the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    // this.map.addTilesetImage('tiles', 'gameTiles');

    // // create layer
    // this.backgroundlayer = this.map.createLayer('backgroundLayer');
    // this.blockedLayer = this.map.createLayer('blockedLayer');

    // // collision on blockedLayer
    // this.map.setCollisionBetween(1, 100000, true, 'blockedLayer');

    // // resizes the game world to match the layer dimensions
    // this.backgroundlayer.resizeWorld();

    // world bounds
    this.game.add.tileSprite(-960, -960, 1920, 1920, 'debug-grid')
    this.game.world.setBounds(-960, -960, 1920, 1920)

    this.player = new CatFighter({ game: this.game, x: 0, y: 0, asset: 'cat' })
    this.game.add.existing(this.player)
    this.game.camera.follow(this.player/* , Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1 */)

    // bullets
    this.singleBullets = [
      this.player.weapons.fireballNormal.bullets
    ]
    this.splashBullets = [
      this.player.weapons.fireballCharged.bullets
    ]
    this.penetrableBullets = [
      this.player.weapons.fireballSuper.bullets
    ]

    // this.monster1group = new Monster1Group({ game: this.game, target: this.player })
    this.monster1group = new DebugEnemyGroup({ game: this.game, target: this.player })
    // this.monster1group.spawn(100, 200)
    this.nextEnemy = 0
    this.spawnRate = 3000

    // debug body sizes
    // this.debugMonster1 = this.game.add.sprite(100, 100, 'monster1')
    // this.debugMonster1.animations.add('move', [0, 1, 2, 3, 4], 2, true)
    // this.debugMonster1.animations.add('attack', [8, 9, 10, 11, 12], 2, true)
    // this.debugMonster1.play('attack')
    // this.game.physics.arcade.enable(this.debugMonster1)
    // this.debugMonster1.body.setSize(25, 24, 19, 26)
    // this.debugFireball = this.game.add.sprite(100, 200, 'fireball_super')
    // this.debugFireball.animations.add('fly', [0, 1, 2, 3], 2, true)
    // this.debugFireball.animations.play('fly')
    // this.game.physics.arcade.enable(this.debugFireball)
    // this.debugFireball.body.setSize(16, 46, 26, 10)
  }

  update () {
    this.spawnEnemies()
    this.game.physics.arcade.overlap(this.singleBullets, this.monster1group, (bullet, enemy) => {
      if (!bullet.dying) {
        enemy.hit(bullet)
        bullet.kill()
      }
    })
    this.game.physics.arcade.overlap(this.splashBullets, this.monster1group, (bullet, enemy) => {
      enemy.hit(bullet)
      if (!bullet.dying) { bullet.kill() }
    })
    this.game.physics.arcade.overlap(this.penetrableBullets, this.monster1group, (bullet, enemy) => {
      enemy.hit(bullet)
    })
    this.game.physics.arcade.collide(this.monster1group, this.monster1group, (enemy1, enemy2) => {
      // line of centers determine the collision direction
      // start with enemy1 perspective
      let collisionVectorX = enemy2.x - enemy1.x
      let collisionVectorY = enemy2.y - enemy1.y
      if (collisionVectorX * enemy1.body.velocity.x + collisionVectorY * enemy1.body.velocity.y >= 0) {
        // this is acute angle, should stop
        enemy1.wait(collisionVectorX, collisionVectorY)
      }
      // now enemy2 perspective, reverse collisionVector
      collisionVectorX *= -1
      collisionVectorY *= -1
      if (collisionVectorX * enemy2.body.velocity.x + collisionVectorY * enemy2.body.velocity.y >= 0) {
        // this is acute angle, should stop
        enemy2.wait(collisionVectorX, collisionVectorY)
      }
    })
    this.game.physics.arcade.collide(this.monster1group, this.player)
  }

  spawnEnemies () {
    if (this.game.time.time < this.nextEnemy) { return }

    if (Math.random() < 0.5) {
      this.monster1group.spawn(Math.random() < 0.5 ? -this.world.width : this.world.width, this.world.randomY)
    } else {
      this.monster1group.spawn(this.world.randomX, Math.random() < 0.5 ? -this.world.height : this.world.height)
    }

    this.nextEnemy = this.game.time.time + this.spawnRate
  }

  render () {
    if (__DEV__) {
      this.game.debug.cameraInfo(this.game.camera, 32, 32)
      this.game.debug.spriteCoords(this.player, 32, 500)
      // this.game.debug.spriteInfo(this.player, 32, 32)
      // this.player.weapons.fireball.debug(32, 32/* , true */)
      // this.game.debug.bodyInfo(this.player, 32, 32)
      // this.game.debug.body(this.player)
      // this.game.debug.body(this.debugMonster1)
      // this.game.debug.body(this.debugFireball)
      // this.game.debug.spriteInfo(this.monster1group)
    }
  }
}
