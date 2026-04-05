import { useState } from 'react'
import Reveal from '../components/landing/Reveal'
import './Landing.css'

const roles = [
  { name: 'Top', style: 'Duéliste résistant', color: '#a45eff' },
  { name: 'Jungle', style: 'Contrôle de carte', color: '#7c4dff' },
  { name: 'Mid', style: 'Burst et roaming', color: '#d08cff' },
  { name: 'ADC', style: 'DPS tardif', color: '#9f6aff' },
  { name: 'Support', style: 'Engage et protection', color: '#7a43e3' },
]

function Landing() {
  const [summonerName, setSummonerName] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const canPlay = summonerName.trim().length > 0 && selectedRole

  return (
    <main className="landing">
      <div className="ambient-layer" aria-hidden="true" />

      <section id="hero" className="hero-section">
        <Reveal className="hero-copy hero-only">
          <p className="eyebrow">NOUVEL UNIVERS MOBA</p>
          <h1>La Ligue Des Légendes</h1>
          <p className="lead">
            Veuillez choisir votre nom d'invocateur :
          </p>

          <form className="hero-form" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="summonerName">Nom d'invocateur</label>
            <input
              id="summonerName"
              name="summonerName"
              type="text"
              placeholder="Ex: ShadowCarry"
              value={summonerName}
              onChange={(event) => setSummonerName(event.target.value)}
            />
          </form>

          <div className="roles-header">
            <h2>Rôles</h2>
            <p>
              {selectedRole
                ? `Rôle sélectionné : ${selectedRole}`
                : 'Cliquez sur un rôle pour le sélectionner'}
            </p>
          </div>

          <div className="grid roles-grid">
            {roles.map((role, idx) => (
              <Reveal
                key={role.name}
                as="button"
                className={`role-card role-button ${selectedRole === role.name ? 'is-selected' : ''}`}
                delay={idx * 85}
                onClick={() => setSelectedRole(role.name)}
                type="button"
              >
                <p className="role-name" style={{ color: role.color }}>
                  {role.name}
                </p>
                <p>{role.style}</p>
              </Reveal>
            ))}
          </div>

          <div className="play-action">
            <button
              type="button"
              className="play-button"
              disabled={!canPlay}
              onClick={() => {
                sessionStorage.setItem(
                  'lolGameConfig',
                  JSON.stringify({
                    summonerName: summonerName.trim(),
                    role: selectedRole,
                  }),
                )
                window.location.assign('/jeu')
              }}
            >
              Jouer
            </button>
          </div>
        </Reveal>
      </section>

      <a href="/aide" className="help-fab" aria-label="Accéder à la page d'aide">
        Aide
      </a>
    </main>
  )
}

export default Landing
