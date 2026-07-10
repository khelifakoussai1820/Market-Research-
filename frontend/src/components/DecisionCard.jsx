function DecisionCard({ title = 'Décision', status = 'En attente', children }) {
  return (
    <article className="decision-card">
      <h3>{title}</h3>
      <strong>{status}</strong>
      <p>{children}</p>
    </article>
  )
}

export default DecisionCard
