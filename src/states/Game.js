/* globals __DEV__ */
import Phaser from 'phaser'
import CatFighter from '../sprites/CatFighter'
import Monster1Group from '../sprites/Monster1Group'

export default class extends Phaser.State {
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

    this.player = new CatFighter({
      game: this.game,
      x: this.world.centerX,
      y: this.world.centerY,
      asset: 'cat'
    })

    this.game.add.existing(this.player)

    this.monster1group = new Monster1Group({ game: this.game, target: this.player })
    // this.monster1group.spawn(100, 200)
    this.nextEnemy = 0
    this.spawnRate = 3000

    // debug body sizes
    // this.debugMonster1 = this.game.add.sprite(100, 100, 'monster1')
    // this.debugMonster1.animations.add('move', [0, 1, 2, 3, 4], 2, true)
    // this.debugMonster1.animations.play('move')
    // this.game.physics.arcade.enable(this.debugMonster1)
    // this.debugMonster1.body.setSize(25, 24, 19, 26)
    // this.debugFireball = this.game.add.sprite(100, 200, 'fireball_charged')
    // this.debugFireball.animations.add('fly', [0, 1, 2, 3], 2, true)
    // this.debugFireball.animations.play('fly')
    // this.game.physics.arcade.enable(this.debugFireball)
    // this.debugFireball.body.setSize(16, 16, 12, 9)
  }

  update () {
    this.spawnEnemies()
    this.game.physics.arcade.overlap(this.player.weapons.fireball.bullets, this.monster1group, (bullet, enemy) => {
      enemy.hit(bullet)
      bullet.kill()
    })
    this.game.physics.arcade.collide(this.monster1group, this.monster1group)
    this.game.physics.arcade.collide(this.monster1group, this.player, (monster, player) => {
      console.log('die!')
    })
  }

  spawnEnemies () {
    if (this.game.time.time < this.nextEnemy) { return }

    if (Math.random() < 0.5) {
      this.monster1group.spawn(Math.random() < 0.5 ? 0 : this.world.width, this.world.randomY)
    } else {
      this.monster1group.spawn(this.world.randomX, Math.random() < 0.5 ? 0 : this.world.height)
    }

    this.nextEnemy = this.game.time.time + this.spawnRate
  }

  render () {
    if (__DEV__) {
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
