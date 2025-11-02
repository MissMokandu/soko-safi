import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

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
    
    try {
      const data = await api.auth.checkSession();
      console.log('[AUTH_CONTEXT] Session check result:', data);
      
      if (data?.authenticated && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('[AUTH_CONTEXT] Session check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('[AUTH_CONTEXT] Starting login process');
      setError(null);
      setLoading(true);
      
      const data = await api.auth.login(credentials);
      console.log('[AUTH_CONTEXT] Login response:', data);
      
      if (data.user) {
        setUser(data.user);
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
      
      if (data.user) {
        setUser(data.user);
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
      console.log('[AUTH_CONTEXT] Clearing user');
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const data = await api.auth.updateProfile(profileData);
      if (data.user) {
        setUser(data.user);
      }
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
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