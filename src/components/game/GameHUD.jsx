function GameHUD({ hud, winner }) {
  const hpRatio = hud.heroMaxHp > 0 ? hud.heroHp / hud.heroMaxHp : 0

  return (
    <div className="game-hud">
      <div className="hud-line">
        <strong>{hud.summonerName}</strong>
        <span>Rôle: {hud.role}</span>
        <span>Kills bleu: {hud.killsBlue}</span>
        <span>Kills rouge: {hud.killsRed}</span>
        <span>Obstacles: {hud.obstacleCount}</span>
        <span>Lanes: {hud.laneCount}</span>
        <span>Wave: {hud.waveSpawned ? 'unique spawnée' : 'non spawnée'}</span>
        <span>Sbires actifs: {hud.minionCount}</span>
        <span>Top: {hud.topMinions}</span>
        <span>Mid: {hud.midMinions}</span>
        <span>Bot: {hud.botMinions}</span>
        <span>Debug obstacles: touche O</span>
      </div>
      <div className="hud-hp">
        <div className="hud-hp-fill" style={{ width: `${Math.max(0, hpRatio) * 100}%` }} />
      </div>
      {winner && (
        <p className="hud-winner">
          {winner === 'blue' ? 'Victoire de votre équipe.' : 'Défaite. Les IA ennemies gagnent.'}
        </p>
      )}
    </div>
  )
}

export default GameHUD
