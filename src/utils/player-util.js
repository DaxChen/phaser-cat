export function invincibleTimer ({ game, player }) {
  player.invincible = true
  const timer = game.time.create()
  timer.add(5000, () => {
    player.alpha = 1
    player.invincible = false
    timer.destroy()
  })
  timer.loop(100, () => { player.alpha = player.alpha === 1 ? 0.3 : 1 })
  timer.start()
}

export function updateHealthBar (host) {
  host.healthBar.setPercent(host.health / host.maxHealth * 100)
}
