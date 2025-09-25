import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Typography, TextField, Button, Paper, Divider, Accordion, AccordionSummary, AccordionDetails, IconButton, Autocomplete } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useCatalogos } from '../hooks/useCatalogos';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../apiConfig';

function GestionMovimientos({ obraId }) {
  const [movimientos, setMovimientos] = useState([]);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [editData, setEditData] = useState({});
  const { token, user } = useContext(AuthContext);
  const { ubicaciones } = useCatalogos();

  const fetchMovimientos = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/obras/${obraId}/movimientos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMovimientos(data);
    } catch (error) {
      console.error("Error al obtener movimientos:", error);
    }
  }, [obraId, token]);

  useEffect(() => {
    fetchMovimientos();
  }, [fetchMovimientos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevoMovimiento = {
      ubicacion_id: ubicacionSeleccionada ? ubicacionSeleccionada.id : null,
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta || null,
      registrado_por: user?.email,
    };

    await fetch(`${API_URL}/api/obras/${obraId}/movimientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(nuevoMovimiento)
    });

    setUbicacionSeleccionada(null);
    setFechaDesde('');
    setFechaHasta('');
    fetchMovimientos();
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Seguro que quieres eliminar este registro?')) {
      await fetch(`${API_URL}/api/movimientos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      fetchMovimientos();
    }
  };

  const handleActivarEdicion = (movimiento) => {
    setEditandoId(movimiento.id);
    setEditData({
      descripcion: movimiento.descripcion,
      fecha_desde: movimiento.fecha_desde ? new Date(movimiento.fecha_desde).toISOString().split('T')[0] : '',
      fecha_hasta: movimiento.fecha_hasta ? new Date(movimiento.fecha_hasta).toISOString().split('T')[0] : '',
    });
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setEditData({});
  };

  const handleGuardarEdicion = async (id) => {
    const dataToSend = { ...editData, fecha_hasta: editData.fecha_hasta || null };
    await fetch(`${API_URL}/api/movimientos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(dataToSend)
    });
    setEditandoId(null);
    fetchMovimientos();
  };

  if (user.rol === 'lector') return null;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom>Historial de Movimientos</Typography>

      {user && (user.rol === 'admin' || user.rol === 'editor' || user.rol === 'conservador') && (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
          <Autocomplete
              options={ubicaciones}
              getOptionLabel={(option) => option.nombre}
              value={ubicacionSeleccionada}
              onChange={(event, newValue) => { setUbicacionSeleccionada(newValue); }}
              renderInput={(params) => <TextField {...params} label="Nueva Ubicación" required />}
              sx={{ flex: '1 1 250px' }}
          />
          <TextField label="Fecha Desde" type="date" variant="outlined" size="small" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} InputLabelProps={{ shrink: true }} required />
          <TextField label="Fecha Hasta" type="date" variant="outlined" size="small" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} InputLabelProps={{ shrink: true }} />
          <Button type="submit" variant="contained">Añadir</Button>
        </Box>
      )}

      <Divider />

      <Box sx={{ mt: 2 }}>
        {movimientos.length > 0 ? (
          movimientos.map(mov => (
            <Accordion key={mov.id} TransitionProps={{ unmountOnExit: true }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ flexGrow: 1, fontWeight: 'bold' }}>{mov.descripcion}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  {new Date(mov.fecha_desde).toLocaleDateString()}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {editandoId === mov.id ? (
                  <Box component="form" onSubmit={(e) => { e.preventDefault(); handleGuardarEdicion(mov.id); }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Descripción" size="small" value={editData.descripcion} onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })} required />
                    <TextField label="Fecha Desde" type="date" size="small" value={editData.fecha_desde} onChange={(e) => setEditData({ ...editData, fecha_desde: e.target.value })} InputLabelProps={{ shrink: true }} required />
                    <TextField label="Fecha Hasta" type="date" size="small" value={editData.fecha_hasta} onChange={(e) => setEditData({ ...editData, fecha_hasta: e.target.value })} InputLabelProps={{ shrink: true }} />
                    <Box>
                      <IconButton title="Guardar" color="primary" type="submit"><SaveIcon /></IconButton>
                      <IconButton title="Cancelar" onClick={handleCancelarEdicion}><CancelIcon /></IconButton>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2"><strong>Desde:</strong> {new Date(mov.fecha_desde).toLocaleDateString()}</Typography>
                    <Typography variant="body2"><strong>Hasta:</strong> {mov.fecha_hasta ? new Date(mov.fecha_hasta).toLocaleDateString() : 'Presente'}</Typography>
                    <Typography variant="body2"><strong>Registrado por:</strong> {mov.registrado_por || 'N/A'}</Typography>
                    {user && (user.rol === 'admin' || user.rol === 'editor' || user.rol === 'conservador') && (
                      <Box sx={{ mt: 1 }}>
                        <IconButton title="Editar" color="primary" onClick={() => handleActivarEdicion(mov)}><EditIcon /></IconButton>
                        <IconButton title="Eliminar" color="error" onClick={() => handleEliminar(mov.id)}><DeleteIcon /></IconButton>
                      </Box>
                    )}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No hay movimientos registrados.</Typography>
        )}
      </Box>
    </Paper>
  );
}

export default GestionMovimientos;