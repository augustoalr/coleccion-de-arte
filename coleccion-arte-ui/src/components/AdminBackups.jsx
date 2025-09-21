import React, { useState, useContext } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
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
    <Paper sx={{ p: 2, mt: 4 }}>
      <Typography variant="h5" gutterBottom>Gestión de Backups</Typography>
      <Button variant="contained" onClick={handleBackup} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Crear Backup de la Base de Datos'}
      </Button>
      {message && <Alert severity={message.startsWith('Error') ? 'error' : 'success'} sx={{ mt: 2 }}>{message}</Alert>}
    </Paper>
  );
}

export default AdminBackups;