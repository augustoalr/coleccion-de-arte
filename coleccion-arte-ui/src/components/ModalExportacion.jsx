import React, { useState, useContext } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormGroup, FormControlLabel, Checkbox, RadioGroup, Radio, FormControl, FormLabel, CircularProgress } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { saveAs } from 'file-saver';
import API_URL from '../apiConfig';

function ModalExportacion({ open, onClose, ids }) {
  const [secciones, setSecciones] = useState(['ficha']);
  const [formato, setFormato] = useState('pdf');
  const [exportando, setExportando] = useState(false);
  const { token } = useContext(AuthContext);

  const handleSeccionChange = (event) => {
    const { name, checked } = event.target;
    if (checked) {
      setSecciones(prev => [...prev, name]);
    } else {
      setSecciones(prev => prev.filter(sec => sec !== name));
    }
  };

  const handleGenerarDocumento = async () => {
    setExportando(true);

    try {
      const response = await fetch(`${API_URL}/api/exportar-documento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids, secciones, formato })
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const blob = await response.blob();
      const extension = formato === 'pdf' ? 'pdf' : 'docx';
      
      saveAs(blob, `informe_obras.${extension}`);
      
      onClose();

    } catch (error) {
      console.error("Error al exportar documento:", error);
      alert("Ocurrió un error al generar el documento.");
    } finally {
      setExportando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Opciones de Exportación</DialogTitle>
      <DialogContent dividers>
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Seleccione las secciones a incluir</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={secciones.includes('ficha')} onChange={handleSeccionChange} name="ficha" />}
              label="Ficha de Registro General"
            />
            <FormControlLabel
              control={<Checkbox checked={secciones.includes('movimientos')} onChange={handleSeccionChange} name="movimientos" />}
              label="Historial de Movimientos"
            />
            <FormControlLabel
              control={<Checkbox checked={secciones.includes('conservacion')} onChange={handleSeccionChange} name="conservacion" />}
              label="Informes de Conservación"
            />
          </FormGroup>
        </FormControl>

        <FormControl component="fieldset">
          <FormLabel component="legend">Seleccione el formato del archivo</FormLabel>
          <RadioGroup row value={formato} onChange={(e) => setFormato(e.target.value)}>
            <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
            <FormControlLabel value="docx" control={<Radio />} label="Word (DOCX)" />
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancelar</Button>
        <Button 
          onClick={handleGenerarDocumento} 
          variant="contained"
          disabled={exportando || secciones.length === 0}
          startIcon={exportando ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {exportando ? 'Generando...' : 'Generar Documento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ModalExportacion;