function XPBar({ value = 0 }) {
  return (
    <div className="xp-bar" aria-label={`XP: ${value}%`}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

export default XPBar
