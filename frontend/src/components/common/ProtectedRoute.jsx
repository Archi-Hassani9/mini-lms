import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from './Spinner';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { isAuthenticated, loading, isAdmin, isStudent } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roleRequired === 'admin' && !isAdmin) {
    return <Navigate to="/student/dashboard" />;
  }

  if (roleRequired === 'student' && !isStudent) {
    return <Navigate to="/admin/dashboard" />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
