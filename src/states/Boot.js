import Phaser from 'phaser'
import WebFont from 'webfontloader'

// http://www.html5gamedevs.com/topic/1372-phaser-function-order-reserved-names-and-special-uses/
export default class extends Phaser.State {
  /**
   * init is the very first function called when your State starts up. It's called before preload, create or
   * anything else. If you need to route the game away to another State you could do so here, or if you need
   * to prepare a set of variables or objects before the preloading starts.
   *
   * start a new state with parameter like this
   * start(key, clearWorld, clearCache, parameter)
   * this.game.state.start('my-state', true, false, params)
   */
  init () {
    // ensure sprites are rendered using integer positions, without this often render at sub-pixel
    // position, causing 'blur' as Canvas tries to anti-alias
    this.game.renderer.renderSession.roundPixels = true

    this.stage.backgroundColor = '#EDEEC9'
    this.fontsReady = false
    this.fontsLoaded = this.fontsLoaded.bind(this)
  }

  preload () {
    WebFont.load({
      google: {
        families: ['Bangers']
      },
      active: this.fontsLoaded
    })

    let text = this.add.text(this.world.centerX, this.world.centerY, 'loading fonts', { font: '16px Arial', fill: '#dddddd', align: 'center' })
    text.anchor.setTo(0.5, 0.5)

    this.load.image('loaderBg', './assets/images/loader-bg.png')
    this.load.image('loaderBar', './assets/images/loader-bar.png')
  }
  // loadUpdate () {}

  // called automatically once the preload has finished
  create () {
    // scaling options
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL

    // have the game centered horizontally
    this.scale.pageAlignHorizontally = true
    this.scale.pageAlignVertically = true

    // physics system
    this.game.physics.startSystem(Phaser.Physics.BOX2D)
  }

  render () {
    if (this.fontsReady) {
      this.state.start('Splash')
    }
  }

  fontsLoaded () {
    this.fontsReady = true
  }

}
