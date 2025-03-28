import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {JSX} from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;