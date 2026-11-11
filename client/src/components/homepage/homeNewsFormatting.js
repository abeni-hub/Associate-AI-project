export function formatDate(dateString, language) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  const locale = language === 'am' ? 'am-ET' : language === 'om' ? 'om-ET' : 'en-US'
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getMonthShort(dateString, language) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'OCT'
  const locale = language === 'am' ? 'am-ET' : language === 'om' ? 'om-ET' : 'en-US'
  return date.toLocaleDateString(locale, { month: 'short' }).toUpperCase()
}

export function getDayNum(dateString) {
  if (!dateString) return '01'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '01'
  return String(date.getDate()).padStart(2, '0')
}
