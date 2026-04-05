import { useMemo, useState } from 'react'
import P5Canvas from '../components/game/P5Canvas'
import GameHUD from '../components/game/GameHUD'
import './Game.css'

function readGameConfig() {
  try {
    const raw = sessionStorage.getItem('lolGameConfig')
    if (!raw) return { summonerName: 'Invocateur', role: 'Top' }
    const parsed = JSON.parse(raw)
    return {
      summonerName: parsed.summonerName || 'Invocateur',
      role: parsed.role || 'Top',
    }
  } catch {
    return { summonerName: 'Invocateur', role: 'Top' }
  }
}

function Game() {
  const [hud, setHud] = useState({
    summonerName: 'Invocateur',
    role: 'Top',
    heroHp: 1,
    heroMaxHp: 1,
    killsBlue: 0,
    killsRed: 0,
    obstacleCount: 0,
    laneCount: 0,
    waveSpawned: false,
    minionCount: 0,
    topMinions: 0,
    midMinions: 0,
    botMinions: 0,
  })
  const [winner, setWinner] = useState('')
  const gameConfig = readGameConfig()

  const canvasConfig = useMemo(
    () => ({
      width: 2048,
      height: 2048,
      summonerName: gameConfig.summonerName,
      role: gameConfig.role,
    }),
    [gameConfig.role, gameConfig.summonerName],
  )

  return (
    <main className="game-page">
      <header className="game-header">
        <h1>Partie solo</h1>
        <a href="/" className="game-back">
          Retour à l'accueil
        </a>
      </header>

      <GameHUD hud={hud} winner={winner} />

      <section className="game-canvas-wrap" aria-label="Zone de jeu">
        <P5Canvas config={canvasConfig} onHudUpdate={setHud} onGameOver={setWinner} />
      </section>
    </main>
  )
}

export default Game
