import BaseEntity from './BaseEntity'
import { TURRET_STATS } from '../core/constants'

class Turret extends BaseEntity {
  constructor(p, config = {}) {
    super(p, { ...config, radius: 18, maxHp: TURRET_STATS.maxHp })
    this.attackDamage = TURRET_STATS.attackDamage
    this.attackRange = TURRET_STATS.attackRange
    this.cooldownFrames = TURRET_STATS.cooldownFrames
    this.cooldown = 0
  }

  update(world) {
    if (this.cooldown > 0) {
      this.cooldown -= 1
      return
    }
    const enemies = world.getEnemiesOf(this.team)
    const target = this.findClosestInRange(enemies, this.attackRange)
    if (!target) return

    world.spawnProjectile({
      from: this,
      target,
      damage: this.attackDamage,
      team: this.team,
    })
    this.cooldown = this.cooldownFrames
  }

  findClosestInRange(enemies, range) {
    let closest = null
    let record = range
    for (const enemy of enemies) {
      if (enemy.isDestroyed) continue
      const d = this.distanceTo(enemy)
      if (d < record) {
        record = d
        closest = enemy
      }
    }
    return closest
  }

  render() {
    const p = this.p
    p.stroke(255, 255, 255, 90)
    p.fill(this.team === 'blue' ? '#314f95' : '#8d2f4f')
    p.circle(this.pos.x, this.pos.y, this.radius * 2.4)
    this.renderHpBar()
  }
}

export default Turret
