import SteeringAgent from './SteeringAgent'
import { ROLE_STATS } from '../core/constants'

class Hero extends SteeringAgent {
  constructor(p, config = {}) {
    const roleStats = ROLE_STATS[config.role] ?? ROLE_STATS.Top
    super(p, {
      ...config,
      maxHp: roleStats.maxHp,
      radius: 14,
      maxSpeed: roleStats.maxSpeed,
      maxForce: 0.18,
    })
    this.role = config.role ?? 'Top'
    this.attackDamage = roleStats.attackDamage
    this.attackRange = roleStats.attackRange
    this.attackCooldownFrames = this.role === 'ADC' ? 18 : 26
    this.attackTimer = 0
    this.moveTarget = this.pos.copy()
  }

  setMoveTarget(targetPos) {
    this.moveTarget = targetPos.copy()
  }

  update(world) {
    if (this.attackTimer > 0) this.attackTimer -= 1

    const enemies = world.getEnemiesOf(this.team)
    const closeEnemy = this.findClosestInRange(enemies, this.attackRange)

    if (closeEnemy) {
      if (this.attackTimer <= 0) {
        closeEnemy.takeDamage(this.attackDamage)
        this.attackTimer = this.attackCooldownFrames
      }
      this.applyForce(this.arrive(closeEnemy.pos, 45).mult(0.35))
    } else if (this.moveTarget) {
      this.applyForce(this.arrive(this.moveTarget))
    }

    this.applyForce(this.separate(world.getAllAgents(), 20).mult(0.7))
    this.applyForce(this.avoid(world.mapObstacles, 52).mult(1.5))
    this.integrate()
    this.resolveObstacleCollisions(world.mapObstacles)
    this.keepInBounds(world.width, world.height)
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

  keepInBounds(width, height) {
    this.pos.x = this.p.constrain(this.pos.x, 8, width - 8)
    this.pos.y = this.p.constrain(this.pos.y, 8, height - 8)
  }

  render() {
    const p = this.p
    p.noStroke()
    p.fill(this.team === 'blue' ? '#58a6ff' : '#ff7b9f')
    p.circle(this.pos.x, this.pos.y, this.radius * 2.5)
    p.fill(244, 241, 255)
    p.textAlign(p.CENTER, p.CENTER)
    p.textSize(10)
    p.text(this.role, this.pos.x, this.pos.y)
    this.renderHpBar()
  }
}

export default Hero
