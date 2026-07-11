import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { confirmBrand } from '../api/client.js'
import AppShell from '../components/AppShell.jsx'
import './Brand.css'

export default function BrandCompetitors() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state

  const [competitors, setCompetitors] = useState(
    Array.isArray(state?.competitors) ? state.competitors : [],
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!state?.fields) {
    return (
      <AppShell current={3}>
        <div className="brand-shell">
          <div className="brand-card">
            <p className="form-error">Rien à confirmer pour l’instant.</p>
            <Link className="btn btn-primary" to="/idea">Décrire mon idée</Link>
          </div>
        </div>
      </AppShell>
    )
  }

  function updateCompetitor(i, value) {
    setCompetitors((list) => list.map((c, idx) => (idx === i ? value : c)))
  }
  function addCompetitor() {
    setCompetitors((list) => [...list, ''])
  }
  function removeCompetitor(i) {
    setCompetitors((list) => list.filter((_, idx) => idx !== i))
  }

  async function handleConfirm(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const name = state.name?.trim() || deriveName(state.description)
      const payload = {
        name,
        description: state.description,
        mission: state.fields.mission,
        industry: state.fields.industry,
        target_audience: state.fields.target_audience,
        brand_tone: state.fields.brand_tone,
        competitors: competitors.map((c) => c.trim()).filter(Boolean),
      }
      const brand = await confirmBrand(payload)
      navigate('/research', { state: { brandId: brand.id } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell current={3}>
      <div className="brand-shell">
        <div className="brand-card">
          <p className="eyebrow">Étape 3 — Qui sont vos concurrents ?</p>
          <h1>Dernière étape avant l’assistant</h1>
          <p className="brand-sub">
            Voici les marques que notre assistant a repérées. Ajoutez, retirez ou
            corrigez, puis lancez votre assistant.
          </p>

          <form onSubmit={handleConfirm}>
            <ul className="competitor-list">
              {competitors.map((c, i) => (
                <li key={i}>
                  <input
                    type="text"
                    value={c}
                    placeholder="Nom d’un concurrent"
                    onChange={(e) => updateCompetitor(i, e.target.value)}
                  />
                  <button
                    type="button"
                    className="competitor-remove"
                    onClick={() => removeCompetitor(i)}
                    aria-label="Retirer"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            <button type="button" className="btn btn-ghost brand-add" onClick={addCompetitor}>
              + Ajouter un concurrent
            </button>

            {error && <p className="form-error">{error}</p>}

            <div className="brand-actions">
              <Link className="btn btn-ghost" to="/brand/review" state={state}>
                Retour
              </Link>
              <button className="btn btn-primary brand-submit" type="submit" disabled={loading}>
                {loading ? 'Sauvegarde…' : 'Lancer mon assistant'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  )
}

function deriveName(description) {
  const words = (description || '').trim().split(/\s+/).slice(0, 3).join(' ')
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : 'Mon projet'
}
