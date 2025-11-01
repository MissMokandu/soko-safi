// Authentication-aware navigation utility
export const getProductLink = (productId) => {
  const isAuthenticated = !!localStorage.getItem('token')
  return isAuthenticated 
    ? `/buyer-dashboard?tab=product&id=${productId}`
    : `/product/${productId}`
}

export const getExploreLink = () => {
  const isAuthenticated = !!localStorage.getItem('token')
  return isAuthenticated 
    ? `/buyer-dashboard?tab=explore`
    : `/explore`
}

export const isUserAuthenticated = () => {
  return !!localStorage.getItem('token')
}