class QuadtreeNode {
  constructor(x, y, w, h, capacity) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.capacity = capacity
    this.entities = []
    this.nw = null
    this.ne = null
    this.sw = null
    this.se = null
  }

  get divided() {
    return this.nw !== null
  }

  subdivide() {
    const hw = this.w / 2
    const hh = this.h / 2
    const cap = this.capacity
    this.nw = new QuadtreeNode(this.x, this.y, hw, hh, cap)
    this.ne = new QuadtreeNode(this.x + hw, this.y, hw, hh, cap)
    this.sw = new QuadtreeNode(this.x, this.y + hh, hw, hh, cap)
    this.se = new QuadtreeNode(this.x + hw, this.y + hh, hw, hh, cap)

    for (const entity of this.entities) {
      this.insertIntoChild(entity)
    }
    this.entities.length = 0
  }

  contains(px, py) {
    return px >= this.x && px < this.x + this.w && py >= this.y && py < this.y + this.h
  }

  intersectsCircle(cx, cy, r) {
    const closestX = Math.max(this.x, Math.min(cx, this.x + this.w))
    const closestY = Math.max(this.y, Math.min(cy, this.y + this.h))
    const dx = cx - closestX
    const dy = cy - closestY
    return dx * dx + dy * dy <= r * r
  }

  insertIntoChild(entity) {
    const px = entity.pos.x
    const py = entity.pos.y
    if (this.nw.contains(px, py)) this.nw.insert(entity)
    else if (this.ne.contains(px, py)) this.ne.insert(entity)
    else if (this.sw.contains(px, py)) this.sw.insert(entity)
    else if (this.se.contains(px, py)) this.se.insert(entity)
  }

  insert(entity) {
    if (!this.contains(entity.pos.x, entity.pos.y)) return false

    if (!this.divided) {
      if (this.entities.length < this.capacity) {
        this.entities.push(entity)
        return true
      }
      this.subdivide()
    }

    this.insertIntoChild(entity)
    return true
  }

  queryRadius(cx, cy, r, result) {
    if (!this.intersectsCircle(cx, cy, r)) return

    if (!this.divided) {
      for (const entity of this.entities) {
        result.push(entity)
      }
      return
    }

    this.nw.queryRadius(cx, cy, r, result)
    this.ne.queryRadius(cx, cy, r, result)
    this.sw.queryRadius(cx, cy, r, result)
    this.se.queryRadius(cx, cy, r, result)
  }
}

/**
 * Drop-in replacement for SpatialGrid.
 * Same public API: clear(), insert(entity), queryRadius(pos, radius).
 */
class Quadtree {
  constructor(boundary, capacity = 8) {
    this.boundary = boundary
    this.capacity = capacity
    this.root = new QuadtreeNode(boundary.x, boundary.y, boundary.w, boundary.h, capacity)
  }

  clear() {
    this.root = new QuadtreeNode(this.boundary.x, this.boundary.y, this.boundary.w, this.boundary.h, this.capacity)
  }

  insert(entity) {
    this.root.insert(entity)
  }

  queryRadius(pos, radius) {
    const result = []
    this.root.queryRadius(pos.x, pos.y, radius, result)
    return result
  }
}

export default Quadtree
