import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { analyzeBrand, getReport } from '../api/client.js'
import AppShell from '../components/AppShell.jsx'
import './Research.css'

export default function Research() {
  const location = useLocation()
  const navigate = useNavigate()
  const brandId = location.state?.brandId

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [report, setReport] = useState(null)

  useEffect(() => {
    if (!brandId) {
      setError('Aucun projet associé.')
      setLoading(false)
      return
    }
    async function run() {
      try {
        await analyzeBrand(brandId)
        const rep = await getReport(brandId)
        setReport(rep)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [brandId])

  if (loading) {
    return (
      <AppShell current={4}>
        <div className="research-shell">
          <div className="research-loading">
            <div className="spinner" aria-hidden="true" />
            <p className="eyebrow">Analyse en cours</p>
            <h1>On analyse votre marché</h1>
            <p className="research-sub">
              Notre assistant lance 5 recherches (concurrence, tendances, actualités,
              discussions clients, opportunités) puis rédige votre rapport.
            </p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell current={4}>
        <div className="research-shell">
          <div className="research-card">
            <p className="form-error">{error}</p>
            <Link className="btn btn-primary" to="/idea">Recommencer</Link>
          </div>
        </div>
      </AppShell>
    )
  }

  const score = report?.health_score
  const scoreClass = score >= 7 ? 'good' : score >= 4 ? 'mid' : 'low'

  return (
    <AppShell current={4}>
      <div className="research-shell">
        <div className="research-card">
          <p className="eyebrow">Résultat de l’analyse</p>
          <h1>Votre rapport de marché</h1>

        {/* Brand Health Score */}
        <section className="score-block">
          <div className={`score-ring ${scoreClass}`}>
            <span>{score != null ? score : '—'}</span>
            <small>/10</small>
          </div>
          <div>
            <h2>Brand Health Score</h2>
            <p className="research-sub">
              Indice de santé de votre marque, calculé à partir des recherches
              marché et de votre positionnement.
            </p>
          </div>
        </section>

        {/* Market Report */}
        <section className="report-section">
          <h2>Market Report</h2>

          <article className="report-item">
            <h3>Résumé exécutif</h3>
            <p>{report?.executive_summary}</p>
          </article>

          <article className="report-item">
            <h3>Tendances du marché</h3>
            <p>{report?.market_trends}</p>
          </article>

          <div className="report-grid">
            <article className="report-item">
              <h3>Opportunités</h3>
              <ul>
                {(report?.opportunities || []).map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </article>
            <article className="report-item">
              <h3>Menaces</h3>
              <ul>
                {(report?.threats || []).map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </article>
          </div>

          <article className="report-item">
            <h3>Recommandations</h3>
            <ul>
              {(report?.recommendations || []).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </article>
        </section>

        {/* Competitor Map */}
        <section className="report-section">
          <h2>Competitor Map</h2>
          <div className="competitor-map">
            {(report?.competitor_map || []).map((c, i) => (
              <article className="competitor-node" key={i}>
                <h3>{c.name}</h3>
                <p>{c.summary}</p>
                {c.url && (
                  <a className="link" href={c.url} target="_blank" rel="noreferrer">
                    Visiter le site →
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>

        <div className="research-actions">
          <Link className="btn btn-ghost" to="/idea">Nouveau projet</Link>
          <button className="btn btn-primary" onClick={() => navigate('/chat', { state: { brandId } })}>
            Poser des questions à l’assistant
          </button>
        </div>
      </div>
    </div>
    </AppShell>
  )
}
