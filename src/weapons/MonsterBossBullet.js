import Bullet from './Bullet'
import { CATEGORY_ENEMY_BULLET } from '../config'

export default class MonsterBossBullet extends Bullet {
  constructor ({ game }) {
    super({ game, asset: 'monster_boss_bullet' })

    this.animations.add('fly', [0, 1, 2], 12, true)
    this.animations.add('end', [3, 4, 5], 12, false)
      .onComplete.add(() => this.kill())

    this.ATK = 10
    this.flyAnim = 'fly'
    this.shouldHitPlayer = true
  }
  resetBody () {
    Bullet.prototype.resetBody.call(this)
    this.body.setCircle(8, 2, 0)
    this.body.setCollisionCategory(CATEGORY_ENEMY_BULLET)
  }

  preKill () {
    this.dying = true
    this.killBody()
    this.play('end')
  }
}
