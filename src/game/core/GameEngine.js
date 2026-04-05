import World from './World'

class GameEngine {
  constructor(p, config, callbacks) {
    this.p = p
    this.world = new World(p, config, callbacks)
  }

  update() {
    this.world.update()
  }

  render() {
    this.world.render()
  }

  onPointerPressed(x, y) {
    this.world.setHeroMoveTarget(x, y)
  }

  onToggleDebug() {
    this.world.toggleDebugObstacles()
  }

  onMapLoaded(image) {
    this.world.setMapImage(image)
  }
}

export default GameEngine
