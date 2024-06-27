import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
    children: JSX.Element;
    allowedRoles: string[];
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
    // Get the current location
    const location = useLocation();

    // Check if the user is logged in
    const token = localStorage.getItem('token');

    // Check if the user has the required role
    const userRole = localStorage.getItem('role');

    // Redirect to login if the user is not logged in or does not have the required role
    if (!token || !allowedRoles.includes(userRole!)) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default PrivateRoute;