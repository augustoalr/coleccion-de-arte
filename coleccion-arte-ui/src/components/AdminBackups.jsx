import React, { useState, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AuthContext from '../context/AuthContext';
import API_URL from '../apiConfig';

function AdminBackups() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { token } = useContext(AuthContext);

  const handleBackup = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/admin/backup`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al crear el backup');
      setMessage(`Backup creado exitosamente en: ${data.filePath}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Volver al Catálogo
      </Button>
      <Paper sx={{ p: 2, backgroundColor: 'white' }}>
        <Typography variant="h5" gutterBottom>Gestión de Backups</Typography>
        <Button variant="contained" onClick={handleBackup} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Crear Backup de la Base de Datos'}
        </Button>
        {message && <Alert severity={message.startsWith('Error') ? 'error' : 'success'} sx={{ mt: 2 }}>{message}</Alert>}
      </Paper>
    </Box>
  );
}

export default AdminBackups;
