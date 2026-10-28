import Icon from './Icon.jsx'

function PageHeading({ eyebrow, title, subtitle, action, onAction, secondary, onSecondary }) {
  return <div className="page-heading"><div><span className="eyebrow page-eyebrow"><span className="eyebrow-line" />{eyebrow}</span><h1>{title}<span>.</span></h1><p>{subtitle}</p></div><div className="heading-actions">{secondary && <button className="button secondary" onClick={onSecondary}><Icon name="download" size={16} />{secondary}</button>}{action && <button className="button primary" onClick={onAction}><Icon name="plus" size={16} />{action}</button>}</div></div>
}

export default PageHeading
