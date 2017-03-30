import Phaser from 'phaser'
import MonsterBoss from './MonsterBoss'

export default class MonsterBossGroup extends Phaser.Group {
  constructor ({ game }) {
    super(game, game.world, 'MonsterBoss Group')

    this.onChildKill = new Phaser.Signal()

    for (var i = 0; i < 5; i++) {
      this.add(new MonsterBoss({ game }), true)
    }
  }

  spawn (x, y) {
    let monster = this.getFirstExists(false)
    if (!monster) {
      monster = new MonsterBoss({ game: this.game })
      this.add(monster, true)
    }
    monster.spawn(x, y)
  }
}
