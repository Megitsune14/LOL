import MapObstacle from '../entities/MapObstacle'
import p5 from 'p5'

class MapObstacleExtractor {
  static fromImage(p, image, options = {}) {
    if (!image) return []

    const worldWidth = options.worldWidth ?? image.width
    const worldHeight = options.worldHeight ?? image.height
    const step = options.sampleStep ?? 14
    const threshold = options.lumaThreshold ?? 40
    const baseRadius = options.baseRadius ?? 8
    const lanePath = options.lanePath ?? []
    const laneClearance = options.laneClearance ?? 24
    const clearPoints = options.clearPoints ?? []

    const obstacles = []
    image.loadPixels()
    const scaleX = worldWidth / image.width
    const scaleY = worldHeight / image.height

    for (let y = 0; y < image.height; y += step) {
      for (let x = 0; x < image.width; x += step) {
        const idx = (y * image.width + x) * 4
        const r = image.pixels[idx]
        const g = image.pixels[idx + 1]
        const b = image.pixels[idx + 2]
        const a = image.pixels[idx + 3]
        if (a < 50) continue
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
        if (luma > threshold) continue

        const worldX = x * scaleX
        const worldY = y * scaleY
        if (MapObstacleExtractor.isNearLane(p, worldX, worldY, lanePath, laneClearance)) continue
        if (MapObstacleExtractor.isNearClearPoint(p, worldX, worldY, clearPoints)) continue

        obstacles.push(
          new MapObstacle(p, {
            x: worldX,
            y: worldY,
            radius: baseRadius + step * 0.25,
          }),
        )
      }
    }

    return MapObstacleExtractor.compactObstacles(p, obstacles, step * 1.8)
  }

  static isNearLane(p, x, y, pointsOrPaths, clearance) {
    const paths = Array.isArray(pointsOrPaths?.[0]) ? pointsOrPaths : [pointsOrPaths]
    const probe = p.createVector(x, y)
    for (const points of paths) {
      if (!points || points.length < 2) continue
      for (let i = 0; i < points.length - 1; i += 1) {
        const a = points[i]
        const b = points[i + 1]
        const normal = MapObstacleExtractor.getNormalPoint(p, probe, a, b)
        const ab = p5.Vector.sub(b, a)
        const an = p5.Vector.sub(normal, a)
        const proj = an.dot(ab) / (ab.magSq() || 1)
        if (proj < 0 || proj > 1) continue
        const distance = probe.dist(normal)
        if (distance < clearance) return true
      }
    }
    return false
  }

  static compactObstacles(p, obstacles, mergeDistance) {
    const merged = []
    for (const obstacle of obstacles) {
      let packed = false
      for (const group of merged) {
        if (group.pos.dist(obstacle.pos) < mergeDistance) {
          const count = group.count + 1
          group.pos.mult(group.count).add(obstacle.pos).div(count)
          group.radius = p.max(group.radius, obstacle.radius)
          group.count = count
          packed = true
          break
        }
      }
      if (!packed) {
        merged.push({
          pos: obstacle.pos.copy(),
          radius: obstacle.radius,
          count: 1,
        })
      }
    }
    return merged.map(
      (group) =>
        new MapObstacle(p, {
          x: group.pos.x,
          y: group.pos.y,
          radius: group.radius + p.min(12, group.count * 0.2),
        }),
    )
  }

  static isNearClearPoint(p, x, y, clearPoints) {
    if (!clearPoints.length) return false
    const probe = p.createVector(x, y)
    for (const clearPoint of clearPoints) {
      if (!clearPoint?.pos || !clearPoint?.radius) continue
      if (probe.dist(clearPoint.pos) < clearPoint.radius) return true
    }
    return false
  }

  static getNormalPoint(p, point, a, b) {
    const ap = p5.Vector.sub(point, a)
    const ab = p5.Vector.sub(b, a)
    ab.normalize()
    ab.mult(ap.dot(ab))
    return p5.Vector.add(a, ab)
  }
}

export default MapObstacleExtractor
