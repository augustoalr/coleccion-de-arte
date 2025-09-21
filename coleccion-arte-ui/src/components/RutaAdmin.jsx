import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function RutaAdmin({ children }) {
  const { user } = useContext(AuthContext);

  // Si el usuario no está logueado o no es admin, redirigir a la página principal
  if (!user || user.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Si es admin, mostrar el componente solicitado
  return children;
}

export default RutaAdmin;