import React from 'react';

import { Routes, Route } from 'react-router-dom';
import Catalogo from './components/Catalogo';
import ObraDetalle from './components/ObraDetalle';
import Login from './components/Login';
import RutaProtegida from './components/RutaProtegida';
import RutaAdmin from './components/RutaAdmin'; // Importar
import AdminUsuarios from './components/AdminUsuarios'; // Importar

import AdminBackups from './components/AdminBackups';
import AdminCrearUsuario from './components/AdminCrearUsuario'; // Importar

import Dashboard from './components/Dashboard';
import Historial from './components/Historial'; // Importar Historial
import AdminUbicaciones from './components/AdminUbicaciones'; // Importar nuevo componente
import FormularioObra from './components/FormularioObra';


function App() {
  return (
    <>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RutaProtegida><Catalogo /></RutaProtegida>} />
          <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
          <Route path="/formulario" element={<RutaProtegida><FormularioObra /></RutaProtegida>} />
          <Route path="/obras/:id" element={<RutaProtegida><ObraDetalle /></RutaProtegida>} />

          <Route path="/admin/ubicaciones" element={<RutaAdmin><AdminUbicaciones /></RutaAdmin>} /> 

          {/* Rutas de Administración */}
          <Route path="/admin/usuarios" element={<RutaAdmin><AdminUsuarios /></RutaAdmin>} />
          <Route path="/admin/usuarios/crear" element={<RutaAdmin><AdminCrearUsuario /></RutaAdmin>} /> 

          <Route path="/admin/backups" element={<RutaAdmin><AdminBackups /></RutaAdmin>} />
          <Route path="/historial" element={<RutaAdmin><Historial /></RutaAdmin>} />
        </Routes>
    </>
  );
}
export default App;