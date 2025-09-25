import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Paper, List, ListItem, ListItemText, TextField, Button, IconButton, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AuthContext from '../context/AuthContext';
import API_URL from '../apiConfig';

function AdminUbicaciones() {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [currentUbicacion, setCurrentUbicacion] = useState({ id: null, nombre: '' });
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const response = await fetch(`${API_URL}/api/ubicaciones`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await response.json();
        setUbicaciones(data);
      } catch (error) {
        console.error("Error al cargar ubicaciones:", error);
      }
    };
    fetchUbicaciones();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUbicacion.nombre.trim()) return;

    const method = currentUbicacion.id ? 'PUT' : 'POST';
    const url = currentUbicacion.id ? `${API_URL}/api/ubicaciones/${currentUbicacion.id}` : `${API_URL}/api/ubicaciones`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nombre: currentUbicacion.nombre })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }

      const updatedUbicacion = await response.json();

      if (currentUbicacion.id) {
        setUbicaciones(ubicaciones.map(u => u.id === currentUbicacion.id ? updatedUbicacion : u));
      } else {
        setUbicaciones([...ubicaciones, updatedUbicacion]);
      }
      setCurrentUbicacion({ id: null, nombre: '' });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (ubicacion) => {
    setCurrentUbicacion(ubicacion);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que quieres eliminar esta ubicación?')) {
      try {
        const response = await fetch(`${API_URL}/api/ubicaciones/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData);
        }

        setUbicaciones(ubicaciones.filter(u => u.id !== id));
        setError('');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <Box>
      <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Volver al Catálogo
      </Button>
      <Paper sx={{ p: 2, backgroundColor: 'white' }}>
        <Typography variant="h5" gutterBottom>Gestión de Ubicaciones</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField 
            label={currentUbicacion.id ? 'Editar ubicación' : 'Nueva ubicación'} 
            value={currentUbicacion.nombre} 
            onChange={(e) => setCurrentUbicacion({ ...currentUbicacion, nombre: e.target.value })} 
            fullWidth 
          />
          <Button type="submit" variant="contained" startIcon={<AddIcon />}>
            {currentUbicacion.id ? 'Actualizar' : 'Añadir'}
          </Button>
        </Box>
        <List>
          {ubicaciones.map(u => (
            <ListItem key={u.id} secondaryAction={
              <>
                <IconButton edge="end" onClick={() => handleEdit(u)}><EditIcon /></IconButton>
                <IconButton edge="end" onClick={() => handleDelete(u.id)}><DeleteIcon /></IconButton>
              </>
            }>
              <ListItemText primary={u.nombre} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default AdminUbicaciones;
