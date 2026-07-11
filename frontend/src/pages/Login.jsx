import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, getToken } from '../api/client.js'
import './Login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (getToken()) navigate('/idea', { replace: true })
  }, [navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
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
          <h2>Votre studio de décision de marque.</h2>
          <p>
            Connectez-vous pour retrouver vos tableaux de bord, questionnaires
            et sessions de décision.
          </p>
          <ul className="aside-points">
            <li>Signaux marché en temps réel</li>
            <li>Questionnaires clients</li>
            <li>Moteur de décision assisté</li>
          </ul>
        </div>
        <p className="aside-foot">© {new Date().getFullYear()} Market Research</p>
      </aside>

      <main className="login-main">
        <div className="login-card">
          <p className="eyebrow">Connexion</p>
          <h1>Bon retour</h1>
          <p className="login-sub">
            Entrez vos identifiants pour accéder au studio.
          </p>

          <form onSubmit={handleSubmit} noValidate>
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
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <div className="field-row">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Se souvenir de moi</span>
              </label>
              <a className="link" href="#reset">
                Mot de passe oublié ?
              </a>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button className="btn btn-primary login-submit" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="login-alt">
            Pas encore de compte ?{' '}
            <Link className="link" to="/signup">
              Créer un compte
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
