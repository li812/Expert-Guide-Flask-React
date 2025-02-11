import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredType }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/check-session', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-Token': 'fetch'
          },
          mode: 'cors',
          cache: 'no-cache'
        });

        console.log("Session check response:", response);
        console.log("Response headers:", Object.fromEntries(response.headers));
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`Session check failed: ${response.status}`);
        }

        const data = await response.json();
        console.log("Session data:", data);
        
        setIsAuthorized(
          data.authenticated && 
          (!requiredType || data.type_id === requiredType)
        );
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requiredType]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;

