function TypePill({ type }) {
  const key = type.toLowerCase()
  return <span className={`type-pill type-${key}`}>{type === 'Satisfaction' ? '★' : type === 'Complaint' ? '!' : '↗'} <span>{type}</span></span>
}

export default TypePill
