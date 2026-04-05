import Landing from './pages/Landing'
import Help from './pages/Help'
import Game from './pages/Game'

function App() {
  if (window.location.pathname === '/aide') {
    return <Help />
  }
  if (window.location.pathname === '/jeu') {
    return <Game />
  }

  return <Landing />
}

export default App
