import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { tokenManager } from '../utils/tokenManager';
import { secureStorage } from '../utils/secureStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('[AUTH_CONTEXT] Starting checkAuth');
    setError(null);
    
    // Check token validity
    const isExpired = tokenManager.isTokenExpired();
    console.log('[AUTH_CONTEXT] Token expired:', isExpired);
    
    if (isExpired) {
      console.log('[AUTH_CONTEXT] Token expired, removing and setting user to null');
      tokenManager.removeToken();
      setUser(null);
      setLoading(false);
      return;
    }
    
    const token = tokenManager.getToken();
    const storedUser = localStorage.getItem('user');
    
    console.log('[AUTH_CONTEXT] Token exists:', !!token);
    console.log('[AUTH_CONTEXT] Stored user exists:', !!storedUser);
    
    if (!token || !storedUser) {
      console.log('[AUTH_CONTEXT] No token or stored user, setting user to null');
      setUser(null);
      setLoading(false);
      return;
    }
    
    // Load user from storage
    try {
      const userData = JSON.parse(storedUser);
      console.log('[AUTH_CONTEXT] Loaded user from storage:', userData);
      setUser(userData);
      setLoading(false);
      
      // Background token refresh if stale
      const isStale = tokenManager.isTokenStale();
      console.log('[AUTH_CONTEXT] Token stale:', isStale);
      
      if (isStale) {
        console.log('[AUTH_CONTEXT] Refreshing stale token');
        api.auth.getSession().then(data => {
          console.log('[AUTH_CONTEXT] Session refresh result:', data);
          if (data?.authenticated && data?.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        }).catch(error => {
          console.error('[AUTH_CONTEXT] Session refresh failed:', error);
          if (error.status === 401) {
            logout();
          }
        });
      }
      
    } catch (e) {
      console.error('[AUTH_CONTEXT] Failed to parse stored user:', e);
      tokenManager.removeToken();
      setUser(null);
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('[AUTH_CONTEXT] Starting login');
      setError(null);
      setLoading(true);
      const data = await api.auth.login(credentials);
      
      console.log('[AUTH_CONTEXT] Login response:', data);
      
      // Store token and user data
      if (data.token) {
        console.log('[AUTH_CONTEXT] Storing token');
        secureStorage.setToken(data.token);
        tokenManager.setToken(data.token);
      } else {
        console.warn('[AUTH_CONTEXT] No token in login response');
      }
      
      if (data.user) {
        console.log('[AUTH_CONTEXT] Setting user:', data.user);
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        console.warn('[AUTH_CONTEXT] No user in login response');
      }
      
      return data;
    } catch (error) {
      console.error('[AUTH_CONTEXT] Login error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const data = await api.auth.register(userData);
      
      // Store token and user data
      if (data.token) {
        tokenManager.setToken(data.token);
      }
      
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('[AUTH_CONTEXT] Starting logout');
      setError(null);
      await api.auth.logout();
    } catch (error) {
      console.error('[AUTH_CONTEXT] Logout API error:', error);
    } finally {
      console.log('[AUTH_CONTEXT] Clearing user and tokens');
      setUser(null);
      secureStorage.clear();
      tokenManager.removeToken();
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const data = await api.auth.updateProfile(profileData);
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    checkAuth,
    clearError,
    isAuthenticated: !!user,
    isArtisan: user?.role?.toLowerCase() === 'artisan',
    isBuyer: user?.role?.toLowerCase() === 'buyer',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = (Component, requiredRole = null) => {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();
    
    if (loading) {
      // Show component with loading state instead of full-screen spinner
      return <Component {...props} authLoading={true} />;
    }
    
    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access this page.</p>
            <a href="/login" className="btn-primary">Go to Login</a>
          </div>
        </div>
      );
    }
    
    if (requiredRole && user.role !== requiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
            <a href="/" className="btn-primary">Go Home</a>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};
