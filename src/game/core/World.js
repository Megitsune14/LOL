import { TEAM_BLUE, TEAM_RED } from './constants'
import p5 from 'p5'
import Quadtree from './Quadtree'
import Hero from '../entities/Hero'
import Minion from '../entities/Minion'
import Turret from '../entities/Turret'
import Projectile from '../entities/Projectile'
import MapObstacleExtractor from './MapObstacleExtractor'
import { catmullRomSpline } from './CurveUtils'

class World {
  constructor(p, config = {}, callbacks = {}) {
    this.p = p
    this.width = config.width ?? 2048
    this.height = config.height ?? 2048
    this.role = config.role ?? 'Top'
    this.summonerName = config.summonerName ?? 'Invocateur'
    this.callbacks = callbacks
    this.mapImage = config.mapImage ?? null

    this.entities = []
    this.projectiles = []
    this.mapObstacles = []
    this.grid = new Quadtree({ x: 0, y: 0, w: this.width, h: this.height })
    this.kills = { blue: 0, red: 0 }
    this.winner = null
    this.frame = 0
    this.waveSpawned = false
    this.minionsPerLane = 6
    this.laneOrder = ['top', 'mid', 'bot']
    this.laneWidths = { top: 27, mid: 24, bot: 27 }
    this.controlPoints = this.createLaneControlPoints()
    this.laneGuides = this.createLaneGuides()
    this.lanes = this.smoothLanes(this.laneGuides)
    this.debugObstacles = false

    this.bootstrapEntities()
    this.buildMapObstacles()
    this.spawnInitialWave()
  }

  createLaneControlPoints() {
    const w = this.width
    const h = this.height
    return {
      blueBaseSpawn: this.p.createVector(170, h - 170),
      redBaseSpawn: this.p.createVector(w - 170, 170),
      blueBaseExit: this.p.createVector(260, h - 260),
      redBaseExit: this.p.createVector(w - 260, 260),
      blueTopSplit: this.p.createVector(180, h * 0.55),
      blueMidSplit: this.p.createVector(w * 0.35, h * 0.65),
      blueBotSplit: this.p.createVector(w * 0.55, h - 180),
      redTopSplit: this.p.createVector(w * 0.45, 180),
      redMidSplit: this.p.createVector(w * 0.65, h * 0.35),
      redBotSplit: this.p.createVector(w - 180, h * 0.45),
      topCorner: this.p.createVector(w * 0.14, h * 0.14),
      midControlA: this.p.createVector(w * 0.5, h * 0.5),
      botCorner: this.p.createVector(w * 0.86, h * 0.86),
    }
  }

  createLaneGuides() {
    const w = this.width
    const h = this.height
    const v = (x, y) => this.p.createVector(x, y)

    const top = [
      v(170, h - 170),
      v(190, h - 370),
      v(165, h * 0.55),
      v(148, h * 0.35),
      v(155, h * 0.19),
      v(w * 0.19, 155),
      v(w * 0.35, 148),
      v(w * 0.52, 155),
      v(w * 0.68, 160),
      v(w - 370, 190),
      v(w - 170, 170),
    ]

    const mid = [
      v(170, h - 170),
      v(340, h - 340),
      v(630, h - 570),
      v(805, h - 740),
      v(940, h - 940),
      v(w / 2, h / 2),
      v(w - 940, 940),
      v(w - 805, 740),
      v(w - 630, 570),
      v(w - 340, 340),
      v(w - 170, 170),
    ]

    const bot = [
      v(170, h - 170),
      v(370, h - 190),
      v(w * 0.32, h - 148),
      v(w * 0.48, h - 155),
      v(w * 0.65, h - 160),
      v(w * 0.81, h - 155),
      v(w - 155, h * 0.81),
      v(w - 148, h * 0.68),
      v(w - 155, h * 0.52),
      v(w - 160, h * 0.35),
      v(w - 190, 370),
      v(w - 170, 170),
    ]

    return { top, mid, bot }
  }

  smoothLanes(guides) {
    const result = {}
    for (const [id, pts] of Object.entries(guides)) {
      result[id] = catmullRomSpline(this.p, pts, 8)
    }
    return result
  }

  buildMapObstacles() {
    this.mapObstacles = MapObstacleExtractor.fromImage(this.p, this.mapImage, {
      worldWidth: this.width,
      worldHeight: this.height,
      sampleStep: 13,
      lumaThreshold: 35,
      baseRadius: 9,
      lanePath: Object.values(this.lanes),
      laneClearance: 38,
      clearPoints: [
        { pos: this.controlPoints.blueTopSplit, radius: 52 },
        { pos: this.controlPoints.blueMidSplit, radius: 52 },
        { pos: this.controlPoints.blueBotSplit, radius: 52 },
        { pos: this.controlPoints.redTopSplit, radius: 52 },
        { pos: this.controlPoints.redMidSplit, radius: 52 },
        { pos: this.controlPoints.redBotSplit, radius: 52 },
        { pos: this.controlPoints.topCorner, radius: 60 },
        { pos: this.controlPoints.botCorner, radius: 60 },
        { pos: this.controlPoints.blueBaseExit, radius: 42 },
        { pos: this.controlPoints.redBaseExit, radius: 42 },
      ],
    })
  }

  setMapImage(image) {
    this.mapImage = image
    this.buildMapObstacles()
  }

  bootstrapEntities() {
    const w = this.width
    const h = this.height

    this.hero = new Hero(this.p, {
      team: TEAM_BLUE,
      x: 250,
      y: h - 240,
      role: this.role,
    })

    this.blueNexus = new Turret(this.p, { team: TEAM_BLUE, x: 148, y: h - 148 })
    this.redNexus = new Turret(this.p, { team: TEAM_RED, x: w - 148, y: 148 })

    this.blueMidOuter = new Turret(this.p, { team: TEAM_BLUE, x: w * 0.37, y: h * 0.64 })
    this.redMidOuter = new Turret(this.p, { team: TEAM_RED, x: w * 0.63, y: h * 0.36 })

    this.blueTopOuter = new Turret(this.p, { team: TEAM_BLUE, x: 160, y: h * 0.42 })
    this.redTopOuter = new Turret(this.p, { team: TEAM_RED, x: w * 0.58, y: 155 })

    this.blueBotOuter = new Turret(this.p, { team: TEAM_BLUE, x: w * 0.42, y: h - 155 })
    this.redBotOuter = new Turret(this.p, { team: TEAM_RED, x: w - 160, y: h * 0.58 })

    this.entities.push(
      this.hero,
      this.blueNexus,
      this.redNexus,
      this.blueMidOuter,
      this.redMidOuter,
      this.blueTopOuter,
      this.redTopOuter,
      this.blueBotOuter,
      this.redBotOuter,
    )
  }

  setHeroMoveTarget(x, y) {
    if (!this.hero || this.hero.isDestroyed) return
    this.hero.setMoveTarget(this.p.createVector(x, y))
  }

  getAllAgents() {
    return this.entities.filter((e) => 'vel' in e && !e.isDestroyed)
  }

  getNearAgents(pos, radius) {
    return this.grid.queryRadius(pos, radius)
  }

  getEnemiesOf(team) {
    return this.entities.filter((entity) => entity.team !== team && !entity.isDestroyed)
  }

  spawnProjectile({ from, target, damage, team }) {
    this.projectiles.push(
      new Projectile(this.p, {
        x: from.pos.x,
        y: from.pos.y,
        target,
        damage,
        team,
      }),
    )
  }

  spawnInitialWave() {
    if (this.waveSpawned) return
    const laneEntries = this.laneOrder.map((laneId) => [laneId, this.lanes[laneId]])
    const spacing = 18
    const laneSpawnOffsets = { top: -24, mid: 0, bot: 24 }

    for (const [laneId, lanePath] of laneEntries) {
      const blueSpawn = this.controlPoints.blueBaseSpawn
      const redSpawn = this.controlPoints.redBaseSpawn
      const blueDir = p5.Vector.sub(lanePath[1], lanePath[0]).normalize()
      const redDir = p5.Vector.sub(lanePath[lanePath.length - 2], lanePath[lanePath.length - 1]).normalize()
      const blueNormal = this.p.createVector(-blueDir.y, blueDir.x).mult(laneSpawnOffsets[laneId] ?? 0)
      const redNormal = this.p.createVector(-redDir.y, redDir.x).mult(laneSpawnOffsets[laneId] ?? 0)

      for (let i = 0; i < this.minionsPerLane; i += 1) {
        const bluePos = blueSpawn.copy().add(blueNormal).sub(blueDir.copy().mult(i * spacing))
        const redPos = redSpawn.copy().add(redNormal).sub(redDir.copy().mult(i * spacing))
        this.entities.push(
          new Minion(this.p, {
            team: TEAM_BLUE,
            x: bluePos.x,
            y: bluePos.y,
            pathPoints: lanePath,
            laneId,
            laneWidth: this.laneWidths[laneId],
            forward: 1,
          }),
        )
        this.entities.push(
          new Minion(this.p, {
            team: TEAM_RED,
            x: redPos.x,
            y: redPos.y,
            pathPoints: lanePath,
            laneId,
            laneWidth: this.laneWidths[laneId],
            forward: -1,
          }),
        )
      }
    }
    this.waveSpawned = true
  }

  registerKill(team) {
    if (!this.kills[team]) this.kills[team] = 0
    this.kills[team] += 1
  }

  checkVictory() {
    if (this.winner) return
    if (this.redNexus.isDestroyed) this.winner = TEAM_BLUE
    if (this.blueNexus.isDestroyed) this.winner = TEAM_RED
    if (this.winner && this.callbacks.onGameOver) {
      this.callbacks.onGameOver(this.winner)
    }
  }

  toggleDebugObstacles() {
    this.debugObstacles = !this.debugObstacles
  }

  update() {
    this.frame += 1

    this.grid.clear()
    for (const entity of this.entities) {
      if (!entity.isDestroyed) this.grid.insert(entity)
    }

    for (const entity of this.entities) {
      if (!entity.isDestroyed) entity.update(this)
    }
    for (const projectile of this.projectiles) {
      if (!projectile.isDestroyed) projectile.update(this)
    }

    this.entities = this.entities.filter((entity) => !entity.isDestroyed || entity === this.blueNexus || entity === this.redNexus)
    this.projectiles = this.projectiles.filter((projectile) => !projectile.isDestroyed)

    this.checkVictory()

    if (this.callbacks.onHudUpdate) {
      this.callbacks.onHudUpdate({
        heroHp: this.hero.hp,
        heroMaxHp: this.hero.maxHp,
        role: this.hero.role,
        summonerName: this.summonerName,
        killsBlue: this.kills.blue,
        killsRed: this.kills.red,
        obstacleCount: this.mapObstacles.length,
        laneCount: Object.keys(this.lanes).length,
        waveSpawned: this.waveSpawned,
        minionCount: this.entities.filter((entity) => entity instanceof Minion && !entity.isDestroyed).length,
        topMinions: this.entities.filter((entity) => entity instanceof Minion && entity.laneId === 'top' && !entity.isDestroyed).length,
        midMinions: this.entities.filter((entity) => entity instanceof Minion && entity.laneId === 'mid' && !entity.isDestroyed).length,
        botMinions: this.entities.filter((entity) => entity instanceof Minion && entity.laneId === 'bot' && !entity.isDestroyed).length,
      })
    }
  }

  render() {
    const p = this.p
    if (this.mapImage) {
      p.image(this.mapImage, 0, 0, this.width, this.height)
    } else {
      p.background('#09070f')
    }
    this.renderLane()

    if (this.debugObstacles) {
      for (const obstacle of this.mapObstacles) {
        obstacle.renderDebug()
      }
    }

    for (const entity of this.entities) {
      if (!entity.isDestroyed) entity.render()
    }
    for (const projectile of this.projectiles) {
      if (!projectile.isDestroyed) projectile.render()
    }

    if (this.winner) {
      p.fill(8, 7, 13, 190)
      p.rect(0, 0, this.width, this.height)
      p.fill('#f6f3ff')
      p.textAlign(p.CENTER, p.CENTER)
      p.textSize(36)
      p.text(this.winner === TEAM_BLUE ? 'Victoire' : 'Défaite', this.width / 2, this.height / 2)
    }
  }

  renderLane() {
    const p = this.p
    for (const guide of Object.values(this.laneGuides)) {
      const first = guide[0]
      const last = guide[guide.length - 1]

      p.noFill()
      p.stroke(145, 107, 255, 130)
      p.strokeWeight(34)
      p.beginShape()
      p.splineVertex(first.x, first.y)
      for (const pt of guide) p.splineVertex(pt.x, pt.y)
      p.splineVertex(last.x, last.y)
      p.endShape()

      p.stroke(228, 215, 255, 160)
      p.strokeWeight(2)
      p.beginShape()
      p.splineVertex(first.x, first.y)
      for (const pt of guide) p.splineVertex(pt.x, pt.y)
      p.splineVertex(last.x, last.y)
      p.endShape()
    }
  }
}

export default World
