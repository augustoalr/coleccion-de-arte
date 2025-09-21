import React, { useState, useEffect, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Autocomplete, Box, Typography } from '@mui/material';
import { useCatalogos } '../hooks/useCatalogos';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../apiConfig';

const categorias = [
  'Pintura', 'Collage', 'Escultura', 'Textil', 'Cerámica', 'Vitral', 'Ensamblaje', 'Dibujo', 
  'Fotografía', 'Estampa', 'Instalación', 'Instalación fotográfica', 'Video instalación', 'Objeto', 
  'Nuevos medios', 'Instalación a pared', 'Maqueta/Boceto', 'Exterior', 'Documento histórico'
];

const modosAdquisicion = [
  'Compra', 'Donación', 'Comodato'
];

const estadosConservacion = ['Bueno', 'Regular', 'Malo'];

function ModalEditar({ open, onClose, obra, onObraActualizada }) {
  const [formData, setFormData] = useState({});
  const [imagen, setImagen] = useState(null);
  const { token } = useContext(AuthContext);
  const { estados, ubicaciones } = useCatalogos();

  useEffect(() => {
    if (obra) {
      const initialData = {
        ...obra,
        ubicacion_id: obra.ubicacion_id || '',
        autor_nombre: obra.autor_nombre || '',
        fecha_avaluo: obra.fecha_avaluo ? new Date(obra.fecha_avaluo).toISOString().split('T')[0] : '',
        fecha_creacion: obra.fecha_creacion || ''
      };
      setFormData(initialData);
    } else {
      setFormData({});
    }
  }, [obra]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAutocompleteChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value || '' }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImagen(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.autor_nombre?.trim() || !formData.titulo?.trim()) {
      alert('Los campos "Autor" y "Título" son obligatorios.');
      return;
    }

    const dataToSend = new FormData();
    for (const key in formData) {
      dataToSend.append(key, formData[key] || '');
    }
    if (imagen) {
      dataToSend.append('imagen', imagen);
    }

    try {
      const response = await fetch(`${API_URL}/api/obras/${obra.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: dataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error del servidor: ${response.status}`);
      }
      
      const obraActualizada = await response.json();
      onObraActualizada(obraActualizada);
      onClose();
    } catch (error) {
      console.error("Error al actualizar la obra:", error.message);
      alert(`No se pudo actualizar la obra: ${error.message}`);
    }
  };

  if (!obra) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Editar Obra: {obra.titulo}</DialogTitle>
      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit} id="edit-form">
          <Stack spacing={2} direction="column">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="N° de Registro" name="numero_registro" value={formData.numero_registro || ''} onChange={handleChange} fullWidth />
              <TextField label="Autor" name="autor_nombre" value={formData.autor_nombre || ''} onChange={handleChange} fullWidth required />
            </Stack>
            <TextField label="Título" name="titulo" value={formData.titulo || ''} onChange={handleChange} fullWidth required />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Fecha de Creación" name="fecha_creacion" value={formData.fecha_creacion || ''} onChange={handleChange} fullWidth />
              <Autocomplete
                freeSolo
                options={categorias}
                inputValue={formData.categoria || ''}
                onInputChange={(_, val) => handleAutocompleteChange('categoria', val)}
                renderInput={(params) => <TextField {...params} label="Categoría" fullWidth />}
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Técnica/Materiales" name="tecnica_materiales" value={formData.tecnica_materiales || ''} onChange={handleChange} fullWidth />
              <TextField label="Dimensiones" name="dimensiones" value={formData.dimensiones || ''} onChange={handleChange} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Autocomplete
                options={estadosConservacion}
                value={formData.estado_conservacion || null}
                onChange={(e, val) => handleAutocompleteChange('estado_conservacion', val)}
                renderInput={(params) => <TextField {...params} label="Estado de Conservación" fullWidth />}
              />
              <Autocomplete
                options={estados}
                getOptionLabel={(o) => o.nombre}
                value={estados.find(e => e.nombre === formData.estado) || null}
                onChange={(e, val) => handleAutocompleteChange('estado', val ? val.nombre : '')}
                renderInput={(params) => <TextField {...params} label="Estado de la Obra" fullWidth />}
              />
            </Stack>
            <Autocomplete
              options={ubicaciones}
              getOptionLabel={(o) => o.nombre}
              value={ubicaciones.find(u => u.id === formData.ubicacion_id) || null}
              onChange={(e, val) => handleAutocompleteChange('ubicacion_id', val ? val.id : '')}
              renderInput={(params) => <TextField {...params} label="Ubicación Principal" fullWidth />}
            />
            <TextField label="Descripción del Montaje" name="descripcion_montaje" value={formData.descripcion_montaje || ''} onChange={handleChange} fullWidth multiline rows={3} />
            <TextField label="Observaciones Generales" name="observaciones_generales" value={formData.observaciones_generales || ''} onChange={handleChange} fullWidth multiline rows={3} />
            
            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>Datos de Registro</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Historia de procedencia" name="propietario_original" value={formData.propietario_original || ''} onChange={handleChange} fullWidth />
              <Autocomplete
                freeSolo
                options={modosAdquisicion}
                inputValue={formData.procedencia || ''}
                onInputChange={(_, val) => handleAutocompleteChange('procedencia', val)}
                renderInput={(params) => <TextField {...params} label="Modo de adquisición" fullWidth />}
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Ingreso Aprobado Por" name="ingreso_aprobado_por" value={formData.ingreso_aprobado_por || ''} onChange={handleChange} fullWidth />
              <TextField label="Valor Inicial Bs" name="valor_inicial" type="number" value={formData.valor_inicial || ''} onChange={handleChange} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Valor USD" name="valor_usd" type="number" value={formData.valor_usd || ''} onChange={handleChange} fullWidth />
              <TextField label="Fecha de Avalúo" name="fecha_avaluo" type="date" value={formData.fecha_avaluo || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Registro Realizado Por" name="registro_realizado_por" value={formData.registro_realizado_por || ''} disabled fullWidth />
              <TextField label="Registro Revisado Por" name="registro_revisado_por" value={formData.registro_revisado_por || ''} onChange={handleChange} fullWidth />
            </Stack>

            <Button variant="outlined" component="label" fullWidth>Cambiar Imagen<input type="file" hidden onChange={handleImageChange} accept="image/*" /></Button>
            {imagen && <Typography variant="body2">Nuevo archivo: {imagen.name}</Typography>}
            {!imagen && obra.url_imagen && (
              <Box sx={{ mt: 1, textAlign: 'center' }}>
                <Typography variant="caption">Imagen actual:</Typography>
                <img src={`${API_URL}/${obra.url_imagen}`} alt="Imagen actual" style={{ width: '100%', height: 'auto', maxHeight: '250px', objectFit: 'contain' }} />
              </Box>
            )}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button type="submit" form="edit-form" variant="contained">Guardar Cambios</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ModalEditar;