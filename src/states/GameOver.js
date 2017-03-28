import Phaser from 'phaser'

export default class GameOver extends Phaser.State {
  init (score) {
    this.stage.backgroundColor = '#2c3e50'
    this.score = score
  }
  create () {
    // GAME OVER
    this.gameOverText = this.add.text(
      this.game.width / 2, this.game.height / 2 - 80,
      'G a m e   O v e r'
    )
    this.gameOverText.anchor.setTo(0.5)
    this.gameOverText.fontSize = 100
    this.gameOverText.font = 'Bangers'
    this.gameOverText.padding.set(10, 16)
    this.gameOverText.fill = '#e74c3c'

    // YOUR SCORE
    this.score = this.add.text(
      this.game.width / 2, this.game.height / 2 + 40,
      'Your Score: ' + this.score
    )
    this.score.anchor.setTo(0.5)
    this.score.fontSize = 40
    // this.score.font = 'Bangers'
    this.score.padding.set(10, 16)
    this.score.fill = '#1abc9c'

    // RESTART
    this.restartBtn = {}
    const g = this.add.graphics(this.game.width / 2, this.game.height - 140)
    this.restartBtn.g = g
    g.beginFill(0x3498db)
    // g.beginFill(0x2980b9)
    g.drawRoundedRect(-160, -50, 320, 100, 10)
    g.endFill()
    const t = this.add.text(
      this.game.width / 2, this.game.height - 140,
      'Try Again'
    )
    t.anchor.setTo(0.5)
    t.fontSize = 60
    t.font = 'Bangers'
    t.padding.set(10, 16)
    t.fill = '#2c3e50'
    // t.fill = '#fff'
    g.inputEnabled = true
    g.events.onInputOver.add(() => {
      // g.clear()
      // g.beginFill(0x2980b9)
      // g.drawRoundedRect(-160, -50, 320, 100, 10)
      // g.endFill()
      t.fill = '#fff'
    })
    g.events.onInputOut.add(() => {
      g.clear()
      g.beginFill(0x3498db)
      g.drawRoundedRect(-160, -50, 320, 100, 10)
      g.endFill()
      t.fill = '#2c3e50'
    })
    g.events.onInputDown.add(() => {
      g.clear()
      g.beginFill(0x2980b9)
      g.drawRoundedRect(-160, -50, 320, 100, 10)
      g.endFill()
      t.fill = '#bdc3c7'
      // t.fill = '#e74c3c'
    })
    g.events.onInputUp.add(() => {
      this.game.state.start('Game')
    })
  }
}
