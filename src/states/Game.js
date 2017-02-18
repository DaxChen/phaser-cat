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
    const bannerText = 'Berber'
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
      x: 150,
      y: this.world.height - 150,
      asset: 'cat'
    })

    this.game.add.existing(this.player)

    this.monster1group = new Monster1Group(this.game)
    this.monster1group.spawn(100, 200)
  }

  update () {
  }

  render () {
    if (__DEV__) {
      this.game.debug.spriteInfo(this.player, 32, 32)
    }
  }
}
