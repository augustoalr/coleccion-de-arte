import React, { useState, useContext, useRef } from 'react';
import { Box, TextField, Button, Typography, Paper, Stack, Autocomplete, Stepper, Step, StepLabel, Tooltip, Popper } from '@mui/material';
import { useCatalogos } from '../hooks/useCatalogos';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../apiConfig';

const steps = ['Ficha Técnica Principal', 'Descripciones', 'Datos de Registro'];

const categorias = [
  'Pintura', 'Collage', 'Escultura', 'Textil', 'Cerámica', 'Vitral', 'Ensamblaje', 'Dibujo', 
  'Fotografía', 'Estampa', 'Instalación', 'Instalación fotográfica', 'Video instalación', 'Objeto', 
  'Nuevos medios', 'Instalación a pared', 'Maqueta/Boceto', 'Exterior', 'Documento histórico'
];

const modosAdquisicion = [
  'Compra', 'Donación', 'Comodato'
];

const estadosConservacion = ['Bueno', 'Regular', 'Malo'];

const CustomPopper = ({ inputRef, ...props }) => {
  const width = inputRef.current ? inputRef.current.offsetWidth : 'auto';
  return (
    <Popper 
      {...props} 
      style={{ ...props.style, width }} 
      placement="bottom-start"
    />
  );
};


function FormularioObra({ onObraCreada }) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [imagen, setImagen] = useState(null);
  const { token, user } = useContext(AuthContext);
  const { estados, ubicaciones } = useCatalogos();

  const categoriaRef = useRef(null);
  const estadoConservacionRef = useRef(null);
  const estadoObraRef = useRef(null);
  const ubicacionRef = useRef(null);
  const modoAdquisicionRef = useRef(null);

  const handleNext = () => setActiveStep((prevActiveStep) => prevActiveStep + 1);
  const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);

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

  const preventSubmitOnEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.autor_nombre?.trim() || !formData.titulo?.trim()) {
      alert('Los campos "Autor" y "Título" son obligatorios y no pueden ser vacíos.');
      return;
    }
    if (formData.valor_inicial && isNaN(parseFloat(formData.valor_inicial))) {
      alert('Valor Inicial debe ser un número válido.');
      return;
    }
    if (formData.valor_usd && isNaN(parseFloat(formData.valor_usd))) {
      alert('Valor USD debe ser un número válido.');
      return;
    }

    const dataToSend = new FormData();
    for (const key in formData) {
      dataToSend.append(key, formData[key] || '');
    }
    if (imagen) {
      dataToSend.append('imagen', imagen);
    }

    // Logging para depurar FormData
    for (let [key, value] of dataToSend.entries()) {
      console.log(`FormData enviado: ${key} = ${value}`);
    }

    try {
      const response = await fetch(`${API_URL}/api/obras`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: dataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error del servidor: ${response.status}`);
      }
      
      onObraCreada();
      setFormData({});
      setImagen(null);
      setActiveStep(0);
      if (document.getElementById('file-input-create')) {
        document.getElementById('file-input-create').value = "";
      }
    } catch (error) {
      console.error("Error al crear la obra:", error.message);
      alert(`No se pudo crear la obra: ${error.message}`);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2} direction="column">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
              <TextField label="N° de Registro" name="numero_registro" value={formData.numero_registro || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} onKeyDown={preventSubmitOnEnter} />
              <Tooltip title="Campo obligatorio" arrow>
                <TextField label="Autor" name="autor_nombre" value={formData.autor_nombre || ''} onChange={handleChange} fullWidth required sx={{ flex: 1 }} onKeyDown={preventSubmitOnEnter} />
              </Tooltip>
            </Stack>
            <Tooltip title="Campo obligatorio" arrow>
              <TextField label="Título" name="titulo" value={formData.titulo || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} onKeyDown={preventSubmitOnEnter} />
            </Tooltip>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
              <TextField label="Fecha de Creación" name="fecha_creacion" value={formData.fecha_creacion || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} onKeyDown={preventSubmitOnEnter} />
              <Autocomplete
                freeSolo
                options={categorias}
                onInputChange={(_, newInputValue) => handleAutocompleteChange('categoria', newInputValue)}
                inputValue={formData.categoria || ''}
                sx={{ flex: 1, width: '100%', '& .MuiAutocomplete-root': { width: '100% !important' } }}
                PopperComponent={(props) => <CustomPopper {...props} inputRef={categoriaRef} />}
                renderInput={(params) => <TextField {...params} label="Categoría" fullWidth inputRef={categoriaRef} onKeyDown={preventSubmitOnEnter} />}
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
              <TextField label="Técnica" name="tecnica_materiales" value={formData.tecnica_materiales || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} onKeyDown={preventSubmitOnEnter} />
              <TextField label="Medidas" name="dimensiones" value={formData.dimensiones || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} onKeyDown={preventSubmitOnEnter} />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
              <Autocomplete
                options={estadosConservacion}
                onChange={(e, val) => handleAutocompleteChange('estado_conservacion', val)}
                sx={{ flex: 1, width: '100%', '& .MuiAutocomplete-root': { width: '100% !important' } }}
                PopperComponent={(props) => <CustomPopper {...props} inputRef={estadoConservacionRef} />}
                renderInput={(params) => <TextField {...params} label="Estado de Conservación" fullWidth inputRef={estadoConservacionRef} onKeyDown={preventSubmitOnEnter} />}
              />
              <Autocomplete
                options={estados}
                getOptionLabel={(o) => o.nombre}
                onChange={(e, val) => handleAutocompleteChange('estado', val ? val.nombre : '')}
                sx={{ flex: 1, width: '100%', '& .MuiAutocomplete-root': { width: '100% !important' } }}
                PopperComponent={(props) => <CustomPopper {...props} inputRef={estadoObraRef} />}
                renderInput={(params) => <TextField {...params} label="Estado de la Obra" fullWidth inputRef={estadoObraRef} onKeyDown={preventSubmitOnEnter} />}
              />
            </Stack>
            <Autocomplete
              options={ubicaciones}
              getOptionLabel={(o) => o.nombre}
              onChange={(e, val) => handleAutocompleteChange('ubicacion_id', val ? val.id : '')}
              sx={{ flex: 1, width: '100%', '& .MuiAutocomplete-root': { width: '100% !important' } }}
              PopperComponent={(props) => <CustomPopper {...props} inputRef={ubicacionRef} />}
              renderInput={(params) => <TextField {...params} label="Ubicación Principal" fullWidth inputRef={ubicacionRef} onKeyDown={preventSubmitOnEnter} />}
            />
            <Button variant="outlined" component="label" fullWidth type="button">Seleccionar Imagen<input id="file-input-create" type="file" hidden onChange={handleImageChange} accept="image/*" /></Button>
            {imagen && (
              <Box>
                <Typography variant="body2">Archivo: {imagen.name}</Typography>
                <img src={URL.createObjectURL(imagen)} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '8px' }} />
              </Box>
            )}
          </Stack>
        );
      
      case 1:
        return (
          <Stack spacing={2} direction="column">
            <TextField label="Descripción del Montaje" name="descripcion_montaje" value={formData.descripcion_montaje || ''} onChange={handleChange} fullWidth multiline minRows={4} maxRows={6} onKeyDown={preventSubmitOnEnter} />
            <TextField label="Observaciones Generales" name="observaciones_generales" value={formData.observaciones_generales || ''} onChange={handleChange} fullWidth multiline minRows={4} maxRows={6} onKeyDown={preventSubmitOnEnter} />
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={2} direction="column">

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
              <Tooltip title="Propietario original" arrow>
                <TextField label="Historia de procedencia" name="propietario_original" value={formData.propietario_original || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} onKeyDown={preventSubmitOnEnter} />
              </Tooltip>


              <Autocomplete
                freeSolo
                options={modosAdquisicion}
                onInputChange={(_, newInputValue) => handleAutocompleteChange('procedencia', newInputValue)}
                inputValue={formData.procedencia || ''}
                sx={{ flex: 1, width: '100%', '& .MuiAutocomplete-root': { width: '100% !important' } }}
                PopperComponent={(props) => <CustomPopper {...props} inputRef={modoAdquisicionRef} />}
                renderInput={(params) => (
                  <Tooltip title="Procedencia" arrow>
                    <TextField {...params} label="Modos de adquisición" fullWidth inputRef={modoAdquisicionRef} onKeyDown={preventSubmitOnEnter} />
                  </Tooltip>
                )}
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
              <TextField label="Ingreso Aprobado Por" name="ingreso_aprobado_por" value={formData.ingreso_aprobado_por || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} onKeyDown={preventSubmitOnEnter} />
              <TextField label="Valor Inicial Bs" name="valor_inicial" type="number" value={formData.valor_inicial || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} onKeyDown={preventSubmitOnEnter} />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
              <TextField label="Valor USD" name="valor_usd" type="number" value={formData.valor_usd || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} onKeyDown={preventSubmitOnEnter} />
              <TextField label="Fecha de Avalúo" name="fecha_avaluo" type="date" value={formData.fecha_avaluo || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth sx={{ flex: 1 }} onKeyDown={preventSubmitOnEnter} />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
              <TextField label="Registro Realizado Por" name="registro_realizado_por" value={user?.email || ''} disabled fullWidth sx={{ flex: 1 }} onKeyDown={preventSubmitOnEnter} />
              <TextField label="Registro Revisado Por" name="registro_revisado_por" value={formData.registro_revisado_por || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} onKeyDown={preventSubmitOnEnter} />
            </Stack>
            <TextField label="Fecha de Realización" name="fecha_realizacion" type="date" value={new Date().toISOString().split('T')[0]} disabled InputLabelProps={{ shrink: true }} fullWidth onKeyDown={preventSubmitOnEnter} />
          </Stack>
        );
      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>Añadir Nueva Obra</Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
      </Stepper>
      <Box component="form" onSubmit={handleSubmit}>
        {getStepContent(activeStep)}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }} type="button">Anterior</Button>
          )}
          <Button
            variant="contained"
            key={activeStep === steps.length - 1 ? 'submit' : 'next'} // CAMBIO: Key dinámico para prevenir auto-submit al renderizar
            type={activeStep === steps.length - 1 ? 'submit' : 'button'}
            onClick={activeStep === steps.length - 1 ? undefined : handleNext}
          >
            {activeStep === steps.length - 1 ? 'Guardar Obra' : 'Siguiente'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default React.memo(FormularioObra);