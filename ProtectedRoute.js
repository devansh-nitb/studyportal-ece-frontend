// frontend/src/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

/**
 * A component to protect routes based on authentication status and user role.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render if authorized.
 * @param {boolean} [props.adminOnly=false] - If true, only allows access to full admin users.
 * @param {boolean} [props.staffOnly=false] - If true, allows access to admins AND moderators.
 */
const ProtectedRoute = ({ children, adminOnly = false, staffOnly = false }) => {
  const { user, loading } = useContext(AuthContext);

  // Show a loading state while authentication status is being determined
  if (loading) {
    return <div>Loading authentication...</div>; // Or a more sophisticated spinner
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If route is adminOnly and the user is not a full admin, redirect
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />; // Or to a 403 Forbidden page
  }

  // If route is staffOnly, allow admins OR moderators; block everyone else
  if (staffOnly && !user.isAdmin && !user.isModerator) {
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and authorized, render the children
  return children;
};

export default ProtectedRoute;
