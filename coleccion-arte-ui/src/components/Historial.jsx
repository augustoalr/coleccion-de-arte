import React, { useState, useEffect, useContext } from 'react';
import { Paper, Typography, CircularProgress, Box, Pagination, Stack, Button, Card, CardContent, Collapse, IconButton, useTheme, Grid, Divider } from '@mui/material';
import { TimelineDot } from '@mui/lab';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- Iconos para Acciones ---
import CreateIcon from '@mui/icons-material/AddCircleOutline';
import UpdateIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LoginIcon from '@mui/icons-material/Login';
import MoveDownIcon from '@mui/icons-material/MoveDown';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const actionIcons = {
  'CREACIÓN DE OBRA': { icon: <CreateIcon />, color: 'success' },
  'EDICIÓN DE OBRA': { icon: <UpdateIcon />, color: 'primary' },
  'ELIMINACIÓN DE OBRA': { icon: <DeleteIcon />, color: 'error' },
  'REGISTRO DE MOVIMIENTO': { icon: <MoveDownIcon />, color: 'info' },
  'REGISTRO DE CONSERVACIÓN': { icon: <HealthAndSafetyIcon />, color: 'warning' },
  'LOGIN': { icon: <LoginIcon />, color: 'info' },
  'CAMBIO DE ROL': { icon: <AdminPanelSettingsIcon />, color: 'secondary' },
  'CREACIÓN DE USUARIO': { icon: <PersonAddIcon />, color: 'success' },
  'ELIMINACIÓN DE USUARIO': { icon: <PersonRemoveIcon />, color: 'error' },
};

// --- Componente de Ayuda para Filas de Detalles ---
const DetailRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: { xs: 90, sm: 120 }, flexShrink: 0, color: 'text.secondary' }}>
            {label}:
        </Typography>
        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{value}</Typography>
    </Box>
);

// --- Componente para renderizar los detalles de forma inteligente ---
const DetalleItem = ({ item }) => {
    let detalles;
    try {
        detalles = typeof item.detalles === 'string' ? JSON.parse(item.detalles) : item.detalles;
    } catch {
        return <Typography variant="body2">{item.detalles}</Typography>;
    }

    const action = item.accion.toUpperCase();

    if (action === 'EDICIÓN DE OBRA') {
        return (
            <Stack spacing={2}>
                <DetailRow label="Obra" value={detalles.titulo} />
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Campos Modificados:</Typography>
                    <Stack spacing={1.5} sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                        {Array.isArray(detalles.cambios) && detalles.cambios.length > 0 ? (
                            detalles.cambios.map((cambio, index) => (
                                <Box key={index}>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{cambio.campo}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>"{cambio.anterior}"</Typography>
                                        <ArrowForwardIcon fontSize="small" color="primary" />
                                        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'medium' }}>"{cambio.nuevo}"</Typography>
                                    </Box>
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>No se registraron cambios específicos.</Typography>
                        )}
                    </Stack>
                </Box>
            </Stack>
        );
    }
    
    if (action === 'CREACIÓN DE OBRA' || action === 'ELIMINACIÓN DE OBRA') {
        return (
            <Stack spacing={1}>
                <DetailRow label="N° Registro" value={detalles.numero_registro} />
                <DetailRow label="Autor" value={detalles.autor_nombre} />
                <DetailRow label="Título" value={detalles.titulo} />
                
            </Stack>
        );
    }

    if (action === 'REGISTRO DE CONSERVACIÓN') {
        return (
            <Stack spacing={1}>
                <DetailRow label="Obra (N° Reg.)" value={detalles.numero_registro} />
                <DetailRow label="Diagnóstico" value={detalles.diagnostico} />
            </Stack>
        );
    }

    if (action === 'REGISTRO DE MOVIMIENTO') {
        return (
            <Stack spacing={1}>
                <DetailRow label="Obra (N° Reg.)" value={detalles.numero_registro} />
                <DetailRow label="Descripción" value={detalles.descripcion} />

            </Stack>
        );
    }

    if (detalles && Object.keys(detalles).length > 0) {
        return (
            <Stack spacing={1}>
                {Object.entries(detalles).map(([key, value]) => (
                    <DetailRow key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={String(value)} />
                ))}
            </Stack>
        );
    }

    return <Typography variant="body2" sx={{ fontStyle: 'italic' }}>No hay detalles adicionales para esta acción.</Typography>;
};


import API_URL from '../apiConfig';

const Historial = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchHistorial = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/historial?page=${page}&limit=15`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            logout();
            navigate('/login');
          }
          throw new Error('No se pudo obtener el historial');
        }
        const data = await response.json();
        setHistorial(data.historial);
        setTotalPages(data.totalPages);
        setSelectedItem(null); // Resetea la selección al cambiar de página
      } catch (error) {
        console.error("Error al obtener el historial:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [page, token, logout, navigate]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleItemClick = (item) => {
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Paper sx={{ p: 3, overflow: 'hidden', backgroundColor: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4" component="h1">
                Historial de Cambios
            </Typography>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
                Volver al Catálogo
            </Button>
        </Box>

      {/* Línea de Tiempo Horizontal */}
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <Paper elevation={2} sx={{ display: 'inline-flex', alignItems: 'center', p: 2, borderRadius: 4, overflowX: 'auto', '&::-webkit-scrollbar': { height: 8 }, '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 4 } }}>
            {historial.map((item, index) => {
                const { icon, color } = actionIcons[item.accion.toUpperCase()] || { icon: <UpdateIcon />, color: 'grey' };
                const isSelected = selectedItem?.id === item.id;

                return (
                    <React.Fragment key={item.id}>
                        <Box
                            onClick={() => handleItemClick(item)}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: 'pointer',
                                p: 2,
                                minWidth: 120,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: isSelected ? (color === 'grey' ? theme.palette.grey[400] : theme.palette[color].main) : 'transparent',
                                backgroundColor: isSelected ? theme.palette.action.hover : 'transparent',
                                transform: isSelected ? 'translateY(-5px)' : 'none',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    backgroundColor: theme.palette.action.hover,
                                    transform: 'translateY(-5px)',
                                }
                            }}
                        >
                            <TimelineDot
                                color={color}
                                variant={isSelected ? 'filled' : 'outlined'}
                                sx={{
                                    m: 0,
                                    boxShadow: isSelected ? `0 0 12px 2px ${color === 'grey' ? theme.palette.grey[500] : theme.palette[color].main}` : 'none',
                                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                                    transition: 'all 0.3s ease-in-out',
                                }}
                            >
                                {icon}
                            </TimelineDot>
                            <Typography variant="caption" sx={{ mt: 1, fontWeight: 'bold', whiteSpace: 'nowrap', textAlign: 'center' }}>
                                {item.accion}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {new Date(item.fecha).toLocaleDateString()}
                            </Typography>
                        </Box>
                        {index < historial.length - 1 && (
                            <Box sx={{ height: '2px', width: { xs: 40, sm: 60 }, backgroundColor: 'divider' }} />
                        )}
                    </React.Fragment>
                );
            })}
        </Paper>
      </Box>

      {/* Sección de Detalles */}
      <Collapse in={selectedItem !== null} timeout="auto" unmountOnExit>
        <Card variant="outlined" sx={{ mt: 2, position: 'relative', borderColor: 'primary.main', boxShadow: 3, p: { xs: 1, sm: 2 } }}>
            <IconButton
                aria-label="close"
                onClick={() => setSelectedItem(null)}
                sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
            >
                <CloseIcon />
            </IconButton>
            <CardContent>
                {selectedItem && (
                    <>
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                            <Typography variant="h5" component="div" gutterBottom>
                                {selectedItem.accion}
                            </Typography>
                        </Box>
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                            <Grid item xs={12} md={6}>
                                <DetailRow label="Usuario" value={selectedItem.email} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <DetailRow label="Fecha" value={new Date(selectedItem.fecha).toLocaleString()} />
                            </Grid>
                        </Grid>
                        <Divider sx={{ my: 2 }}>
                            <Typography variant="overline">Detalles de la Acción</Typography>
                        </Divider>
                        <Box sx={{ mt: 2 }}>
                            <DetalleItem item={selectedItem} />
                        </Box>
                    </>
                )}
            </CardContent>
        </Card>
      </Collapse>

      {/* Paginación */}
      {historial.length > 0 && (
        <Stack spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        </Stack>
      )}
    </Paper>
  );
};

export default Historial;