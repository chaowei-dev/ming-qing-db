import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { checkRoleIsAllowed, isTokenExpired } from '../../services/authService';

interface PrivateRouteProps {
  allowedRoles: string[];
  children: ReactNode;
}
// Check user's role
// Check expiration time of the token
const PrivateRoute: React.FC<PrivateRouteProps> = ({
  allowedRoles,
  children,
}) => {
  // Check if the token has expired
  if (isTokenExpired()) {
    // If the token has expired, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // Check if the user's role is allowed to access this route
  if (!checkRoleIsAllowed(allowedRoles)) {
    // If the role is not allowed, redirect to login or unauthorized access page
    // Redirecting to login for simplicity, but consider a dedicated unauthorized page
    return <Navigate to="/login" replace />;
  }

  // If all checks pass, render the protected component
  return <>{children}</>;
};

export default PrivateRoute;
