import React, { useState, useEffect, useContext } from 'react';
import { Grid, Card, CardActionArea, CardMedia, CardContent, Typography, Box, Pagination, TextField, InputAdornment, Button, CircularProgress, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ModalEditar from './ModalEditar';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import API_URL from '../apiConfig';

function Catalogo() {
  const [obras, setObras] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [obraEnEdicion, setObraEnEdicion] = useState(null);
  const [obraAEliminar, setObraAEliminar] = useState(null);
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const limit = 12;

  useEffect(() => {
    const fetchObras = async () => {
      if (!token) return;
      setLoading(true);
      try {
        let url = `${API_URL}/api/obras?page=${paginaActual}&limit=${limit}`;
        if (busqueda) {
          url += `&search=${busqueda}`;
        }
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) throw new Error('Error al cargar las obras');
        const data = await response.json();
        setObras(data.obras);
        setTotalPaginas(data.totalPaginas);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchObras();
  }, [paginaActual, busqueda, token]);

  const handlePageChange = (event, value) => {
    setPaginaActual(value);
  };

  const handleSearchChange = (event) => {
    setBusqueda(event.target.value);
    setPaginaActual(1); // Reset page on new search
  };

  const handleOpenEditModal = (obra) => {
    setObraEnEdicion(obra);
  };

  const handleCloseEditModal = () => {
    setObraEnEdicion(null);
  };

  const handleObraActualizada = (obraActualizada) => {
    setObras(obras.map(o => o.id === obraActualizada.id ? obraActualizada : o));
  };

  const handleOpenDeleteModal = (obra) => {
    setObraAEliminar(obra);
  };

  const handleCloseDeleteModal = () => {
    setObraAEliminar(null);
  };

  const handleConfirmDelete = async () => {
    if (!obraAEliminar) return;
    try {
      await fetch(`${API_URL}/api/obras/${obraAEliminar.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setObras(obras.filter(o => o.id !== obraAEliminar.id));
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error al eliminar la obra:", error);
      alert("No se pudo eliminar la obra.");
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <TextField
          label="Buscar por título, autor o N° de registro"
          variant="outlined"
          value={busqueda}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, minWidth: '300px' }}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
        />
        {user && (user.rol === 'admin' || user.rol === 'editor') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/crear')}>
            Añadir Obra
          </Button>
        )}
      </Box>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Grid container spacing={3}>
          {obras.map(obra => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={obra.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea component={RouterLink} to={`/obra/${obra.id}`} sx={{ flexGrow: 1 }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 200,
                      backgroundColor: '#f0f0f0',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      backgroundImage: `url(${obra.url_imagen ? `${API_URL}/${obra.url_imagen}` : ''})`,
                    }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div" noWrap>{obra.titulo}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{obra.autor_nombre}</Typography>
                  </CardContent>
                </CardActionArea>
                {user && (user.rol === 'admin' || user.rol === 'editor') && (
                  <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-around' }}>
                    <Button size="small" onClick={() => handleOpenEditModal(obra)}>Editar</Button>
                    <Button size="small" color="error" onClick={() => handleOpenDeleteModal(obra)}>Eliminar</Button>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination count={totalPaginas} page={paginaActual} onChange={handlePageChange} color="primary" />
      </Box>

      {obraEnEdicion && (
        <ModalEditar
          open={!!obraEnEdicion}
          onClose={handleCloseEditModal}
          obra={obraEnEdicion}
          onObraActualizada={handleObraActualizada}
        />
      )}

      {obraAEliminar && (
        <ConfirmDeleteModal
          open={!!obraAEliminar}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que quieres eliminar la obra "${obraAEliminar.titulo}"? Esta acción no se puede deshacer.`}
        />
      )}
    </Box>
  );
}

export default Catalogo;