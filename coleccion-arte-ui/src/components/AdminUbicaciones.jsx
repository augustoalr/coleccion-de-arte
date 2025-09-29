import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, TextField, Button,
  IconButton, Alert, Card, CardContent, Avatar, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AuthContext from '../context/AuthContext';
import API_URL from '../apiConfig';

function AdminUbicaciones() {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [currentUbicacion, setCurrentUbicacion] = useState({ id: null, nombre: '' });
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ubicacionToDelete, setUbicacionToDelete] = useState(null);
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

  const handleDelete = (ubicacion) => {
    setUbicacionToDelete(ubicacion);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUbicacion = async () => {
    if (!ubicacionToDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/ubicaciones/${ubicacionToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }

      setUbicaciones(ubicaciones.filter(u => u.id !== ubicacionToDelete.id));
      setDeleteDialogOpen(false);
      setUbicacionToDelete(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUbicacionToDelete(null);
  };

  const handleCancelEdit = () => {
    setCurrentUbicacion({ id: null, nombre: '' });
  };

  return (
    <Box sx={{ bgcolor: '#f5f9ff', minHeight: '100vh', p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, color: '#1976d2', fontWeight: 600 }}>
          Gestión de Ubicaciones
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Administra las ubicaciones donde se almacenan las obras de arte
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Formulario para añadir/editar ubicación */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
            {currentUbicacion.id ? 'Editar Ubicación' : 'Nueva Ubicación'}
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label={currentUbicacion.id ? 'Nombre de la ubicación' : 'Nueva ubicación'}
              value={currentUbicacion.nombre}
              onChange={(e) => setCurrentUbicacion({ ...currentUbicacion, nombre: e.target.value })}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={currentUbicacion.id ? <SaveIcon /> : <AddIcon />}
              sx={{
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' },
                borderRadius: 2,
                px: 3,
                py: 1.5
              }}
            >
              {currentUbicacion.id ? 'Actualizar' : 'Añadir'}
            </Button>
            {currentUbicacion.id && (
              <Button
                onClick={handleCancelEdit}
                startIcon={<CancelIcon />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5
                }}
              >
                Cancelar
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Lista de ubicaciones */}
      <Card sx={{
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
              Lista de Ubicaciones
            </Typography>
          </Box>

          <List sx={{ py: 0 }}>
            {ubicaciones.length > 0 ? ubicaciones.map((ubicacion, index) => (
              <ListItem
                key={ubicacion.id}
                sx={{
                  bgcolor: index % 2 === 0 ? '#f8f9fa' : 'white',
                  borderBottom: index < ubicaciones.length - 1 ? '1px solid #e0e0e0' : 'none',
                  '&:hover': {
                    bgcolor: index % 2 === 0 ? '#e9ecef' : '#f5f5f5',
                    transition: 'background-color 0.2s ease'
                  },
                  px: 3,
                  py: 2
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => handleEdit(ubicacion)}
                      sx={{
                        bgcolor: '#e3f2fd',
                        '&:hover': { bgcolor: '#bbdefb' },
                        borderRadius: 2,
                        width: 36,
                        height: 36
                      }}
                    >
                      <EditIcon sx={{ color: '#1976d2', fontSize: 18 }} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(ubicacion)}
                      sx={{
                        bgcolor: '#ffebee',
                        '&:hover': { bgcolor: '#ffcdd2' },
                        borderRadius: 2,
                        width: 36,
                        height: 36
                      }}
                    >
                      <DeleteIcon sx={{ color: '#d32f2f', fontSize: 18 }} />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{
                        bgcolor: index % 2 === 0 ? '#1976d2' : '#f57c00',
                        width: 32,
                        height: 32
                      }}>
                        <LocationOnIcon sx={{ color: 'white', fontSize: 16 }} />
                      </Avatar>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: index % 2 === 0 ? '#1976d2' : '#f57c00',
                          fontSize: '1.1rem'
                        }}
                      >
                        {ubicacion.nombre}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                      ID: {ubicacion.id}
                    </Typography>
                  }
                />
              </ListItem>
            )) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <LocationOnIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#666' }}>
                  No hay ubicaciones registradas
                </Typography>
              </Box>
            )}
          </List>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ color: '#d32f2f', fontWeight: 600 }}>
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar la ubicación "{ubicacionToDelete?.nombre}"?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDeleteUbicacion}
            color="error"
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminUbicaciones;
