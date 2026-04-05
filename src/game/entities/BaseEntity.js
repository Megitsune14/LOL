let NEXT_ID = 1

class BaseEntity {
  constructor(p, { team, x, y, radius = 12, maxHp = 100 } = {}) {
    this.p = p
    this.id = NEXT_ID++
    this.team = team
    this.pos = p.createVector(x ?? 0, y ?? 0)
    this.radius = radius
    this.maxHp = maxHp
    this.hp = maxHp
    this.isDestroyed = false
  }

  update() {}

  render() {
    const p = this.p
    p.noStroke()
    p.fill(this.team === 'blue' ? '#7aa2ff' : '#ff6c89')
    p.circle(this.pos.x, this.pos.y, this.radius * 2)
    this.renderHpBar()
  }

  renderHpBar() {
    const p = this.p
    const width = this.radius * 2.2
    const ratio = p.constrain(this.hp / this.maxHp, 0, 1)
    p.noStroke()
    p.fill(18, 12, 30, 220)
    p.rect(this.pos.x - width / 2, this.pos.y - this.radius - 10, width, 4, 2)
    p.fill(84, 236, 167)
    p.rect(this.pos.x - width / 2, this.pos.y - this.radius - 10, width * ratio, 4, 2)
  }

  distanceTo(other) {
    return this.pos.dist(other.pos)
  }

  takeDamage(value) {
    this.hp -= value
    if (this.hp <= 0) {
      this.hp = 0
      this.isDestroyed = true
    }
  }
}

export default BaseEntity
