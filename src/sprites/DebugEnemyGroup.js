import Phaser from 'phaser'
import DebugEnemy from './DebugEnemy'

export default class DebugEnemyGroup extends Phaser.Group {
  constructor ({ game, target }) {
    super(game, game.world, 'DebugEnemy Group', false, true, Phaser.Physics.ARCADE)

    this.target = target

    for (var i = 0; i < 64; i++) {
      this.add(new DebugEnemy({ game, target }), true)
    }
  }

  spawn (x, y) {
    let monster = this.getFirstExists(false)
    if (monster) {
      monster.spawn(x, y)
    } else {
      monster = new DebugEnemy({ game: this.game, target: this.target })
      this.add(monster, true)
      monster.spawn(x, y)
    }
  }

  // fire (source) {
  //   if (this.game.time.time < this.nextFire) { return }

  //   let x = source.x
  //   if (source.direction <= 45 && source.direction >= -45) {
  //     x += 10
  //   } else if (source.direction <= -135 || source.direction >= 135) {
  //     x -= 10
  //   }
  //   let y = source.y + 6

  //   // fire(x, y, angle, speed, gx, gy)
  //   this.getFirstExists(false).fire(x, y, source.direction, this.bulletSpeed, 0, 0)

  //   this.nextFire = this.game.time.time + this.fireRate
  // }
}