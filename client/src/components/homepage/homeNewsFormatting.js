export function formatDate(dateString, language) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getMonthShort(dateString, language) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'OCT'
  return date.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', { month: 'short' }).toUpperCase()
}

export function getDayNum(dateString) {
  if (!dateString) return '01'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '01'
  return String(date.getDate()).padStart(2, '0')
}
