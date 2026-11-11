import { Navigate } from 'react-router-dom';

import { type Area, landingPath } from '../areas';
import { useAuthStore } from '../authStore';
import { type Permission, can } from '../permissions';

interface Props {
  children: React.ReactNode;
  /** Open only to users who have this area (see `areas` from the backend) */
  area?: Area;
  /** Open only with this permission, e.g. a section of the admin area */
  permission?: Permission;
}

const ProtectedRoute = ({ children, area, permission }: Props) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // A signed-in user without this area or permission goes to their own start page.
  if ((area && !user.areas.includes(area)) || (permission && !can(user, permission))) {
    return <Navigate to={landingPath(user)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
