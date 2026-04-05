class MapObstacle {
  constructor(p, { x, y, radius = 12 } = {}) {
    this.p = p
    this.pos = p.createVector(x ?? 0, y ?? 0)
    this.radius = radius
    this.isDestroyed = false
  }

  renderDebug() {
    const p = this.p
    p.noFill()
    p.stroke(255, 120, 120, 150)
    p.strokeWeight(1)
    p.circle(this.pos.x, this.pos.y, this.radius * 2)
  }
}

export default MapObstacle
