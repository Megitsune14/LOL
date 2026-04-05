import SteeringAgent from './SteeringAgent'
import { MINION_STATS } from '../core/constants'

class Minion extends SteeringAgent {
  constructor(p, config = {}) {
    super(p, {
      ...config,
      radius: 9,
      maxHp: MINION_STATS.maxHp,
      maxSpeed: MINION_STATS.maxSpeed,
      maxForce: MINION_STATS.maxForce,
    })
    this.attackDamage = MINION_STATS.attackDamage
    this.attackRange = MINION_STATS.attackRange
    this.attackTimer = 0
    this.attackCooldownFrames = 32
    this.pathPoints = config.pathPoints ?? []
    this.forward = config.forward ?? 1
    this.laneId = config.laneId ?? 'mid'
    this.laneWidth = config.laneWidth ?? 24
  }

  update(world) {
    if (this.attackTimer > 0) this.attackTimer -= 1

    const enemies = world.getEnemiesOf(this.team)
    const target = this.findClosestInRange(enemies, this.attackRange + 8)

    if (target) {
      if (this.attackTimer <= 0) {
        target.takeDamage(this.attackDamage)
        this.attackTimer = this.attackCooldownFrames
      }
      this.applyForce(this.arrive(target.pos, 35).mult(0.5))
    } else {
      const points = this.forward === 1 ? this.pathPoints : [...this.pathPoints].reverse()
      this.applyForce(this.followPath(points, this.laneWidth).mult(1.25))
      if (this.vel.mag() < 0.7) {
        const idx = this.forward === 1 ? 1 : points.length - 2
        if (points[idx]) this.applyForce(this.seek(points[idx]).mult(0.8))
      }
      if (this.vel.mag() < 0.35) {
        const laneBias = this.laneId === 'top' ? -0.35 : this.laneId === 'bot' ? 0.35 : 0
        const side = this.forward === 1 ? 1 : -1
        const micro = this.p.createVector(0, side + laneBias).rotate((this.id % 5) * 0.17)
        micro.setMag(this.maxForce * 0.7)
        this.applyForce(micro)
      }
    }

    const neighbors = world.getNearAgents(this.pos, 46)
    this.applyForce(this.separate(neighbors, 16).mult(1.1))
    this.applyForce(this.avoid(world.mapObstacles, 46).mult(1.35))
    this.integrate()
    this.resolveObstacleCollisions(world.mapObstacles)
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
}

export default Minion
