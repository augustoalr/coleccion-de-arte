import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Divider, Grid, CircularProgress, Alert,
  Card, CardContent, CardMedia, Tabs, Tab, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IosShareIcon from '@mui/icons-material/IosShare';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CategoryIcon from '@mui/icons-material/Category';
import PaletteIcon from '@mui/icons-material/Palette';
import StraightenIcon from '@mui/icons-material/Straighten';
import SecurityUpdateGoodIcon from '@mui/icons-material/SecurityUpdateGood';
import PlaceIcon from '@mui/icons-material/Place';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonIcon from '@mui/icons-material/Person';

import GestionMovimientos from './GestionMovimientos';
import GestionConservacion from './GestionConservacion';
import ModalExportacion from './ModalExportacion';
import { AuthContext } from '../context/AuthContext';

const formatText = (text, maxLength = 23) => {
  if (!text || text.length <= maxLength) {
    return text;
  }

  const lines = [];
  let currentText = text;

  while (currentText.length > maxLength) {
    let breakPos = currentText.lastIndexOf(' ', maxLength);
    if (breakPos <= 0) { // Si no hay espacios, corta la palabra
      breakPos = maxLength;
    }
    lines.push(currentText.substring(0, breakPos));
    currentText = currentText.substring(breakPos).trim();
  }

  lines.push(currentText);
  return lines.join('\n');
};


// SOLUCIÓN FINAL: Se aplica overflowWrap: 'anywhere' para el manejo de texto más agresivo.
const DetailItem = ({ icon, label, value, isCurrency = false, currencyCode = 'USD' }) => {
  const formatValue = () => {
    if (value === null || typeof value === 'undefined' || value === '') return 'N/A';
    if (isCurrency) {
      return parseFloat(value).toLocaleString(currencyCode === 'USD' ? 'en-US' : 'es-VE', {
        style: 'currency',
        currency: currencyCode,
      });
    }
    return value;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
      {icon && React.cloneElement(icon, { sx: { mr: 1.5, color: 'text.secondary', mt: 0.5 } })}
      <Typography variant="body1" sx={{ overflowWrap: 'anywhere' }}>
        <Typography component="span" sx={{ fontWeight: 'bold' }}>{label}:</Typography> {formatValue()}
      </Typography>
    </Box>
  );
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function ObraDetalle() {
  const [obra, setObra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalExportOpen, setModalExportOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { id } = useParams();
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Autenticación requerida.");
      return;
    }
import API_URL from '../apiConfig';
// ... (resto de los imports)

// ... (código del componente)

      fetch(`${API_URL}/api/obras/${id}`, {
// ... (resto del código)

    <Box sx={{ 
      // ... (estilos)
      backgroundImage: `url(${obra.url_imagen ? `${API_URL}/${obra.url_imagen}` : 'https://via.placeholder.com/400'})`,
      // ... (resto de los estilos)
    }} />

// ... (resto del código)
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo obtener la información de la obra.');
        return res.json();
      })
      .then(data => {
        setObra(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching obra:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id, token]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const getChipColor = (estado) => {
    switch (estado) {
      case 'En exhibición': return 'success';
      case 'Otro': return 'error';
      case 'En restauración': return 'warning';
      case 'En depósito': return 'primary';
      default: return 'default';
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  if (!obra) return <Typography sx={{ mt: 4, textAlign: 'center' }}>No se encontró la obra.</Typography>;

  return (
    <>
      <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />}>
            Volver al Catálogo
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<IosShareIcon />}
            onClick={() => setModalExportOpen(true)}
          >
            Exportar Ficha
          </Button>
        </Box>

        {/* COLUMNA IZQUIERDA */}
        <Grid container spacing={4} sx={{ alignItems: "flex-start" }}>
          {/* Contenedor izquierdo (imagen y título) */}
          <Grid item xs={12} md={5}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* SOLUCIÓN: La imagen se aplica como fondo a este Box para un control total */}
              <Box
                sx={{
                  // MODIFICACIÓN: Se reduce la altura para un formato más horizontal.
                  height: "280px",
                  width: "100%",
                  backgroundColor: "#f5f5f5",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  mb: 1,
                  // Propiedades de fondo para mostrar la imagen de forma contenida y centrada
                  backgroundImage: `url(${obra.url_imagen ? `http://localhost:4000/${obra.url_imagen}` : 'https://via.placeholder.com/400'})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              />

              {/* Título y autor */}
              <CardContent sx={{ p: 2 }}>
                {/* Título con salto de línea cada 23 caracteres */}
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    wordBreak: "break-word",
                    whiteSpace: "pre-line",
                    overflow: "hidden",
                  }}
                >
                  {formatText(obra.titulo)}
                </Typography>


                {/* Autor (opcional: también puedes limitarlo) */}
                <Typography
                  variant="h6"
                  component="h2"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {obra.autor_nombre || "Autor desconocido"}
                </Typography>

                {/* Chip de estado */}
                <Chip
                  label={obra.estado || "Sin estado"}
                  color={getChipColor(obra.estado)}
                  sx={{
                    mt: 1,
                    ...(obra.estado === "En restauración" && {
                      backgroundColor: "#ffc107",
                      color: "black",
                    }),
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* COLUMNA DERECHA */}
          <Grid item xs={12} md={7} sx={{ maxWidth: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="Detalles de la obra"
              >
                <Tab label="Ficha Técnica" />
                <Tab label="Descripciones" />
                <Tab label="Historia y valor" />
                <Tab
                  label="Biografía del Autor"
                  disabled={!obra.autor_biografia}
                />
              </Tabs>
            </Box>
            <Box
              sx={{
                overflow: "auto",
              }}
            >
              <TabPanel value={tabValue} index={0}>
                <Typography variant="h6" gutterBottom>
                  Ficha técnica
                </Typography>
                <Divider sx={{ my: 2 }} />
                <DetailItem
                  icon={<EventNoteIcon />}
                  label="N° Registro"
                  value={obra.numero_registro}
                />
                <DetailItem
                  icon={<EventNoteIcon />}
                  label="Fecha de Creación"
                  value={obra.fecha_creacion}
                />
                <DetailItem
                  icon={<CategoryIcon />}
                  label="Categoría"
                  value={obra.categoria}
                />
                <DetailItem
                  icon={<PaletteIcon />}
                  label="Técnica y Materiales"
                  value={obra.tecnica_materiales}
                />
                <DetailItem
                  icon={<StraightenIcon />}
                  label="Dimensiones"
                  value={obra.dimensiones}
                />
                <DetailItem
                  icon={<SecurityUpdateGoodIcon />}
                  label="Estado de Conservación"
                  value={obra.estado_conservacion}
                />
                <DetailItem
                  icon={<PlaceIcon />}
                  label="Ubicación Actual"
                  value={obra.ubicacion_nombre}
                />
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>
                  Descripciones
                </Typography>
                <Divider sx={{ my: 2 }} />
                <DetailItem
                  label="Descripción del Montaje"
                  value={obra.descripcion_montaje}
                />
                <DetailItem
                  label="Observaciones Generales"
                  value={obra.observaciones_generales}
                />
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" gutterBottom>
                  Historia y valor
                </Typography>
                <Divider sx={{ my: 2 }} />
                <DetailItem
                  icon={<PersonIcon />}
                  label="Historia de Procedencia"
                  value={obra.propietario_original}
                />
                <DetailItem
                  icon={<EventNoteIcon />}
                  label="Modo de Adquisición"
                  value={obra.procedencia}
                />
                <DetailItem
                  icon={<PersonIcon />}
                  label="Ingreso Aprobado Por"
                  value={obra.ingreso_aprobado_por}
                />
                <DetailItem
                  icon={<MonetizationOnIcon />}
                  label="Valor Inicial"
                  value={obra.valor_inicial}
                  isCurrency
                  currencyCode="VES"
                />
                <DetailItem
                  icon={<MonetizationOnIcon />}
                  label="Valor USD"
                  value={obra.valor_usd}
                  isCurrency
                  currencyCode="USD"
                />
                <DetailItem
                  icon={<EventNoteIcon />}
                  label="Fecha de Avalúo"
                  value={formatDate(obra.fecha_avaluo)}
                />
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Registro
                </Typography>
                <Divider sx={{ my: 2 }} />
                <DetailItem
                  icon={<PersonIcon />}
                  label="Registro Realizado Por"
                  value={obra.registro_realizado_por}
                />
                <DetailItem
                  icon={<PersonIcon />}
                  label="Registro Revisado Por"
                  value={obra.registro_revisado_por}
                />
                <DetailItem
                  icon={<EventNoteIcon />}
                  label="Fecha de Realización"
                  value={formatDate(obra.fecha_realizacion)}
                />
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" gutterBottom>
                  Sobre el Autor
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}
                >
                  {obra.autor_biografia}
                </Typography>
              </TabPanel>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <GestionMovimientos obraId={id} />

      {user && user.rol !== "lector" && <GestionConservacion obraId={id} />}

      {modalExportOpen && (
        <ModalExportacion
          open={modalExportOpen}
          onClose={() => setModalExportOpen(false)}
          ids={[id]}
        />
      )}
    </>
  );
}

export default ObraDetalle;
