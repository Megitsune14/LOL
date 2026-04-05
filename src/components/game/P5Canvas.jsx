import { useEffect, useRef } from 'react'
import p5 from 'p5'
import GameEngine from '../../game/core/GameEngine'

function P5Canvas({ config, onHudUpdate, onGameOver }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const sketch = (p) => {
      let engine = null

      p.setup = () => {
        p.createCanvas(config.width, config.height)
        engine = new GameEngine(p, config, { onHudUpdate, onGameOver })
        p.loadImage(
          '/minimap.png',
          (img) => {
            if (!engine) return
            engine.onMapLoaded(img)
          },
          () => {
            // Fallback silencieux: le jeu continue sans map image.
          },
        )
      }

      p.draw = () => {
        if (!engine) return
        engine.update()
        engine.render()
      }

      p.mousePressed = () => {
        if (!engine) return
        if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) return
        engine.onPointerPressed(p.mouseX, p.mouseY)
      }

      p.keyPressed = () => {
        if (!engine) return
        if (p.key === 'o' || p.key === 'O') {
          engine.onToggleDebug()
        }
      }
    }

    const instance = new p5(sketch, containerRef.current)
    return () => {
      instance.remove()
    }
  }, [config, onGameOver, onHudUpdate])

  return <div ref={containerRef} />
}

export default P5Canvas
