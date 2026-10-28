function StatusPill({ children }) {
  const key = String(children).toLowerCase().replaceAll(' ', '-')
  return <span className={`status-pill status-${key}`}><i />{children}</span>
}

export default StatusPill
