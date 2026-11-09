import { Navigate } from 'react-router-dom';

import { type Area, landingPath } from '../areas';
import { useAuthStore } from '../authStore';

interface Props {
  children: React.ReactNode;
  /** Open only to users who have this area (see `areas` from the backend) */
  area?: Area;
}

const ProtectedRoute = ({ children, area }: Props) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // A signed-in user without this area goes to their own start page.
  if (area && !user.areas.includes(area)) {
    return <Navigate to={landingPath(user)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
