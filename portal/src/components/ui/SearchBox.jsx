import Icon from './Icon.jsx'

function SearchBox({ value, onChange, placeholder = 'Search' }) {
  return <label className="search-box"><Icon name="search" size={17} /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />{value && <button type="button" onClick={() => onChange('')} aria-label="Clear search"><Icon name="close" size={14} /></button>}</label>
}

export default SearchBox
