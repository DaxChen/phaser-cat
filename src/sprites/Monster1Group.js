import Phaser from 'phaser'
import Monster1 from './Monster1'

export default class Monster1Group extends Phaser.Group {
  constructor ({ game }) {
    super(game, game.world, 'Monster1 Group')

    for (var i = 0; i < 64; i++) {
      this.add(new Monster1({ game }), true)
    }
  }

  spawn (x, y) {
    let monster = this.getFirstExists(false)
    if (monster) {
      monster.spawn(x, y)
    } else {
      monster = new Monster1({ game: this.game })
      this.add(monster, true)
      monster.spawn(x, y)
    }
  }
}
