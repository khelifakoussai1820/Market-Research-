import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Results.css'

const INITIAL = [
  {
    id: 'summary',
    tag: 'Synthèse',
    title: 'Résumé exécutif',
    ai: "Sur 312 répondants, 68 % perçoivent la marque comme premium mais manquent de clarté sur sa promesse. Le positionnement actuel crée de l'attrition sur la cible 25-34 ans.",
  },
  {
    id: 'segments',
    tag: 'Segments',
    title: 'Segments clés',
    ai: "Trois clusters émergent : 'Convaincus' (41 %), 'Hésitants prix' (33 %), 'Indifférents' (26 %). Le levier principal est la preuve sociale pour les hésitants.",
  },
  {
    id: 'reco',
    tag: 'Recommandation',
    title: 'Recommandation de décision',
    ai: "Recommandation : clarifier le message autour d'un bénéfice unique, et lancer une campagne de preuve sociale ciblée sur les 25-34 ans sur 6 semaines.",
  },
]

function mockRegenerate() {
  const variants = [
    'Mise à jour : la clarté de la promesse remonte à 74 % après la dernière vague de retours.',
    'Nouvelle analyse : le segment hésitant prix réagit mieux à un argument d’accessibilité qu’au premium.',
    'Ajustement : prioriser le retargeting sur les indifférents avant toute campagne broad.',
  ]
  return variants[Math.floor(Math.random() * variants.length)]
}

export default function Results() {
  const [sections, setSections] = useState(INITIAL)
  const [editing, setEditing] = useState({})
  const [saved, setSaved] = useState(false)

  function toggleEdit(id) {
    setSaved(false)
    setEditing((e) => ({ ...e, [id]: !e[id] }))
  }

  function update(id, value) {
    setSaved(false)
    setSections((s) => s.map((x) => (x.id === id ? { ...x, ai: value } : x)))
  }

  function regenerate(id) {
    setSaved(false)
    setSections((s) =>
      s.map((x) => (x.id === id ? { ...x, ai: mockRegenerate() } : x)),
    )
  }

  function save() {
    setEditing({})
    setSaved(true)
  }

  return (
    <div className="results-shell">
      <header className="results-head">
        <div>
          <Link to="/" className="results-back">
            ← Retour au studio
          </Link>
          <p className="eyebrow">Résultats IA</p>
          <h1>Analyse générée &amp; éditable</h1>
          <p className="results-sub">
            Le moteur a pré-rempli chaque section. Ajustez librement le contenu
            avant de valider.
          </p>
        </div>
        <div className="results-actions">
          <button className="btn btn-ghost" onClick={() => setSaved(false)}>
            Tout réinitialiser
          </button>
          <button className="btn btn-primary" onClick={save}>
            {saved ? 'Enregistré' : 'Enregistrer'}
          </button>
        </div>
      </header>

      {saved && (
        <p className="results-banner">Modifications enregistrées avec succès.</p>
      )}

      <div className="results-list">
        {sections.map((s) => {
          const isEditing = !!editing[s.id]
          return (
            <article className="result-card" key={s.id}>
              <div className="result-card-head">
                <span className="feature-tag">{s.tag}</span>
                <div className="result-card-tools">
                  <button
                    className="mini-btn"
                    onClick={() => regenerate(s.id)}
                    title="Régénérer par l'IA"
                  >
                    ⟳ IA
                  </button>
                  <button
                    className={`mini-btn ${isEditing ? 'active' : ''}`}
                    onClick={() => toggleEdit(s.id)}
                  >
                    {isEditing ? 'Terminer' : 'Éditer'}
                  </button>
                </div>
              </div>

              <h2>{s.title}</h2>

              {isEditing ? (
                <textarea
                  className="result-edit"
                  value={s.ai}
                  onChange={(e) => update(s.id, e.target.value)}
                  rows={4}
                />
              ) : (
                <p className="result-text">{s.ai}</p>
              )}

              <p className="result-meta">
                {isEditing ? 'Mode édition — vous modifiez ce champ.' : 'Pré-rempli par l’IA.'}
              </p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
