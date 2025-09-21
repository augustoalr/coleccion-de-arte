import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Alert } from '@mui/material';

function ConfirmDeleteModal({ open, onClose, onConfirm, title, message }) {
  const [masterPassword, setMasterPassword] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!masterPassword) {
      setError('La contraseña maestra es requerida.');
      return;
    }
    setError('');
    onConfirm(masterPassword);
  };

  const handleClose = () => {
    setMasterPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title || 'Confirmar Eliminación'}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {message || 'Esta acción es irreversible. Para confirmar, por favor ingresa la contraseña maestra.'}
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="master-password"
          label="Contraseña Maestra"
          type="password"
          fullWidth
          variant="standard"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
          error={!!error}
          helperText={error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">Cancelar</Button>
        <Button onClick={handleConfirm} variant="contained" color="error">Eliminar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDeleteModal;