export function formatDate(dateStr, language) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getMonthShort(dateStr, language) {
  if (!dateStr) return 'OCT'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'OCT'
  return date.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', { month: 'short' }).toUpperCase()
}

export function getDayNum(dateStr) {
  if (!dateStr) return '01'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '01'
  return String(date.getDate()).padStart(2, '0')
}
