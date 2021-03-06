/* globals __DEV__ */
import Phaser from 'phaser'
import CatFighter from '../sprites/CatFighter'
import Monster1Group from '../sprites/Monster1Group'
import MonsterBossGroup from '../sprites/MonsterBossGroup'
import HUD from '../displays/HUD'

/**
 * This is the main game state,
 * we create the player CatFighter and the monsters here.
 */
export default class Game extends Phaser.State {
  init () {
  }
  preload () {
  }

  create () {
    // background and world bounds
    this.game.add.tileSprite(0, 0, 960, 960, 'background')
    this.game.world.setBounds(0, 0, 960, 960)
    this.game.physics.box2d.setBoundsToWorld()

    // Create the player, and add to game
    this.player = new CatFighter({
      game: this.game,
      x: this.world.centerX,
      y: this.world.centerY,
      asset: 'cat'
    })
    this.game.add.existing(this.player)
    // let the camera follow the player
    this.game.camera.follow(this.player/* , Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1 */)

    // the monster1 pool
    this.monster1group = new Monster1Group({ game: this.game })
    this.monster1group.onChildKill.add(this.onEnemyKill, this)
    // the monster boss pool
    this.monsterBossGroup = new MonsterBossGroup({ game: this.game })
    this.monsterBossGroup.onChildKill.add(this.onEnemyKill, this)
    // internal time of when the next enemy can spawn
    this._nextEnemy = 0
    // the spawn rate of monster
    this.spawnRate = 1000

    // HUD: add at last to be on top
    this.HUD = new HUD({ game: this.game })
    this.score = 0
    this.comboMultiplier = 1
    this.HUD.onComboFade.add(() => this.comboMultiplier--)
    this.player.onWeaponChange.add(w => this.HUD.updateWeapon(w))
    this.player.onDeath.add(() => {
      this.game.state.start('GameOver', true, false, this.score)
    })
  }

  get score () {
    return this._score
  }
  set score (newScore) {
    this._score = newScore
    this.HUD.updateScore(newScore)
  }
  get comboMultiplier () {
    return this._comboMultiplier
  }
  set comboMultiplier (newCM) {
    this._comboMultiplier = newCM < 1 ? 1 : newCM
    this.HUD.updateCombo(this._comboMultiplier)
  }

  onEnemyKill (enemy) {
    this.comboMultiplier++ // this will trigger the setter
    this.score += enemy.BASE_SCORE * this.comboMultiplier // this will trigger the setter
  }

  update () {
    this.spawnEnemies()
  }

  spawnEnemies () {
    if (this.game.time.time < this._nextEnemy) { return }

    if (Math.random() < 0.5) {
      this.monster1group.spawn(Math.random() < 0.5 ? 0 : this.world.width, this.world.randomY)
    } else {
      this.monster1group.spawn(this.world.randomX, Math.random() < 0.5 ? 0 : this.world.height)
    }

    if (Math.random() < 0.05) {
      if (Math.random() < 0.5) {
        this.monsterBossGroup.spawn(Math.random() < 0.5 ? 0 : this.world.width, this.world.randomY)
      } else {
        this.monsterBossGroup.spawn(this.world.randomX, Math.random() < 0.5 ? 0 : this.world.height)
      }
    }

    this._nextEnemy = this.game.time.time + this.spawnRate
  }

  render () {
    if (__DEV__) {
      // this.game.debug.spriteInfo(this.player, 32, 32)
      // this.player.weapons.fireball.debug(32, 32/* , true */)
      // this.game.debug.bodyInfo(this.player, 32, 32)
      // this.game.debug.body(this.player)
      // this.game.debug.body(this.debugMonster1)
      // this.game.debug.body(this.debugFireball)
      // this.game.debug.spriteInfo(this.monster1group)
      this.game.debug.box2dWorld()
    }
  }
}
