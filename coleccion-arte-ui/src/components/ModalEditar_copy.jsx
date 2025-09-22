import React, { useState, useEffect, useRef } from 'react';
import { Modal, Box, Typography, TextField, Button, Stack, Autocomplete, Tabs, Tab, Popper } from '@mui/material';
import { useCatalogos } from '../hooks/useCatalogos';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 900,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
};

const categorias = [
  'Pintura', 'Collage', 'Escultura', 'Textil', 'Cerámica', 'Vitral', 'Ensamblaje', 'Dibujo', 
  'Fotografía', 'Estampa', 'Instalación', 'Instalación fotográfica', 'Video instalación', 'Objeto', 
  'Nuevos medios', 'Instalación a pared', 'Maqueta/Boceto', 'Exterior', 'Documento histórico'
];

const modosAdquisicion = [
  'Compra', 'Donación', 'Comodato' 
];

const estadosConservacion = ['Bueno', 'Regular', 'Malo'];

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function ModalEditar({ obra, onClose, onSave }) {
  const [formData, setFormData] = useState({});
  const [nuevaImagen, setNuevaImagen] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const { estados, ubicaciones } = useCatalogos();
  

  // CAMBIO: Refs para los Autocomplete
  const categoriaRef = useRef(null);
  const estadoConservacionRef = useRef(null);
  const estadoObraRef = useRef(null);
  const ubicacionRef = useRef(null);
  const modoAdquisicionRef = useRef(null);

  useEffect(() => {
    const datosObra = { ...obra };
    ['fecha_ingreso', 'fecha_avaluo', 'fecha_realizacion'].forEach(fecha => {
      if (datosObra[fecha]) {
        datosObra[fecha] = new Date(datosObra[fecha]).toISOString().split('T')[0];
      }
    });
    setFormData(datosObra);
    setNuevaImagen(null);
  }, [obra]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleAutocompleteChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value || '' }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setNuevaImagen(e.target.files[0]);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    for (const key in formData) {
      if (key !== 'url_imagen') {
        dataToSend.append(key, formData[key] || '');
      }
    }
    if (nuevaImagen) {
      dataToSend.append('imagen', nuevaImagen);
    }
    onSave(dataToSend);
  };

  // CAMBIO: CustomPopper para fijar el ancho del desplegable
  const CustomPopper = ({ inputRef, ...props }) => {
    const width = inputRef.current ? inputRef.current.offsetWidth : 'auto';
    return (
      <Popper 
        {...props} 
        style={{ ...props.style, width }} 
        placement="bottom-start"
        // sx={{ border: '1px solid blue' }} // CAMBIO: Debug (quitar después)
      />
    );
  };

  if (!obra) return null;

  return (
    <Modal open={true} onClose={onClose}>
      <Box component="form" onSubmit={handleSubmit} sx={style}>
        <Typography variant="h6" component="h2">Editar Obra: {formData.titulo}</Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Ficha Técnica" />
            <Tab label="Descripciones" />
            <Tab label="Datos de Registro" />
          </Tabs>
        </Box>

        <Box sx={{ overflowY: 'auto', p: 0.5, mt: 1, flexGrow: 1 }}>
          <TabPanel value={tabValue} index={0}>
            {/* CAMBIO: Reemplazar Grid por Stack */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ width: '100%' }}>
              {/* Columna Izquierda para Campos */}
              <Stack direction="column" spacing={2} sx={{ flexBasis: { xs: '100%', md: '66.67%' } }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
                  <TextField label="N° de Registro" name="numero_registro" value={formData.numero_registro || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} />
                  <TextField label="Autor" name="autor_nombre" value={formData.autor_nombre || ''} onChange={handleChange} fullWidth required sx={{ flex: 1 }} />
                </Stack>
                <TextField label="Título" name="titulo" value={formData.titulo || ''} onChange={handleChange} fullWidth required sx={{ flex: 1 }} />
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
                  <TextField label="Fecha de Creación" name="fecha_creacion" value={formData.fecha_creacion || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} />
                  <Autocomplete
                    freeSolo
                    options={categorias}
                    onInputChange={(_, newInputValue) => handleAutocompleteChange('categoria', newInputValue)}
                    inputValue={formData.categoria || ''}
                    sx={{ flex: 1, width: '100%', '& .MuiAutocomplete-root': { width: '100% !important' } }}
                    PopperComponent={(props) => <CustomPopper {...props} inputRef={categoriaRef} />}
                    renderInput={(params) => <TextField {...params} label="Categoría" fullWidth inputRef={categoriaRef} />}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
                  <TextField label="Técnica" name="tecnica_materiales" value={formData.tecnica_materiales || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} />
                  <TextField label="Medidas" name="dimensiones" value={formData.dimensiones || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
                  <Autocomplete
                    options={estadosConservacion}
                    onChange={(e, val) => handleAutocompleteChange('estado_conservacion', val)}
                    value={formData.estado_conservacion || null}
                    sx={{ flex: 1, width: '100%', '& .MuiAutocomplete-root': { width: '100% !important' } }}
                    PopperComponent={(props) => <CustomPopper {...props} inputRef={estadoConservacionRef} />}
                    renderInput={(params) => <TextField {...params} label="Estado de Conservación" fullWidth inputRef={estadoConservacionRef} />}
                  />
                  <Autocomplete
                    options={estados}
                    getOptionLabel={(o) => o.nombre}
                    onChange={(e, val) => handleAutocompleteChange('estado', val ? val.nombre : '')}
                    value={estados.find(o => o.nombre === formData.estado) || null}
                    sx={{ flex: 1, width: '100%', '& .MuiAutocomplete-root': { width: '100% !important' } }}
                    PopperComponent={(props) => <CustomPopper {...props} inputRef={estadoObraRef} />}
                    renderInput={(params) => <TextField {...params} label="Estado de la Obra" fullWidth inputRef={estadoObraRef} />}
                  />
                </Stack>
                <Autocomplete
                  options={ubicaciones}
                  getOptionLabel={(o) => o.nombre}
                  onChange={(e, val) => handleAutocompleteChange('ubicacion_id', val ? val.id : '')}
                  value={ubicaciones.find(u => u.id === formData.ubicacion_id) || null}
                  sx={{ flex: 1, width: '100%', '& .MuiAutocomplete-root': { width: '100% !important' } }}
                  PopperComponent={(props) => <CustomPopper {...props} inputRef={ubicacionRef} />}
                  renderInput={(params) => <TextField {...params} label="Ubicación Principal" fullWidth inputRef={ubicacionRef} />}
                />
              </Stack>
              {/* Columna Derecha para Imagen */}
              <Stack direction="column" spacing={2} sx={{ flexBasis: { xs: '100%', md: '33.33%' }, alignItems: 'center' }}>
                <Typography variant="subtitle2" align="center">Imagen</Typography>
                <Box sx={{ textAlign: 'center', my: 1, border: '1px dashed grey', borderRadius: 1, p: 1, width: '100%' }}>
                  {nuevaImagen ? (
                    <img src={URL.createObjectURL(nuevaImagen)} alt="Nueva imagen" style={{ width: '100%', height: 'auto', maxHeight: '250px', objectFit: 'contain' }} />
                  ) : obra.url_imagen ? (
                    <img src={`http://localhost:4000/${obra.url_imagen}`} alt="Imagen actual" style={{ width: '100%', height: 'auto', maxHeight: '250px', objectFit: 'contain' }} />
                  ) : (
                    <Typography sx={{ mt: 2, mb: 2, color: 'text.secondary' }}>(Sin imagen)</Typography>
                  )}
                </Box>
                <Button variant="outlined" component="label" fullWidth>
                  Cambiar Imagen
                  <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                </Button>
                {(nuevaImagen || obra.url_imagen) && (
                  <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', color: 'primary.main' }}>
                    {nuevaImagen ? `Nueva: ${nuevaImagen.name}` : 'Imagen existente'}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Stack direction="column" spacing={2}>
              <TextField label="Descripción del Montaje" name="descripcion_montaje" value={formData.descripcion_montaje || ''} onChange={handleChange} fullWidth multiline rows={8} />
              <TextField label="Observaciones Generales" name="observaciones_generales" value={formData.observaciones_generales || ''} onChange={handleChange} fullWidth multiline rows={8} />
            </Stack>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Stack direction="column" spacing={2}>
              

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
                  

               
                <TextField label="Historia de procedencia" name="propietario_original" value={formData.propietario_original || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} /> 
                

                 <Autocomplete
                                freeSolo
                                options={modosAdquisicion}
                                onInputChange={(_, newInputValue) => handleAutocompleteChange('procedencia', newInputValue)}
                                inputValue={formData.procedencia || ''}
                                sx={{ flex: 1, width: '100%', '& .MuiAutocomplete-root': { width: '100% !important' } }}
                                PopperComponent={(props) => <CustomPopper {...props} inputRef={modoAdquisicionRef} />}
                                renderInput={(params) =><TextField {...params} label="Modos de adquisición" fullWidth inputRef={modoAdquisicionRef} />}
                              />
                </Stack>


              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
                <TextField label="Ingreso Aprobado Por" name="ingreso_aprobado_por" value={formData.ingreso_aprobado_por || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} />
                <TextField label="Registro Revisado Por" name="registro_revisado_por" value={formData.registro_revisado_por || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
                <TextField label="Valor Inicial Bs" name="valor_inicial" type="number" value={formData.valor_inicial || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} />
                <TextField label="Valor USD" name="valor_usd" type="number" value={formData.valor_usd || ''} onChange={handleChange} fullWidth sx={{ flex: 1 }} />
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%' }}>
                <TextField label="Fecha de Avalúo" name="fecha_avaluo" type="date" value={formData.fecha_avaluo || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth sx={{ flex: 1 }} />
                <TextField label="Registro Realizado Por" name="registro_realizado_por" value={formData.registro_realizado_por || ''} disabled fullWidth sx={{ flex: 1 }} />
              </Stack>
              <TextField label="Fecha de Realización" name="fecha_realizacion" type="date" value={formData.fecha_realizacion || ''} disabled InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
          </TabPanel>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained">Guardar Cambios</Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default ModalEditar;