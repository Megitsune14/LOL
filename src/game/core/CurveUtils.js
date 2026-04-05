/**
 * Catmull-Rom spline interpolation.
 * Takes an array of p5.Vector control points and returns a dense array of
 * smoothly interpolated points suitable for both rendering and path-following.
 *
 * @param {p5}            p          – p5 instance (used for createVector)
 * @param {p5.Vector[]}   points     – ordered control points (≥ 2)
 * @param {number}        resolution – subdivisions per segment (default 8)
 * @returns {p5.Vector[]} interpolated path
 */
export function catmullRomSpline(p, points, resolution = 8) {
  if (points.length < 2) return points.map((pt) => pt.copy())

  const ext = [points[0], ...points, points[points.length - 1]]
  const result = []

  for (let i = 1; i < ext.length - 2; i++) {
    const p0 = ext[i - 1]
    const p1 = ext[i]
    const p2 = ext[i + 1]
    const p3 = ext[i + 2]

    for (let s = 0; s < resolution; s++) {
      const t = s / resolution
      const t2 = t * t
      const t3 = t2 * t

      result.push(
        p.createVector(
          0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
        ),
      )
    }
  }

  result.push(points[points.length - 1].copy())
  return result
}
