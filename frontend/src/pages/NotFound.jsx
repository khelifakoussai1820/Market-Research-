import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="nf-shell">
      <p className="eyebrow">Erreur 404</p>
      <h1>Cette page a pris le large.</h1>
      <p className="nf-sub">
        La ressource demandée est introuvable. Revenez au studio pour
        continuer.
      </p>
      <Link className="btn btn-primary" to="/">
        Retour à l’accueil
      </Link>
    </div>
  )
}
