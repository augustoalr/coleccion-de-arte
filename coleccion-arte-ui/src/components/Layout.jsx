import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { 
    AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Chip, CssBaseline, Container, 
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, useTheme 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BackupIcon from '@mui/icons-material/Backup';
import HistoryIcon from '@mui/icons-material/History';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArtTrackIcon from '@mui/icons-material/ArtTrack'; // Icono para el logo
import AuthContext from '../context/AuthContext';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Inventario', icon: <ArtTrackIcon />, path: '/' },
    { text: 'Formulario', icon: <ArtTrackIcon />, path: '/formulario' },
  ];

  const adminMenuItems = [
    { text: 'Usuarios', icon: <AdminPanelSettingsIcon />, path: '/admin/usuarios' },
    { text: 'Backups', icon: <BackupIcon />, path: '/admin/backups' },
    { text: 'Historial', icon: <HistoryIcon />, path: '/historial' },
    { text: 'Ubicaciones', icon: <LocationOnIcon />, path: '/admin/ubicaciones' },
    { text: 'Ranking', icon: <EmojiEventsIcon />, path: '/ranking' },
  ];

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
        <ArtTrackIcon sx={{ color: 'white', mr: 1, fontSize: '2rem' }} />
        <Typography variant="h6" noWrap component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
          Colección de Arte
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={RouterLink} 
              to={item.path} 
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                },
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        {user && user.rol === 'admin' && adminMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={RouterLink} 
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                },
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
      <Box sx={{ p: 2 }}>
        <Chip 
          icon={<EmojiEventsIcon />} 
          label={`${user?.puntos || 0} Puntos`} 
          sx={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)', mb: 1, width: '100%' }}
          variant="outlined" 
        />
        <Typography variant="subtitle2" sx={{ color: 'white', textAlign: 'center' }}>{user?.email}</Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<LogoutIcon />} 
          onClick={handleLogout} 
          fullWidth 
          sx={{ mt: 1 }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ 
          width: { md: `calc(100% - ${drawerWidth}px)` }, 
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'black'
        }}
        elevation={1}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {/* Aquí podría ir el título de la página actual si se desea */}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Drawer para móvil */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ 
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#1E1E1E' }
          }}
        >
          {drawerContent}
        </Drawer>
        {/* Drawer para desktop */}
        <Drawer
          variant="permanent"
          sx={{ 
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#1E1E1E', borderRight: 'none' }
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;