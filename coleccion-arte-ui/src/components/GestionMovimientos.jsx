import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Paper, Button, TextField, List, ListItem, ListItemText, IconButton, Collapse, Alert } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../apiConfig';

function GestionMovimientos({ obraId }) {
  const [movimientos, setMovimientos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ fecha_desde: '', fecha_hasta: '', descripcion: '' });
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        const response = await fetch(`${API_URL}/api/obras/${obraId}/movimientos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setMovimientos(data);
      } catch (error) {
        console.error("Error al obtener movimientos:", error);
      }
    };
    fetchMovimientos();
  }, [obraId, token]);

  const handleSave = async () => {
    const url = editId ? `${API_URL}/api/movimientos/${editId}` : `${API_URL}/api/obras/${obraId}/movimientos`;
    const method = editId ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      // Refresh list
      const response = await fetch(`${API_URL}/api/obras/${obraId}/movimientos`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setMovimientos(data);
      setShowForm(false);
      setEditId(null);
    } catch (error) {
      console.error("Error al guardar movimiento:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/api/movimientos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      setMovimientos(movimientos.filter(m => m.id !== id));
    } catch (error) {
      console.error("Error al eliminar movimiento:", error);
    }
  };

  const handleEdit = (movimiento) => {
    setEditId(movimiento.id);
    setFormData({
      fecha_desde: movimiento.fecha_desde ? new Date(movimiento.fecha_desde).toISOString().split('T')[0] : '',
      fecha_hasta: movimiento.fecha_hasta ? new Date(movimiento.fecha_hasta).toISOString().split('T')[0] : '',
      descripcion: movimiento.descripcion
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditId(null);
    setFormData({ fecha_desde: '', fecha_hasta: '', descripcion: '' });
    setShowForm(true);
  };

  if (user.rol === 'lector') return null;

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>Historial de Movimientos</Typography>
      <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddNew} sx={{ mb: 2 }}>
        Añadir Movimiento
      </Button>
      <Collapse in={showForm}>
        <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
          <TextField label="Fecha Desde" type="date" name="fecha_desde" value={formData.fecha_desde} onChange={e => setFormData({ ...formData, fecha_desde: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth margin="normal" />
          <TextField label="Fecha Hasta" type="date" name="fecha_hasta" value={formData.fecha_hasta} onChange={e => setFormData({ ...formData, fecha_hasta: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth margin="normal" />
          <TextField label="Descripción" name="descripcion" value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} fullWidth margin="normal" />
          <Button onClick={handleSave} variant="contained">{editId ? 'Actualizar' : 'Guardar'}</Button>
          <Button onClick={() => setShowForm(false)} sx={{ ml: 1 }}>Cancelar</Button>
        </Box>
      </Collapse>
      <List>
        {movimientos.map(mov => (
          <ListItem key={mov.id} secondaryAction={
            <>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(mov)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(mov.id)}>
                <DeleteIcon />
              </IconButton>
            </>
          }>
            <ListItemText 
              primary={mov.descripcion}
              secondary={`Desde: ${new Date(mov.fecha_desde).toLocaleDateString()} - Hasta: ${mov.fecha_hasta ? new Date(mov.fecha_hasta).toLocaleDateString() : 'Presente'}`}
            />
          </ListItem>
        ))}
      </List>
      {movimientos.length === 0 && <Alert severity="info">No hay movimientos registrados para esta obra.</Alert>}
    </Paper>
  );
}

export default GestionMovimientos;