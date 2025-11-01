export const formatMessageTime = (timestamp) => {
  console.log('[FORMAT_MESSAGE_TIME] Input timestamp:', timestamp, typeof timestamp)
  
  if (!timestamp) {
    console.log('[FORMAT_MESSAGE_TIME] No timestamp provided')
    return ''
  }
  
  const date = new Date(timestamp)
  console.log('[FORMAT_MESSAGE_TIME] Parsed date:', date, 'isValid:', !isNaN(date.getTime()))
  
  if (isNaN(date.getTime())) {
    console.log('[FORMAT_MESSAGE_TIME] Invalid date')
    return 'Invalid date'
  }
  
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  console.log('[FORMAT_MESSAGE_TIME] Time diff:', { diffMs, diffMins, diffHours, diffDays })
  
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}