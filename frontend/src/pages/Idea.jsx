import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { describeBrand, getToken } from '../api/client.js'
import AppShell from '../components/AppShell.jsx'
import './Idea.css'

export default function Idea() {
  const [idea, setIdea] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (idea.trim().length < 10) {
      setError('Décrivez votre idée en quelques mots (au moins 10 caractères).')
      return
    }
    if (!getToken()) {
      navigate('/login')
      return
    }
    setLoading(true)
    try {
      const suggestions = await describeBrand(idea.trim())
      navigate('/brand/review', { state: { description: idea.trim(), suggestions } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell current={1}>
      <div className="idea-page">
        <main className="idea-main">
          <div className="idea-glow" aria-hidden="true" />
          <p className="eyebrow">Étape 1 — Votre idée</p>
          <h1>Parlez-nous de votre projet</h1>
          <p className="idea-sub">
            Décrivez votre idée comme vous le raconteriez à un ami. Pas besoin de
            jargon : expliquez le problème que vous résolvez et pour qui.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <textarea
              className="idea-box"
              placeholder="Ex : je veux lancer une box mensuelle de snacks sains pour les étudiants qui révisent…"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={7}
            />

            {error && <p className="form-error">{error}</p>}

            <button className="btn btn-primary idea-submit" disabled={loading}>
              {loading ? 'Analyse en cours…' : 'Continuer'}
            </button>
          </form>
        </main>
      </div>
    </AppShell>
  )
}
