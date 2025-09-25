import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Chip, CssBaseline, Container } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BackupIcon from '@mui/icons-material/Backup';
import HistoryIcon from '@mui/icons-material/History';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AuthContext from '../context/AuthContext';



const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenuItems = (
    <>
      <MenuItem onClick={() => { navigate('/admin/usuarios'); handleClose(); }}>
        <AdminPanelSettingsIcon sx={{ mr: 1 }} /> Usuarios
      </MenuItem>
      <MenuItem onClick={() => { navigate('/admin/backups'); handleClose(); }}>
        <BackupIcon sx={{ mr: 1 }} /> Backups
      </MenuItem>
      <MenuItem onClick={() => { navigate('/historial'); handleClose(); }}>
        <HistoryIcon sx={{ mr: 1 }} /> Historial
      </MenuItem>
      <MenuItem onClick={() => { navigate('/ranking'); handleClose(); }}>
        <EmojiEventsIcon sx={{ mr: 1 }} /> Ranking
      </MenuItem>
      <MenuItem onClick={() => { navigate('/admin/ubicaciones'); handleClose(); }}>
        <LocationOnIcon sx={{ mr: 1 }} /> Ubicaciones
      </MenuItem>
    </>
  );

  return (
    <>
      <CssBaseline />
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
            Colección de Arte
          </Typography>

          {/* Desktop Menu */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            <Button component={RouterLink} to="/dashboard" color="inherit" startIcon={<DashboardIcon />}>
              Dashboard
            </Button>
            {user && user.rol === 'admin' && (
              <>
                <Button component={RouterLink} to="/admin/usuarios" color="inherit" startIcon={<AdminPanelSettingsIcon />}>Usuarios</Button>
                <Button component={RouterLink} to="/admin/backups" color="inherit" startIcon={<BackupIcon />}>Backups</Button>
                <Button component={RouterLink} to="/historial" color="inherit" startIcon={<HistoryIcon />}>Historial</Button>
                <Button component={RouterLink} to="/ranking" color="inherit" startIcon={<EmojiEventsIcon />}>Ranking</Button>
                <Button component={RouterLink} to="/admin/ubicaciones" color="inherit" startIcon={<LocationOnIcon />}>Ubicaciones</Button>
              </>
            )}
            <Chip icon={<EmojiEventsIcon />} label={`${user?.puntos || 0} Puntos`} color="primary" variant="outlined" />
            <Typography variant="subtitle1">{user?.email}</Typography>
            <Button variant="outlined" color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>Cerrar Sesión</Button>
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              edge="end"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
                <DashboardIcon sx={{ mr: 1 }} /> Dashboard
              </MenuItem>
              {user && user.rol === 'admin' && adminMenuItems}
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} /> Cerrar Sesión
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <main>{children}</main>
      </Container>
    </>
  );
};

export default Layout;
