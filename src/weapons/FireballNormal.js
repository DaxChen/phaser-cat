import Phaser from 'phaser'
import Fireball from './Fireball'

export default class extends Phaser.Group {
  constructor (game) {
    super(game, game.world, 'Normal Fireball', false, true, Phaser.Physics.ARCADE)

    // the game.time the player is allowed to shoot again
    this.nextFire = 0
    // the speed the bullets this particular weapon fires travel at
    this.bulletSpeed = 400
    // the rate at which this weapon fires. The lower the number,
    // the higher the firing rate.
    this.fireRate = 300

    for (var i = 0; i < 64; i++) {
      this.add(new Fireball({ game, asset: 'fireball_charged' }), true)
    }

    return this
  }

  fire (source) {
    if (this.game.time.time < this.nextFire) { return }

    let x = source.x
    if (source.direction <= 45 && source.direction >= -45) {
      x += 10
    } else if (source.direction <= -135 || source.direction >= 135) {
      x -= 10
    }
    let y = source.y + 6

    // fire(x, y, angle, speed, gx, gy)
    this.getFirstExists(false).fire(x, y, source.direction, this.bulletSpeed, 0, 0)

    this.nextFire = this.game.time.time + this.fireRate
  }
}
