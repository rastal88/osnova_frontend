import { createBrowserRouter, Navigate } from 'react-router-dom';
// import { Card } from 'antd';
import LayoutComponent from '../components/LayoutComponent/LayoutComponent';
import AdminLayout from '../components/AdminLayout/AdminLayout';

import Dashboard from '../pages/Dashboard/Dashboard';
import Profile from '../pages/Profile/Profile';
import AdminDashboard from '../pages/Admin/Dashboard/Dashboard.tsx';
import Login from '../pages/Login/Login';
import HomePage from '../pages/Home/Home';
import { checkAuth, checkAdmin } from '../utils/auth.ts';

const routes = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  // Главный маршрут (клиентская часть)
  {
    path: '/',
    element: <LayoutComponent />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'profile',
        element: <Profile />,
        loader: async () => {
          // Проверяем авторизацию
          const isAuthenticated = await checkAuth();
          if (!isAuthenticated) {
            return <Navigate to="/login" replace />;
          }
          return null;
        }
      },
    ],
  },
  // Админка
  {
    path: '/admin',
    element: <AdminLayout />,
    loader: async () => {
      // Проверяем права администратора
      const isAdmin = await checkAdmin();
      if (!isAdmin) {
        return <Navigate to="/" replace />;
      }
      return null;
    },
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      // Общий для админки и клиентской части профиль
      {
        path: 'profile',
        element: <Profile />,
      },
    ],
  },
]);

export default routes;