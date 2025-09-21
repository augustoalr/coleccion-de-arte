import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, TextField, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../apiConfig';

function AdminCrearUsuario() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('lector');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/usuarios/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email, password, rol })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      
      setSuccess(`Usuario "${email}" creado exitosamente. Redirigiendo a la lista...`);
      setTimeout(() => {
        navigate('/admin/usuarios');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Error al crear el usuario');
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>Crear Nuevo Usuario</Typography>
        <Button onClick={() => navigate('/admin/usuarios')} startIcon={<ArrowBackIcon />}>
          Volver a la lista
        </Button>
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Correo Electrónico"
          type="email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Contraseña"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel>Rol</InputLabel>
          <Select
            value={rol}
            label="Rol"
            onChange={(e) => setRol(e.target.value)}
          >
            <MenuItem value="lector">Lector</MenuItem>
            <MenuItem value="editor">Editor</MenuItem>
            <MenuItem value="conservador">Conservador</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <Button type="submit" variant="contained" size="large" sx={{ mt: 2 }}>
          Crear Usuario
        </Button>
      </Box>
    </Paper>
  );
}

export default AdminCrearUsuario;