import React, { useState, useEffect, useContext } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Avatar } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import InventoryIcon from '@mui/icons-material/Inventory';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StoreIcon from '@mui/icons-material/Store';
import BuildIcon from '@mui/icons-material/Build';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AuthContext from '../context/AuthContext';
import API_URL from '../apiConfig';

const StatCard = ({ title, value, color, icon }) => (
  <Paper
    elevation={3}
    sx={{
      p: 3,
      backgroundColor: 'white',
      color: 'black',
      height: 140,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRadius: 3,
      border: '1px solid #e0e0e0',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: color,
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{title}</Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, color: '#333' }}>{value}</Typography>
      </Box>
      <Avatar sx={{ bgcolor: '#e3f2fd', width: 56, height: 56, borderRadius: 2 }}>
        {icon}
      </Avatar>
    </Box>
  </Paper>
);

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const statsResponse = await fetch(`${API_URL}/api/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!statsResponse.ok) throw new Error('No se pudieron cargar las estadísticas.');
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Try to fetch categories, but don't fail if not available
        try {
          const categoriesResponse = await fetch(`${API_URL}/api/dashboard/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (categoriesResponse.ok) {
            const categoriesData = await categoriesResponse.json();
            setCategories(categoriesData);
          } else {
            setCategories([]); // Default to empty if not available
          }
        } catch {
          setCategories([]); // Default to empty if fetch fails
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const chartData = stats ? [
    { name: 'Depósito', cantidad: stats.enDeposito },
    { name: 'Exhibición', cantidad: stats.enExhibicion },
    { name: 'Restauración', cantidad: stats.enRestauracion },
    { name: 'Otro', cantidad: stats.enOtro },
  ] : [];

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ bgcolor: '#f5f9ff', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, color: '#1976d2', fontWeight: 600 }}>Bienvenido {user?.email}</Typography>

      {/* Main Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total de Obras"
            value={stats?.totalObras || 0}
            color="#1976d2"
            icon={<InventoryIcon sx={{ color: '#1976d2', fontSize: 28 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="En Exhibición"
            value={stats?.enExhibicion || 0}
            color="#f57c00"
            icon={<VisibilityIcon sx={{ color: '#f57c00', fontSize: 28 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="En Depósito"
            value={stats?.enDeposito || 0}
            color="#388e3c"
            icon={<StoreIcon sx={{ color: '#388e3c', fontSize: 28 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="En Restauración"
            value={stats?.enRestauracion || 0}
            color="#d32f2f"
            icon={<BuildIcon sx={{ color: '#d32f2f', fontSize: 28 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Otros"
            value={stats?.enOtro || 0}
            color="#9c27b0"
            icon={<MoreHorizIcon sx={{ color: '#9c27b0', fontSize: 28 }} />}
          />
        </Grid>
      </Grid>

      {/* Bottom Section */}
      <Grid container spacing={3}>
        {/* Chart on the left */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'white',
              border: '1px solid #e0e0e0'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333', mb: 3 }}>
              Distribución de Obras por Estado
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#666' }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#666' }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar
                  dataKey="cantidad"
                  fill="#1976d2"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Categories on the right */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'white',
              border: '1px solid #e0e0e0',
              height: 'fit-content'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#333', mb: 3 }}>
              Obras por Categoría
            </Typography>
            <List sx={{ p: 0 }}>
              {categories.length > 0 ? categories.map((cat, index) => (
                <ListItem
                  key={index}
                  sx={{
                    bgcolor: index % 2 === 0 ? '#f8f9fa' : 'white',
                    borderRadius: 2,
                    mb: 1,
                    border: '1px solid #f0f0f0',
                    '&:hover': {
                      bgcolor: '#e3f2fd',
                      transition: 'background-color 0.2s ease'
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#333' }}>
                          {cat.nombre}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: '#1976d2',
                            bgcolor: '#e3f2fd',
                            px: 2,
                            py: 0.5,
                            borderRadius: 2,
                            minWidth: 50,
                            textAlign: 'center'
                          }}
                        >
                          {cat.cantidad}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              )) : (
                <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', py: 4 }}>
                  No hay categorías disponibles
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;