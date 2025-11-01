// Global authentication utility
export const redirectToLogin = () => {
  window.location.href = '/login'
}

export const checkAuthAndRedirect = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    redirectToLogin()
    return false
  }
  return true
}