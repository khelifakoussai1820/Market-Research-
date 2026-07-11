import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import './Brand.css'

const FIELDS = [
  { key: 'industry', label: 'Secteur d’activité', placeholder: 'Ex : Alimentation saine' },
  { key: 'target_audience', label: 'Qui est visé ?', placeholder: 'Ex : Étudiants 18-25 ans' },
  { key: 'brand_tone', label: 'Personnalité de la marque', placeholder: 'Ex : Rassurant, énergique' },
  { key: 'mission', label: 'Mission de la marque', placeholder: 'Ex : rendre le sain accessible', textarea: true },
]

export default function BrandReview() {
  const location = useLocation()
  const navigate = useNavigate()
  const suggestions = location.state?.suggestions
  const description = location.state?.description ?? ''

  const [name, setName] = useState('')
  const [fields, setFields] = useState({
    industry: suggestions?.industry ?? '',
    target_audience: suggestions?.target_audience ?? '',
    brand_tone: suggestions?.brand_tone ?? '',
    mission: suggestions?.mission ?? '',
  })

  if (!suggestions) {
    return (
      <AppShell current={2}>
        <div className="brand-shell">
          <div className="brand-card">
            <p className="form-error">Aucune suggestion trouvée. Revenez à l’étape précédente.</p>
            <Link className="btn btn-primary" to="/idea">Décrire mon idée</Link>
          </div>
        </div>
      </AppShell>
    )
  }

  function update(key, value) {
    setFields((f) => ({ ...f, [key]: value }))
  }

  function handleNext(e) {
    e.preventDefault()
    navigate('/brand/competitors', {
      state: { description, name, fields, competitors: suggestions.suggested_competitors ?? [] },
    })
  }

  return (
    <AppShell current={2}>
      <div className="brand-shell">
        <div className="brand-card">
          <p className="eyebrow">Étape 2 — Vérifions ensemble</p>
          <h1>On a préparé une première version pour vous</h1>
          <p className="brand-sub">
            Notre assistant a lu votre idée et proposé les éléments ci-dessous.
            Corrigez ce qui ne vous semble pas juste, puis continuez.
          </p>

          <form onSubmit={handleNext}>
            <label className="field">
              <span>Nom de la marque</span>
              <input
                type="text"
                placeholder="Laissez vide et on en proposera un"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            {FIELDS.map((f) => (
              <label className="field" key={f.key}>
                <span>{f.label}</span>
                {f.textarea ? (
                  <textarea
                    rows={3}
                    placeholder={f.placeholder}
                    value={fields[f.key]}
                    onChange={(e) => update(f.key, e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={fields[f.key]}
                    onChange={(e) => update(f.key, e.target.value)}
                  />
                )}
              </label>
            ))}

            <button className="btn btn-primary brand-submit" type="submit">
              Continuer
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  )
}
