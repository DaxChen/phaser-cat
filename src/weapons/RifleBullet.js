import Bullet from './Bullet'
// import { CATEGORY_BULLET } from '../config'

export default class RifleBullet extends Bullet {
  constructor ({ game }) {
    // draw shape
    const g = game.add.graphics(0, 0)
    g.beginFill(0xFFFFFF, 1)
    g.drawCircle(0, 0, 4)

    super({ game, asset: g.generateTexture() })

    g.destroy()

    this.ATK = 1
  }
  // resetBody () {
  //   Bullet.prototype.resetBody.call(this)
  //   this.body.setRectangle(12, 12, 8, 0)
  //   this.body.setCollisionCategory(CATEGORY_BULLET)
  // }
}
