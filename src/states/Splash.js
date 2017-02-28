import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

export default class extends Phaser.State {
  init () {}

  preload () {
    // show loading screen
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])
    this.load.setPreloadSprite(this.loaderBar)

    // load your assets
    this.load.spritesheet('cat', 'assets/images/cat_fighter.png', 64, 64)
    this.load.spritesheet('fireball_normal', 'assets/images/fireball_normal.png', 32, 32)
    this.load.spritesheet('fireball_charged', 'assets/images/fireball_charged.png', 32, 32)
    this.load.spritesheet('fireball_super', 'assets/images/fireball_super.png', 64, 64)
    this.load.spritesheet('monster1', 'assets/images/monster1.png', 64, 64)
    // debug background
    this.load.image('debug-grid', 'assets/images/debug-grid-1920x1920.png')
    // this.load.image('arrow', 'assets/images/arrow.png')

    // this.load.onFileComplete.add(this.updateProgressBar, this)
  }

  // updateProgressBar (progress, cacheId, success, filesLoaded, totalFiles) {
  //   // Another file has just loaded, so update the size of my progress bar graphic here
  //   // progress is the same as game.load.progress, so a value between 0 and 100.
  // }

  create () {
    this.state.start('Game')
  }

}
