import BaseEntity from './BaseEntity'
import p5 from 'p5'

class SteeringAgent extends BaseEntity {
  constructor(p, config = {}) {
    super(p, config)
    this.vel = p.createVector(0, 0)
    this.acc = p.createVector(0, 0)
    this.maxSpeed = config.maxSpeed ?? 2
    this.maxForce = config.maxForce ?? 0.12
  }

  applyForce(force) {
    this.acc.add(force)
  }

  seek(targetPos) {
    const desired = p5.Vector.sub(targetPos, this.pos)
    desired.setMag(this.maxSpeed)
    const steer = p5.Vector.sub(desired, this.vel)
    steer.limit(this.maxForce)
    return steer
  }

  arrive(targetPos, slowRadius = 90) {
    const desired = p5.Vector.sub(targetPos, this.pos)
    const distance = desired.mag()
    let speed = this.maxSpeed
    if (distance < slowRadius) {
      speed = this.p.map(distance, 0, slowRadius, 0, this.maxSpeed)
    }
    desired.setMag(speed)
    const steer = p5.Vector.sub(desired, this.vel)
    steer.limit(this.maxForce)
    return steer
  }

  pursue(target) {
    const prediction = target.vel ? target.vel.copy().mult(12) : this.p.createVector(0, 0)
    const future = p5.Vector.add(target.pos, prediction)
    return this.seek(future)
  }

  evade(target) {
    return this.pursue(target).mult(-1)
  }

  separate(neighbors, desiredSeparation = 24) {
    const steer = this.p.createVector(0, 0)
    let count = 0
    for (const other of neighbors) {
      if (other.id === this.id || other.isDestroyed) continue
      const distance = this.distanceTo(other)
      if (distance > 0 && distance < desiredSeparation) {
        const diff = p5.Vector.sub(this.pos, other.pos)
        diff.normalize()
        diff.div(distance)
        steer.add(diff)
        count += 1
      }
    }
    if (count > 0) {
      steer.div(count)
      steer.setMag(this.maxSpeed)
      steer.sub(this.vel)
      steer.limit(this.maxForce * 1.2)
    }
    return steer
  }

  avoid(obstacles, lookAhead = 44) {
    const ahead = this.vel.copy().setMag(lookAhead).add(this.pos)
    let closest = null
    let minDistance = Number.POSITIVE_INFINITY
    for (const obstacle of obstacles) {
      if (!obstacle || obstacle.isDestroyed) continue
      const distance = ahead.dist(obstacle.pos)
      if (distance < obstacle.radius + this.radius + 8 && distance < minDistance) {
        minDistance = distance
        closest = obstacle
      }
    }
    if (!closest) return this.p.createVector(0, 0)
    const steer = p5.Vector.sub(ahead, closest.pos)
    steer.setMag(this.maxForce * 1.5)
    return steer
  }

  followPath(pathPoints, laneWidth = 34) {
    if (!pathPoints.length) return this.p.createVector(0, 0)
    const predict = this.vel.copy()
    if (predict.mag() < 0.01) predict.x = this.maxSpeed
    predict.setMag(24)
    const predictLoc = p5.Vector.add(this.pos, predict)

    let closestNormal = null
    let closestTarget = null
    let worldRecord = Number.POSITIVE_INFINITY

    for (let i = 0; i < pathPoints.length - 1; i += 1) {
      const a = pathPoints[i]
      const b = pathPoints[i + 1]
      const normal = this.getNormalPoint(predictLoc, a, b)
      const dir = p5.Vector.sub(b, a)
      const toA = p5.Vector.sub(normal, a)
      const proj = toA.dot(dir) / dir.magSq()
      if (proj < 0 || proj > 1) continue
      const distance = predictLoc.dist(normal)
      if (distance < worldRecord) {
        worldRecord = distance
        closestNormal = normal
        const target = normal.copy().add(dir.copy().setMag(16))
        closestTarget = target
      }
    }

    if (!closestNormal || !closestTarget) return this.p.createVector(0, 0)
    if (worldRecord > laneWidth) return this.seek(closestTarget)
    return this.p.createVector(0, 0)
  }

  getNormalPoint(point, a, b) {
    const ap = p5.Vector.sub(point, a)
    const ab = p5.Vector.sub(b, a)
    ab.normalize()
    ab.mult(ap.dot(ab))
    return p5.Vector.add(a, ab)
  }

  integrate() {
    this.vel.add(this.acc)
    this.vel.limit(this.maxSpeed)
    this.pos.add(this.vel)
    this.acc.mult(0)
  }

  resolveObstacleCollisions(obstacles) {
    for (const obstacle of obstacles) {
      const distance = this.pos.dist(obstacle.pos)
      const minDistance = this.radius + obstacle.radius
      if (distance <= 0 || distance >= minDistance) continue

      const normal = p5.Vector.sub(this.pos, obstacle.pos).normalize()
      this.pos = obstacle.pos.copy().add(normal.mult(minDistance + 0.2))

      const inwardSpeed = this.vel.dot(normal)
      if (inwardSpeed < 0) {
        this.vel.sub(normal.mult(inwardSpeed))
      }
      this.vel.mult(0.92)
    }
  }
}

export default SteeringAgent
