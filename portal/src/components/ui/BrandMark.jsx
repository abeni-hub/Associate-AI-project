export default function BrandMark({ size = 42, className = 'brand-mark' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 42 42" className={className} width={size} height={size}>
      <rect width="42" height="42" rx="13" fill="#00485a" />
      <path d="M12 29V16.5L21 11l9 5.5V29M17 29v-7h8v7M9.5 29h23" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="21" cy="16.5" r="1.5" fill="#ddaf5d" />
    </svg>
  )
}
