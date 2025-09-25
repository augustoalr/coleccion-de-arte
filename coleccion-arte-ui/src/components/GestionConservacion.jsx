import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Box, Typography, TextField, Button, Paper, Divider, Accordion, AccordionSummary, AccordionDetails, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../apiConfig';

function GestionConservacion({ obraId }) {
  const [informes, setInformes] = useState([]);
  const [diagnostico, setDiagnostico] = useState('');
  const [recomendaciones, setRecomendaciones] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [editData, setEditData] = useState({});
  const { token, user } = useContext(AuthContext);

  const fetchInformes = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/obras/${obraId}/conservacion`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setInformes(data);
    } catch (error) {
      console.error("Error al obtener informes:", error);
    }
  }, [obraId, token]);

  useEffect(() => {
    fetchInformes();
  }, [fetchInformes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevoInforme = { diagnostico, recomendaciones, registrado_por: user?.email };

    await fetch(`${API_URL}/api/obras/${obraId}/conservacion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(nuevoInforme)
    });

    setDiagnostico('');
    setRecomendaciones('');
    fetchInformes();
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este informe?")) return;
    await fetch(`${API_URL}/api/conservacion/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchInformes();
  };

  const handleActivarEdicion = (informe) => {
    setEditandoId(informe.id);
    setEditData({ 
        diagnostico: informe.diagnostico || '', 
        recomendaciones: informe.recomendaciones || '' 
    });
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setEditData({});
  };

  const handleGuardarEdicion = async (id) => {
    await fetch(`${API_URL}/api/conservacion/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(editData)
    });
    setEditandoId(null);
    fetchInformes();
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom>Diagnóstico y Conservación</Typography>
      
      {user && (user.rol === 'admin' || user.rol === 'editor' || user.rol === 'conservador') && (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <TextField
            label="Diagnóstico del Estado de Conservación"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            value={diagnostico}
            onChange={(e) => setDiagnostico(e.target.value)}
            required
          />
          <TextField
            label="Recomendaciones"
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            value={recomendaciones}
            onChange={(e) => setRecomendaciones(e.target.value)}
          />
          <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-end' }}>Añadir Informe</Button>
        </Box>
      )}

      <Divider />

      <Box sx={{ mt: 2 }}>
        {informes.length > 0 ? (
          informes.map(informe => (
            <Accordion key={informe.id} TransitionProps={{ unmountOnExit: true }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                  {`Informe del ${new Date(informe.fecha_informe).toLocaleDateString()}`}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  {`por ${informe.usuario_email || 'N/A'}`}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {editandoId === informe.id ? (
                  <Box component="form" onSubmit={(e) => { e.preventDefault(); handleGuardarEdicion(informe.id); }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Diagnóstico" multiline rows={3} value={editData.diagnostico} onChange={(e) => setEditData({...editData, diagnostico: e.target.value})} fullWidth required/>
                    <TextField label="Recomendaciones" multiline rows={3} value={editData.recomendaciones} onChange={(e) => setEditData({...editData, recomendaciones: e.target.value})} fullWidth/>
                    <Box>
                      <IconButton title="Guardar" color="primary" type="submit"><SaveIcon /></IconButton>
                      <IconButton title="Cancelar" onClick={handleCancelarEdicion}><CancelIcon /></IconButton>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="subtitle2" color="text.primary" sx={{mt: 1, display: 'block'}}>Diagnóstico:</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{informe.diagnostico}</Typography>
                    
                    <Typography variant="subtitle2" color="text.primary" sx={{ mt: 2, display: 'block' }}>Recomendaciones:</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{informe.recomendaciones || 'Ninguna.'}</Typography>
                    
                    {user && (user.rol === 'admin' || user.rol === 'editor' || user.rol === 'conservador') && (
                      <Box sx={{ mt: 2, textAlign: 'right' }}>
                        <IconButton title="Editar" color="primary" onClick={() => handleActivarEdicion(informe)}><EditIcon /></IconButton>
                        <IconButton title="Eliminar" color="error" onClick={() => handleEliminar(informe.id)}><DeleteIcon /></IconButton>
                      </Box>
                    )}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No hay informes de conservación registrados.</Typography>
        )}
      </Box>
    </Paper>
  );
}

export default GestionConservacion;
