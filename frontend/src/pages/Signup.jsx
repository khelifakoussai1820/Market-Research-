import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register, getToken } from '../api/client.js'
import './Login.css'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (getToken()) navigate('/idea', { replace: true })
  }, [navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/idea')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell">
      <aside className="login-aside">
        <div className="aside-glow" aria-hidden="true" />
        <Link to="/" className="aside-brand">
          <span className="nav-logo" aria-hidden="true" />
          Market Research
        </Link>
        <div className="aside-body">
          <h2>Rejoignez le studio.</h2>
          <p>
            Créez votre compte pour lancer vos premiers questionnaires et
            sessions de décision assistée.
          </p>
          <ul className="aside-points">
            <li>Gratuit pour démarrer</li>
            <li>Aucune carte bancaire</li>
            <li>Export des résultats</li>
          </ul>
        </div>
        <p className="aside-foot">© {new Date().getFullYear()} Market Research</p>
      </aside>

      <main className="login-main">
        <div className="login-card">
          <p className="eyebrow">Inscription</p>
          <h1>Créer un compte</h1>
          <p className="login-sub">Quelques secondes et c’est parti.</p>

          <form onSubmit={handleSubmit} noValidate>
            <label className="field">
              <span>Nom complet</span>
              <input
                type="text"
                autoComplete="name"
                placeholder="Marie Curie"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="vous@marque.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Mot de passe</span>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button className="btn btn-primary login-submit" disabled={loading}>
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>

          <p className="login-alt">
            Déjà un compte ?{' '}
            <Link className="link" to="/login">
              Se connecter
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
