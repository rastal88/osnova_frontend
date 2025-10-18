import { createBrowserRouter, Navigate } from 'react-router-dom';
// import { Card } from 'antd';
import LayoutComponent from '../components/LayoutComponent/LayoutComponent';
import AdminLayout from '../components/AdminLayout/AdminLayout';

import Dashboard from '../pages/Dashboard/Dashboard';
import Profile from '../pages/Profile/Profile';
import AdminDashboard from '../pages/Admin/Dashboard/Dashboard.tsx';

import Login from '../pages/Login/Login';
import ProtectedRoute from "../components/ProtectedRoute.tsx";
import Home from "../pages/Home/Home.tsx";
import Register from "../pages/Register/Register.tsx";

const routes = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },

  {
    path: '/',
    element: <LayoutComponent />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
    ],
  },

  {
    path: '/admin',
    element: (
      <ProtectedRoute roles={['ADMIN', 'MODERATOR']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute roles={['ADMIN', 'MODERATOR']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
    ],
  },

  {
    path: '*',
    element: <Navigate to="/" replace />
  },
]);

export default routes;
