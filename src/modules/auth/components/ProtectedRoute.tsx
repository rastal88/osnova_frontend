import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../authStore';

interface Props {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute = ({ children, roles }: Props) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && (!user || !roles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
