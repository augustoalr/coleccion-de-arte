import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Select, MenuItem, CircularProgress, Alert } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../apiConfig';

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsuarios = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/api/usuarios`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudo cargar la lista de usuarios.');
        const data = await response.json();
        setUsuarios(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, [token]);

  const handleRolChange = async (id, nuevoRol) => {
    try {
      await fetch(`${API_URL}/api/usuarios/${id}/rol`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ rol: nuevoRol })
      });
      setUsuarios(usuarios.map(u => u.id === id ? { ...u, rol: nuevoRol } : u));
    } catch (error) {
      console.error("Error al cambiar el rol:", error);
    }
  };

  const handleEliminarUsuario = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await fetch(`${API_URL}/api/usuarios/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUsuarios(usuarios.filter(u => u.id !== id));
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        alert('No se pudo eliminar el usuario.');
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Failed to edit, 0 occurrences found for old_string (import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Select, MenuItem } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchUsuarios = async () => {
            if (!token) return;
            const response = await fetch('http://localhost:4000/api/usuarios', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setUsuarios(data);
        };
        fetchUsuarios();
    }, [token]);

    const handleRolChange = async (id, nuevoRol) => {
        await fetch(`http://localhost:4000/api/usuarios/${id}/rol`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ rol: nuevoRol })
        });
        setUsuarios(usuarios.map(u => u.id === id ? { ...u, rol: nuevoRol } : u));
    };

    const handleEliminarUsuario = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            await fetch(`http://localhost:4000/api/usuarios/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsuarios(usuarios.filter(u => u.id !== id));
        }
    };

    return (
        <Paper sx={{ p: 2, mt: 4 }}>
            <Typography variant="h5" gutterBottom>Gestión de Usuarios</Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {usuarios.map((usuario) => (
                            <TableRow key={usuario.id}>
                                <TableCell>{usuario.id}</TableCell>
                                <TableCell>{usuario.email}</TableCell>
                                <TableCell>
                                    <Select value={usuario.rol} onChange={(e) => handleRolChange(usuario.id, e.target.value)} size="small">
                                        <MenuItem value="admin">Admin</MenuItem>
                                        <MenuItem value="editor">Editor</MenuItem>
                                        <MenuItem value="conservador">Conservador</MenuItem>
                                        <MenuItem value="lector">Lector</MenuItem>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Button color="error" onClick={() => handleEliminarUsuario(usuario.id)}>Eliminar</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

export default AdminUsuarios;). Original old_string was (import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Select, MenuItem } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchUsuarios = async () => {
            if (!token) return;
            const response = await fetch('http://localhost:4000/api/usuarios', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setUsuarios(data);
        };
        fetchUsuarios();
    }, [token]);

    const handleRolChange = async (id, nuevoRol) => {
        await fetch(`http://localhost:4000/api/usuarios/${id}/rol`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ rol: nuevoRol })
        });
        setUsuarios(usuarios.map(u => u.id === id ? { ...u, rol: nuevoRol } : u));
    };

    const handleEliminarUsuario = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            await fetch(`http://localhost:4000/api/usuarios/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsuarios(usuarios.filter(u => u.id !== id));
        }
    };

    return (
        <Paper sx={{ p: 2, mt: 4 }}>
            <Typography variant="h5" gutterBottom>Gestión de Usuarios</Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {usuarios.map((usuario) => (
                            <TableRow key={usuario.id}>
                                <TableCell>{usuario.id}</TableCell>
                                <TableCell>{usuario.email}</TableCell>
                                <TableCell>
                                    <Select value={usuario.rol} onChange={(e) => handleRolChange(usuario.id, e.target.value)} size="small">
                                        <MenuItem value="admin">Admin</MenuItem>
                                        <MenuItem value="editor">Editor</MenuItem>
                                        <MenuItem value="conservador">Conservador</MenuItem>
                                        <MenuItem value="lector">Lector</MenuItem>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Button color="error" onClick={() => handleEliminarUsuario(usuario.id)}>Eliminar</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

export default AdminUsuarios;) in D:\Proyectos\coleccion-arte-api - Copy\coleccion-arte-ui\src\components\AdminUsuarios.jsx. No edits made. The exact text in old_string was not found. Ensure you're not escaping content incorrectly and check whitespace, indentation, and context. Use read_file tool to verify.</Alert>;

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Gestión de Usuarios</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.id}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  <Select
                    value={usuario.rol}
                    onChange={(e) => handleRolChange(usuario.id, e.target.value)}
                    size="small"
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="editor">Editor</MenuItem>
                    <MenuItem value="conservador">Conservador</MenuItem>
                    <MenuItem value="lector">Lector</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button color="error" onClick={() => handleEliminarUsuario(usuario.id)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default AdminUsuarios;