import './App.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Formulaire from './pages/Formulaire.jsx'

const features = [
  {
    key: 'dashboard',
    tag: 'Signaux',
    title: 'Dashboard',
    desc: 'Vue synthétique des réponses, signaux marché et décisions en cours, le tout centralisé.',
    points: ['Synthèse en temps réel', 'Indicateurs clés', 'Alertes de positionnement'],
    component: <Dashboard />,
  },
  {
    key: 'formulaire',
    tag: 'Collecte',
    title: 'Formulaire',
    desc: 'Génération et rendu de questionnaires pour tester vos concepts de marque auprès des cibles.',
    points: ['Questionnaires dynamiques', 'Ciblage par segment', 'Export des réponses'],
    component: <Formulaire />,
  },
  {
    key: 'chat',
    tag: 'Décision',
    title: 'Chat',
    desc: 'Posez vos questions au moteur de décision et obtenez des recommandations argumentées.',
    points: ['Q/R contextuelles', 'Recommandations', 'Historique des sessions'],
    component: (
      <>
        <p>Posez vos questions et recevez des réponses sourcées.</p>
        <Link className="link" to="/chat">
          Ouvrir le chat →
        </Link>
      </>
    ),
  },
]

const steps = [
  { n: '01', title: 'Collectez', desc: 'Diffusez un formulaire et agrégez les retours clients.' },
  { n: '02', title: 'Analysez', desc: 'Visualisez signaux et sentiment dans le dashboard.' },
  { n: '03', title: 'Décidez', desc: 'Interrogez le moteur de décision pour trancher.' },
]

const stats = [
  { value: '3', label: 'Modules intégrés' },
  { value: '∞', label: 'Réponses collectables' },
  { value: '1', label: 'Studio de décision' },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-shell">
      <nav className="nav">
        <a className="nav-brand" href="#top">
          <span className="nav-logo" aria-hidden="true" />
          Market Research
        </a>

        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a href="#features">Modules</a>
          <a href="#how">Fonctionnement</a>
          <Link to="/chat">Chat</Link>
          <a href="#start">Démarrer</a>
          <Link className="nav-cta" to="/idea">
            Lancer le studio
          </Link>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="hero-glow" aria-hidden="true" />
        <p className="eyebrow">Brand decision studio</p>
        <h1>
          Décidez mieux, plus vite,
          <br />
          avec la voix de votre marché.
        </h1>
        <p className="lead">
          Collecte de retours, analyse concurrentielle et aide à la décision
          réunies dans un seul frontend. Transformez les opinions de vos clients
          en décisions de marque assumées.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/idea">
            Lancer le studio
          </Link>
          <a className="btn btn-ghost" href="#features">
            Découvrir les modules
          </a>
        </div>

        <ul className="stats">
          {stats.map((s) => (
            <li key={s.label}>
              <span className="stats-value">{s.value}</span>
              <span className="stats-label">{s.label}</span>
            </li>
          ))}
        </ul>
      </header>

      <section className="section" id="features">
        <div className="section-head">
          <p className="eyebrow">Modules</p>
          <h2>Tout ce qu’il faut pour décider</h2>
          <p className="section-sub">
            Trois briques complémentaires, pensées pour passer de l’intuition à
            la preuve.
          </p>
        </div>

        <div className="features">
          {features.map((f) => (
            <article className="feature-card" key={f.key}>
              <span className="feature-tag">{f.tag}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <ul className="feature-points">
                {f.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div className="feature-preview">{f.component}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-alt" id="how">
        <div className="section-head">
          <p className="eyebrow">Fonctionnement</p>
          <h2>Un flux décisionnel en trois temps</h2>
        </div>
        <ol className="steps">
          {steps.map((s) => (
            <li className="step" key={s.n}>
              <span className="step-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta" id="start">
        <div className="cta-card">
          <h2>Prêt à écouter votre marché ?</h2>
          <p>
            Ouvrez le studio et transformez vos retours clients en décisions
            claires dès maintenant.
          </p>
          <Link className="btn btn-primary" to="/idea">
            Démarrer gratuitement
          </Link>
        </div>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Market Research — Brand decision studio</span>
        <span className="footer-muted">Conçu pour les décideurs de marque.</span>
      </footer>
    </div>
  )
}

export default App
