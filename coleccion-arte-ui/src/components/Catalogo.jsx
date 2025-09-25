import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Grid, Card, CardMedia, CardContent, CardActions, Typography, Button, Box, TextField, InputAdornment, Paper, Checkbox, FormControlLabel, Pagination, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import SearchIcon from '@mui/icons-material/Search';


import IosShareIcon from '@mui/icons-material/IosShare';
import FormularioObra from './FormularioObra';
import ModalEditar from './ModalEditar';
import ModalExportacion from './ModalExportacion';
import ConfirmDeleteModal from './ConfirmDeleteModal';

import AuthContext from '../context/AuthContext';


import API_URL from '../apiConfig';



function Catalogo() {
  const [obras, setObras] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // 2. Nuevo estado para el modal
  const [obraAEliminar, setObraAEliminar] = useState(null); // Para saber qué obra borrar
  const [modalVisible, setModalVisible] = useState(false);
  const [obraEnEdicion, setObraEnEdicion] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const [seleccionados, setSeleccionados] = useState([]);
  const [modalExportOpen, setModalExportOpen] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const { token, user, logout, refrescarUsuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchObras = useCallback(async (busqueda, paginaActual) => {
    if (!token) return;
    const limit = 12;
    let url = `${API_URL}/api/obras?page=${paginaActual}&limit=${limit}`;
    if (busqueda) {
      url += `&search=${encodeURIComponent(busqueda)}`;
    }
    try {
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` }, cache: 'no-store' });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) { logout(); navigate('/login'); }
        throw new Error('No se pudo obtener la data');
      }
      const data = await response.json();
      setObras(data.obras);
      setTotalPaginas(data.totalPaginas);
      setSeleccionados([]);
    } catch (error) { console.error('Error al obtener las obras:', error); }
  }, [token, logout, navigate]);

  // useEffect para el "debounce" de la búsqueda (Corregido)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagina !== 1) {
        setPagina(1);
      }
      setBusquedaDebounced(terminoBusqueda);
    }, 500);
    return () => clearTimeout(timer);
  }, [terminoBusqueda, pagina]); // Dependencia 'pagina' añadida

  // useEffect para buscar los datos
  useEffect(() => {
    fetchObras(busquedaDebounced, pagina);
  }, [busquedaDebounced, pagina, fetchObras]);


  

  const handlePageChange = (event, value) => {
    setPagina(value);
  };

  const handleSeleccionChange = (id) => { setSeleccionados(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]); };
  
  const handleSeleccionarTodos = (event) => {
    if (event.target.checked) {
      setSeleccionados(obras.map(obra => obra.id));
    } else {
      setSeleccionados([]);
    }
  };


  
   const handleActionCompleta = useCallback(async () => {
    await refrescarUsuario(); // Primero refresca los puntos del usuario
    await fetchObras(busquedaDebounced, pagina); // Luego refresca la lista de obras
  }, [refrescarUsuario, fetchObras, busquedaDebounced, pagina]);
 

  const handleGuardarCambios = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/api/obras/${obraEnEdicion.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error del servidor: ${response.status}`);
      }

      fetchObras(busquedaDebounced, pagina);
      handleCerrarModal();
      await handleActionCompleta(); // Refrescar puntos y obras
    } catch (error) {
      console.error("Error al guardar cambios:", error.message);
      alert(`Error al guardar: ${error.message}`);
    }
  };

  

  const handleAbrirModal = (obra, e) => { e.preventDefault(); setObraEnEdicion(obra); setModalVisible(true); };
  const handleCerrarModal = () => { setModalVisible(false); setObraEnEdicion(null); };

    const handleAbrirModalEliminar = (obra, e) => {
    e.preventDefault();
    setObraAEliminar(obra);
    setDeleteModalOpen(true);
  };

  const handleCerrarModalEliminar = () => {
    setObraAEliminar(null);
    setDeleteModalOpen(false);
  };

  const handleConfirmarEliminar = async (masterPassword) => {
    if (!obraAEliminar) return;

    try {
        // Primero, verificar la contraseña maestra
        const verifyResponse = await fetch(`${API_URL}/api/admin/verify-master-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ masterPassword })
        });
        
        if (!verifyResponse.ok) {
            const errorText = await verifyResponse.text();
            throw new Error(errorText || 'Contraseña maestra incorrecta.');
        }

        // Si la contraseña es correcta, proceder con la eliminación
        await fetch(`${API_URL}/api/obras/${obraAEliminar.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        handleCerrarModalEliminar();
        await handleActionCompleta(); // Usar la nueva función aquí

        fetchObras(busquedaDebounced, pagina);

    } catch (error) {
        console.error("Error al eliminar:", error.message);
        // Aquí podrías mostrar el error en el modal si lo deseas
        alert(`Error: ${error.message}`);
    }
  };

  const handleObraCreada = useCallback(() => {
    setTerminoBusqueda('');
    setPagina(1);
  }, []);

  return (
    <>


      {user && (user.rol === 'admin' || user.rol === 'editor') && (
        <FormularioObra onObraCreada={handleObraCreada} />
        
      )}
      
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>Catálogo Principal</Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Buscar por Título, Autor o N° de Registro"
          variant="outlined"
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>), }}
        />
      </Paper>

      <Paper sx={{ p: 1, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControlLabel
          control={<Checkbox checked={obras.length > 0 && seleccionados.length === obras.length} indeterminate={seleccionados.length > 0 && seleccionados.length < obras.length} onChange={handleSeleccionarTodos} />}
          label={seleccionados.length === 0 ? "Seleccionar todo" : `${seleccionados.length} seleccionado(s)`}
        />
        <Button
          variant="contained"
          color="secondary"
          disabled={seleccionados.length === 0}
          startIcon={<IosShareIcon />}
          onClick={() => setModalExportOpen(true)}
        >
          Exportar
        </Button>
      </Paper>
      
      <Grid container spacing={3}>
        {obras.map(obra => (
          <Grid key={obra.id} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Box sx={{ position: 'relative' }}>
                <Checkbox checked={seleccionados.includes(obra.id)} onChange={() => handleSeleccionChange(obra.id)} onClick={(e) => e.stopPropagation()} sx={{ position: 'absolute', top: 0, left: 0, zIndex: 1, color: 'white', '&.Mui-checked': { color: 'primary.main' } }} />
                {obra.url_imagen ? (
                  <CardMedia component="img" height="140" image={`${API_URL}/${obra.url_imagen}`} alt={obra.titulo} />
                ) : (
                  <Box sx={{ height: 140, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">Sin imagen</Typography>
                  </Box>
                )}
              </Box>
              <CardContent component={RouterLink} to={`/obras/${obra.id}`} sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', '&:hover': { bgcolor: 'action.hover' } }}>
                <Typography gutterBottom variant="h5" component="div">{obra.titulo}</Typography>
                <Typography color="text.secondary">{obra.autor_nombre}</Typography>
              </CardContent>
              {user && (user.rol === 'admin' || user.rol === 'editor') && (
                <CardActions>
                  <Button size="small" startIcon={<EditIcon />} onClick={(e) => handleAbrirModal(obra, e)}>Editar</Button>
                  <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={(e) => handleAbrirModalEliminar(obra, e)}>Eliminar</Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      <Stack spacing={2} sx={{ mt: 4, mb: 4, alignItems: 'center' }}>
        <Pagination count={totalPaginas} page={pagina} onChange={handlePageChange} color="primary" />
      </Stack>

      {modalVisible && (
        <ModalEditar obra={obraEnEdicion} onClose={handleCerrarModal} onSave={handleGuardarCambios} />
      )}

      {modalExportOpen && (
        <ModalExportacion open={modalExportOpen} onClose={() => setModalExportOpen(false)} ids={seleccionados} />
      )}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={handleCerrarModalEliminar}
        onConfirm={handleConfirmarEliminar}
        title={`¿Eliminar la obra "${obraAEliminar?.titulo}"?`}
      />
    </>
  );
}

export default Catalogo;