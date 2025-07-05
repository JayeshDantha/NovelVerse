import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// This component will wrap any page we want to protect
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // If there is no user, redirect them to the /login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If there is a user, render the children components (the actual page)
  return children;
};

export default ProtectedRoute;