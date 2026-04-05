class SpatialGrid {
  constructor(cellSize = 80) {
    this.cellSize = cellSize
    this.cells = new Map()
  }

  clear() {
    this.cells.clear()
  }

  key(x, y) {
    return `${x},${y}`
  }

  hashPosition(pos) {
    return {
      x: Math.floor(pos.x / this.cellSize),
      y: Math.floor(pos.y / this.cellSize),
    }
  }

  insert(entity) {
    const { x, y } = this.hashPosition(entity.pos)
    const key = this.key(x, y)
    if (!this.cells.has(key)) this.cells.set(key, [])
    this.cells.get(key).push(entity)
  }

  queryRadius(pos, radius) {
    const center = this.hashPosition(pos)
    const range = Math.ceil(radius / this.cellSize)
    const result = []
    for (let dx = -range; dx <= range; dx += 1) {
      for (let dy = -range; dy <= range; dy += 1) {
        const key = this.key(center.x + dx, center.y + dy)
        const chunk = this.cells.get(key)
        if (!chunk) continue
        result.push(...chunk)
      }
    }
    return result
  }
}

export default SpatialGrid
