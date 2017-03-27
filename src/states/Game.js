/* globals __DEV__ */
import Phaser from 'phaser'
import CatFighter from '../sprites/CatFighter'
import Monster1Group from '../sprites/Monster1Group'

/**
 * This is the main game state,
 * we create the player CatFighter and the monsters here.
 */
export default class Game extends Phaser.State {
  init () {
  }
  preload () {
  }

  create () {
    // background and world bounds
    this.game.add.tileSprite(0, 0, 960, 960, 'background')
    this.game.world.setBounds(0, 0, 960, 960)
    this.game.physics.box2d.setBoundsToWorld()

    // banner
    const bannerText = 'Move : ← ↑ → ↓, Fire : spacebar, Change Weapon : E'
    let banner = this.add.text(this.game.width / 2, this.game.height - 30, bannerText)
    banner.font = 'Bangers'
    banner.padding.set(10, 16)
    banner.fontSize = 30
    banner.fill = '#77BFA3'
    banner.smoothed = false
    banner.anchor.setTo(0.5)
    banner.fixedToCamera = true

    // Create the player, and add to game
    this.player = new CatFighter({
      game: this.game,
      x: this.world.centerX,
      y: this.world.centerY,
      asset: 'cat'
    })
    this.game.add.existing(this.player)
    // let the camera follow the player
    this.game.camera.follow(this.player/* , Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1 */)

    // the monster1 pool
    this.monster1group = new Monster1Group({ game: this.game })
    // internal time of when the next enemy can spawn
    this._nextEnemy = 0
    // the spawn rate of monster
    this.spawnRate = 3000
  }

  update () {
    this.spawnEnemies()
  }

  spawnEnemies () {
    if (this.game.time.time < this._nextEnemy) { return }

    if (Math.random() < 0.5) {
      this.monster1group.spawn(Math.random() < 0.5 ? 0 : this.world.width, this.world.randomY)
    } else {
      this.monster1group.spawn(this.world.randomX, Math.random() < 0.5 ? 0 : this.world.height)
    }

    this._nextEnemy = this.game.time.time + this.spawnRate
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
      this.game.debug.box2dWorld()
    }
  }
}
