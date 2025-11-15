import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, removeToken } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin
  if (!isAdmin()) {
    // Remove invalid credentials
    removeToken();
    return <Navigate to="/login?error=شما دسترسی به این بخش را ندارید. فقط مدیران می‌توانند وارد شوند." replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

