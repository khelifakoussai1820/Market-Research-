import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../api/client.js'
import './AppShell.css'

const STEPS = [
  { n: 1, label: 'Idée' },
  { n: 2, label: 'Profil' },
  { n: 3, label: 'Concurrents' },
  { n: 4, label: 'Rapport' },
]

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 8.5l3 3 6-7"
      />
    </svg>
  )
}

export default function AppShell({ current = 1, children }) {
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="flow">
      <header className="flow-header">
        <Link to="/" className="flow-brand">
          <span className="nav-logo" aria-hidden="true" />
          Market Research
        </Link>

        <nav className="flow-steps" aria-label="Progression">
          {STEPS.map((s, i) => {
            const state =
              s.n === current ? 'active' : s.n < current ? 'done' : ''
            return (
              <div key={s.n} className={`flow-step ${state}`}>
                <span className="flow-step-dot">
                  {s.n < current ? <CheckIcon /> : s.n}
                </span>
                <span className="flow-step-label">{s.label}</span>
                {i < STEPS.length - 1 && <span className="flow-step-bar" />}
              </div>
            )
          })}
        </nav>

        <button className="flow-logout" onClick={handleLogout}>
          Déconnexion
        </button>
      </header>

      <main className="flow-main">{children}</main>
    </div>
  )
}
