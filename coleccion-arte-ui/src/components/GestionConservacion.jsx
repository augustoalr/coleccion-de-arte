import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Paper, Button, TextField, List, ListItem, ListItemText, IconButton, Collapse, Alert } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AuthContext from '../context/AuthContext';
import API_URL from '../apiConfig';

function GestionConservacion({ obraId }) {
  const [informes, setInformes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ diagnostico: '', recomendaciones: '' });
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchInformes = async () => {
      try {
        const response = await fetch(`${API_URL}/api/obras/${obraId}/conservacion`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setInformes(data);
      } catch (error) {
        console.error("Error al obtener informes de conservación:", error);
      }
    };
    fetchInformes();
  }, [obraId, token]);

  const handleSave = async () => {
    const url = editId ? `${API_URL}/api/conservacion/${editId}` : `${API_URL}/api/obras/${obraId}/conservacion`;
    const method = editId ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      // Refresh list
      const response = await fetch(`${API_URL}/api/obras/${obraId}/conservacion`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      setInformes(data);
      setShowForm(false);
      setEditId(null);
    } catch (error) {
      console.error("Error al guardar informe:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/api/conservacion/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      setInformes(informes.filter(i => i.id !== id));
    } catch (error) {
      console.error("Error al eliminar informe:", error);
    }
  };

  const handleEdit = (informe) => {
    setEditId(informe.id);
    setFormData({ diagnostico: informe.diagnostico, recomendaciones: informe.recomendaciones });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditId(null);
    setFormData({ diagnostico: '', recomendaciones: '' });
    setShowForm(true);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>Informes de Conservación</Typography>
      <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddNew} sx={{ mb: 2 }}>
        Añadir Informe
      </Button>
      <Collapse in={showForm}>
        <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
          <TextField label="Diagnóstico" name="diagnostico" value={formData.diagnostico} onChange={e => setFormData({ ...formData, diagnostico: e.target.value })} fullWidth margin="normal" multiline rows={4} />
          <TextField label="Recomendaciones" name="recomendaciones" value={formData.recomendaciones} onChange={e => setFormData({ ...formData, recomendaciones: e.target.value })} fullWidth margin="normal" multiline rows={4} />
          <Button onClick={handleSave} variant="contained">{editId ? 'Actualizar' : 'Guardar'}</Button>
          <Button onClick={() => setShowForm(false)} sx={{ ml: 1 }}>Cancelar</Button>
        </Box>
      </Collapse>
      <List>
        {informes.map(inf => (
          <ListItem key={inf.id} secondaryAction={
            <>
              <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(inf)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(inf.id)}>
                <DeleteIcon />
              </IconButton>
            </>
          }>
            <ListItemText 
              primary={inf.diagnostico}
              secondary={`Recomendaciones: ${inf.recomendaciones} - ${new Date(inf.fecha_informe).toLocaleDateString()}`}
            />
          </ListItem>
        ))}
      </List>
      {informes.length === 0 && <Alert severity="info">No hay informes de conservación para esta obra.</Alert>}
    </Paper>
  );
}

export default GestionConservacion;