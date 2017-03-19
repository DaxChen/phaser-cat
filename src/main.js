import 'pixi'
import 'p2'
import Phaser from 'phaser'
import 'box2d'

import BootState from './states/Boot'
import SplashState from './states/Splash'
import GameState from './states/Game'

const game = new Phaser.Game(800, 600, Phaser.AUTO, '')
game.state.add('Boot', BootState)
game.state.add('Splash', SplashState)
game.state.add('Game', GameState)

game.state.start('Boot')

/* globals __DEV__ */
if (__DEV__) {
  window.game = game
  window.state = game.state.states.Game
}
