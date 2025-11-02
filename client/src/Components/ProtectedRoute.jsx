import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('[PROTECTED_ROUTE] Checking protection for:', location.pathname);
  console.log('[PROTECTED_ROUTE] Auth state:', { user: !!user, loading, userRole: user?.role, requiredRole });

  if (loading) {
    console.log('[PROTECTED_ROUTE] Still loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  if (!user) {
    console.log('[PROTECTED_ROUTE] No user found, redirecting to login from:', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    const redirectPath = user.role === 'artisan' ? '/artisan-dashboard' : '/buyer-dashboard';
    console.log('[PROTECTED_ROUTE] Role mismatch, redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  console.log('[PROTECTED_ROUTE] Access granted to:', location.pathname);
  return children;
};

export default ProtectedRoute;