// Global error handler and logger
export const logError = (error, context = '') => {
  try {
    const timestamp = new Date().toISOString()
    const errorInfo = {
      timestamp,
      context: String(context).slice(0, 100), // Limit context length
      message: error?.message ? String(error.message).slice(0, 500) : 'Unknown error',
      stack: error?.stack ? String(error.stack).slice(0, 1000) : undefined,
      url: window.location.href,
      userAgent: navigator.userAgent.slice(0, 200),
      token: !!localStorage.getItem('token')
    }
    
    console.error(`[ERROR ${timestamp}] ${context}:`, errorInfo)
    
    // Store in localStorage for debugging (with error handling)
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]')
      errors.push(errorInfo)
      localStorage.setItem('app_errors', JSON.stringify(errors.slice(-50)))
    } catch (storageError) {
      console.warn('Failed to store error in localStorage:', storageError)
    }
  } catch (loggingError) {
    console.error('Error in logError function:', loggingError)
  }
}

export const clearToken = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  console.log('[AUTH] Token cleared due to error')
}

export const handleAuthError = (error, context = '') => {
  try {
    logError(error, `AUTH_ERROR: ${context}`)
    if (error?.status === 401 || error?.message?.includes('token') || error?.message?.includes('auth')) {
      clearToken()
      // Use replace to prevent back button issues
      window.location.replace('/login')
    }
  } catch (handlingError) {
    console.error('Error in handleAuthError:', handlingError)
    // Fallback: still try to redirect
    window.location.replace('/login')
  }
}