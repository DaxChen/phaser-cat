import Phaser from 'phaser'

export default class HUD extends Phaser.Group {
  constructor ({ game }) {
    super(game, game.world, 'HUD')
    this.fixedToCamera = true

    this.initBanner()
    this.initScore()
  }

  initBanner () {
    // banner
    const banner = new Phaser.Text(
      this.game,
      this.game.width / 2,
      this.game.height - 30,
      'Move : ← ↑ → ↓, Fire : spacebar, Change Weapon : E'
    )
    this.add(banner, true)
    this.banner = banner
    banner.font = 'Bangers'
    banner.padding.set(10, 16)
    banner.fontSize = 30
    banner.fill = '#77BFA3'
    banner.smoothed = false
    banner.anchor.setTo(0.5)
  }

  initScore () {
    const score = new Phaser.Text(
      this.game, 10, 10,
      'Score: 0'
    )
    this.add(score, true)
    this.score = score
    score.font = 'Bangers'
    score.padding.set(10, 16)
    score.fontSize = 40
    score.fill = '#FFFFFF'
    score.smoothed = false
  }
  updateScore (score) {
    this.score.text = 'Score: ' + score
  }
}
