import BaseEntity from './BaseEntity'
import { PROJECTILE_STATS } from '../core/constants'
import p5 from 'p5'

class Projectile extends BaseEntity {
  constructor(p, config = {}) {
    super(p, {
      team: config.team,
      x: config.x,
      y: config.y,
      radius: PROJECTILE_STATS.radius,
      maxHp: 1,
    })
    this.damage = config.damage ?? 10
    this.speed = PROJECTILE_STATS.speed
    this.lifeFrames = PROJECTILE_STATS.lifeFrames
    this.target = config.target
    this.vel = p.createVector(0, 0)
  }

  update(world) {
    if (!this.target || this.target.isDestroyed) {
      this.isDestroyed = true
      return
    }

    const desired = p5.Vector.sub(this.target.pos, this.pos).setMag(this.speed)
    this.vel = desired
    this.pos.add(this.vel)
    this.lifeFrames -= 1
    if (this.lifeFrames <= 0) {
      this.isDestroyed = true
      return
    }
    if (this.distanceTo(this.target) <= this.radius + this.target.radius + 2) {
      this.target.takeDamage(this.damage)
      this.isDestroyed = true
      if (this.target.isDestroyed) {
        world.registerKill(this.team)
      }
    }
  }

  render() {
    const p = this.p
    p.noStroke()
    p.fill(this.team === 'blue' ? '#8ec4ff' : '#ffb0c3')
    p.circle(this.pos.x, this.pos.y, this.radius * 2)
  }
}

export default Projectile
