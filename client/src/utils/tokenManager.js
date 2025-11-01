// Production-level token management
export const tokenManager = {
  getToken: () => localStorage.getItem('token'),
  
  setToken: (token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('tokenTimestamp', Date.now().toString());
  },
  
  removeToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenTimestamp');
  },
  
  isTokenExpired: () => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },
  
  isTokenStale: () => {
    const timestamp = localStorage.getItem('tokenTimestamp');
    if (!timestamp) return true;
    
    const age = Date.now() - parseInt(timestamp);
    return age > 24 * 60 * 60 * 1000; // 24 hours
  }
};