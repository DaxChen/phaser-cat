/**
 * This is the entry point of the Phaser game,
 * we create the Phaser.Game instance here, and add the states.
 */
import 'pixi'
import 'p2'
import Phaser from 'phaser'
import 'box2d'

import BootState from './states/Boot'
import SplashState from './states/Splash'
import GameState from './states/Game'

const game = new Phaser.Game(800, 600, Phaser.AUTO, '')

// add states to the game
// load fonts and fetch assets for the splash loading state
game.state.add('Boot', BootState)
// the loading screen, fetch all assets here!
game.state.add('Splash', SplashState)
// the game state
game.state.add('Game', GameState)

// start the boot state
game.state.start('Boot')

// debug
if (__DEV__) {
  /* globals __DEV__ */
  window.game = game
  window.state = game.state.states.Game
}
