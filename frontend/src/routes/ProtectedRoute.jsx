// frontend/src/routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, token, loading } = useAuth();

  // 1. Still loading → show spinner
  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  // 2. Not logged in → redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Logged in, but role not allowed → redirect to their own dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const roleRoutes = {
      MANUFACTURER: '/manufacturer',
      LAB: '/lab',
      REGULATOR: '/regulator',
      DISTRIBUTOR: '/distributor',
      PHARMACY: '/pharmacy',
    };
    const redirectPath = roleRoutes[user.role] || '/login';
    return <Navigate to={redirectPath} replace />;
  }

  // 4. Authorized → render the page
  return children;
};

export default ProtectedRoute;