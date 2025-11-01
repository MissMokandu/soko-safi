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
    console.log('[AuthContext] Starting auth check...');
    setError(null);
    
    // Check token validity
    if (tokenManager.isTokenExpired()) {
      console.log('[AuthContext] Token expired');
      tokenManager.removeToken();
      setUser(null);
      setLoading(false);
      return;
    }
    
    const token = tokenManager.getToken();
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      console.log('[AuthContext] No valid token or user found');
      setUser(null);
      setLoading(false);
      return;
    }
    
    // Load user from storage
    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setLoading(false);
      console.log('[AuthContext] User authenticated from storage');
      
      // Background token refresh if stale
      if (tokenManager.isTokenStale()) {
        api.auth.getSession().then(data => {
          if (data?.authenticated && data?.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        }).catch(error => {
          if (error.status === 401) {
            logout();
          }
        });
      }
      
    } catch (e) {
      console.warn('[AuthContext] Invalid user data');
      tokenManager.removeToken();
      setUser(null);
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      const data = await api.auth.login(credentials);
      console.log('Login response:', data);
      
      // Store token and user data
      if (data.token) {
        secureStorage.setToken(data.token);
        tokenManager.setToken(data.token);
      }
      
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('User logged in and stored:', data.user);
      }
      
      return data;
    } catch (error) {
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
      console.log('Registration response:', data);
      
      // Store token and user data
      if (data.token) {
        tokenManager.setToken(data.token);
      }
      
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('User registered and stored:', data.user);
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
      setError(null);
      await api.auth.logout();
    } catch (error) {
      console.warn('Logout error:', error.message);
    } finally {
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
