import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function RutaProtegida({ children }) {
  const { token } = useContext(AuthContext);

  if (!token) {
    // Si no hay token, redirigir al usuario a la página de login
    return <Navigate to="/login" replace />;
  }

  // Si hay un token, mostrar el componente solicitado (la página)
  return children;
}

export default RutaProtegida;