import Phaser from 'phaser'

export default class ComboFader extends Phaser.Graphics {
  constructor ({ game }) {
    super(game, 0, 0)
    this._angle = 0

    // initial circle
    this.beginFill(0xffffff)
    this.drawCircle(this.game.width - 40, 80, 24)
    this.endFill()
  }

  reset (m) {
    this._multiplier = m
    this._angle = 0
  }

  update () {
    if (this._multiplier < 2) return
    this.clear()
    // this.lineStyle(2, 0xffffff)
    this.beginFill(0xffffff)
    this.drawCircle(this.game.width - 40, 80, 24)
    this.beginFill(0x123456)
    this.arc(this.game.width - 40, 80, 10, 0, this.game.math.degToRad(this._angle), true)
    this.endFill()

    this._angle += this._multiplier / 10 + 1

    if (this._angle > 360) {
      this.parent.onComboFade.dispatch()
      this._angle = 0
    }
  }
}
