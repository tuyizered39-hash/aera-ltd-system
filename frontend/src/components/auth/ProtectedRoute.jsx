import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useAuth();
  
  // ✅ NEW: Safety timeout to prevent infinite loading
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    // If loading takes longer than 4 seconds, force it to stop
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 4000);

    // If loading finishes naturally, cancel the timer
    if (!loading) {
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [loading]);

  // ✅ CHANGED: Only show spinner if loading AND the timeout hasn't hit yet
  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;