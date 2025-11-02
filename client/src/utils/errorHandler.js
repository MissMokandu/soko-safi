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
    
    
    // Store in localStorage for debugging (with error handling)
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]')
      errors.push(errorInfo)
      localStorage.setItem('app_errors', JSON.stringify(errors.slice(-50)))
    } catch (storageError) {
    }
  } catch (loggingError) {
  }
}

export const clearToken = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const handleAuthError = (error, context = '') => {
  try {
    logError(error, `AUTH_ERROR: ${context}`)
    if (error?.status === 401 || error?.message?.includes('token') || error?.message?.includes('auth')) {
      clearToken()
      // Don't redirect here - let the component handle it
      console.warn('Authentication error detected:', error.message)
    }
  } catch (handlingError) {
    console.warn('Error handling auth error:', handlingError)
  }
}