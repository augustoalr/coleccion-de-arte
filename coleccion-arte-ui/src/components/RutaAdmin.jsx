import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Layout from './Layout';

function RutaAdmin({ children }) {
  const { user } = useContext(AuthContext);

  // Si el usuario no está logueado o no es admin, redirigir a la página principal
  if (!user || user.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Si es admin, mostrar el componente solicitado dentro del Layout
  return <Layout>{children}</Layout>;
}

export default RutaAdmin;