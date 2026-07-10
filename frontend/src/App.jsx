import './App.css'
import Dashboard from './pages/Dashboard.jsx'
import Formulaire from './pages/Formulaire.jsx'
import Chat from './pages/Chat.jsx'

function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Market Research</p>
        <h1>Brand decision studio</h1>
        <p className="lead">
          Collecte de retours, analyse concurrents et aide à la décision dans
          un seul frontend.
        </p>
      </header>

      <section className="app-grid">
        <Dashboard />
        <Formulaire />
        <Chat />
      </section>
    </main>
  )
}

export default App
