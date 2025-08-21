import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Paper,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Dashboard,
  People,
  Public,
  Description,
  Business,
  Assessment,
  Settings,
  Menu as MenuIcon,
  Search,
  Notifications,
  AccountCircle,
  DarkMode,
  LightMode
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme as useCustomTheme } from '../../App'; // Custom theme hook import edildi
import { useTheme } from '@mui/material/styles'; // Material-UI theme hook

const drawerWidth = 260;

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Theme hooks
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const muiTheme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/', badge: null },
    { text: 'Müşteriler', icon: <People />, path: '/customers', badge: 45 },
    { text: 'Ülkeler', icon: <Public />, path: '/countries', badge: 12 },
    { text: 'Vize Türleri', icon: <Description />, path: '/visa-types', badge: 5 },
    { text: 'Ofisler', icon: <Business />, path: '/offices', badge: 3 },
    { text: 'Raporlar', icon: <Assessment />, path: '/reports', badge: null },
    { text: 'Ayarlar', icon: <Settings />, path: '/settings', badge: null },
  ];

  const drawer = (
    <div>
      {/* Logo ve Başlık */}
      <Toolbar 
        sx={{ 
          backgroundColor: isDarkMode ? '#334155' : '#2563eb', 
          color: 'white',
          borderBottom: isDarkMode ? '1px solid #475569' : 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            ✈️ VizeYönetim
          </Typography>
        </Box>
      </Toolbar>
      
      {/* Menu Items */}
      <List>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              cursor: 'pointer',
              color: isDarkMode ? '#f1f5f9' : '#374151',
              borderRadius: '8px',
              margin: '2px 8px',
              '&.Mui-selected': {
                backgroundColor: isDarkMode ? '#334155' : '#eff6ff',
                '& .MuiListItemIcon-root': {
                  color: isDarkMode ? '#3b82f6' : '#2563eb',
                },
                '& .MuiListItemText-primary': {
                  color: isDarkMode ? '#3b82f6' : '#2563eb',
                  fontWeight: 'bold',
                },
              },
              '&:hover': {
                backgroundColor: isDarkMode ? '#2d3748' : '#f3f4f6',
              },
            }}
          >
            <ListItemIcon sx={{ color: isDarkMode ? '#cbd5e1' : '#6b7280' }}>
              {item.badge ? (
                <Badge 
                  badgeContent={item.badge} 
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb',
                      color: 'white',
                    }
                  }}
                >
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ borderColor: isDarkMode ? '#475569' : '#e5e7eb', mx: 2 }} />
      
      {/* İstatistik Kutusu */}
      <Box sx={{ p: 2, mt: 2 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
            border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
            borderRadius: '12px',
          }}
        >
          <Typography 
            variant="subtitle2" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              color: isDarkMode ? '#3b82f6' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            📊 Hızlı İstatistikler
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: isDarkMode ? '#f1f5f9' : '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <span>👥</span> 45 Aktif Müşteri
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: isDarkMode ? '#f59e0b' : '#d97706',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <span>🔥</span> 8 Acil İşlem
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: isDarkMode ? '#22c55e' : '#059669',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <span>✅</span> 12 Tamamlanan
            </Typography>
            <Typography 
              variant="body2"
              sx={{ 
                color: isDarkMode ? '#06b6d4' : '#0891b2',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <span>⏳</span> 5 Bekleyen
            </Typography>
          </Box>
        </Paper>
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: isDarkMode ? '#1e293b' : '#2563eb',
          borderBottom: isDarkMode ? '1px solid #334155' : 'none',
          boxShadow: isDarkMode ? '0 1px 3px 0 rgb(0 0 0 / 0.3)' : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600, fontSize: '1.1rem' }}>
            🌍 Vize Yönetim Sistemi
          </Typography>
          
          {/* Tema Değiştirme Butonu */}
          <Tooltip title={isDarkMode ? "Açık Tema" : "Koyu Tema"}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {isDarkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
          
          <IconButton color="inherit">
            <Search />
          </IconButton>
          
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          
          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                backgroundColor: isDarkMode ? '#3b82f6' : '#0891b2',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              A
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                color: isDarkMode ? '#f1f5f9' : 'inherit',
                border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
                borderRadius: '12px',
                mt: 1,
                minWidth: '200px',
              }
            }}
          >
            <MenuItem 
              onClick={handleMenuClose}
              sx={{ 
                color: isDarkMode ? '#f1f5f9' : 'inherit',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: isDarkMode ? '#334155' : '#f3f4f6',
                }
              }}
            >
              👤 Profil
            </MenuItem>
            <MenuItem 
              onClick={handleMenuClose}
              sx={{ 
                color: isDarkMode ? '#ffffff' : 'inherit',
                '&:hover': {
                  backgroundColor: isDarkMode ? '#404040' : '#f5f5f5',
                }
              }}
            >
              ⚙️ Ayarlar
            </MenuItem>
            <Divider sx={{ borderColor: isDarkMode ? '#334155' : '#e5e7eb' }} />
            <MenuItem 
              onClick={handleMenuClose}
              sx={{ 
                color: isDarkMode ? '#ffffff' : 'inherit',
                '&:hover': {
                  backgroundColor: isDarkMode ? '#404040' : '#f5f5f5',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isDarkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                <FormControlLabel
                  control={
                    <Switch
                      checked={isDarkMode}
                      onChange={toggleTheme}
                      size="small"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#3b82f6',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#3b82f6',
                        },
                      }}
                    />
                  }
                  label={isDarkMode ? "Açık Tema" : "Koyu Tema"}
                  sx={{ 
                    m: 0,
                    '& .MuiFormControlLabel-label': {
                      fontSize: '0.875rem',
                      color: isDarkMode ? '#f1f5f9' : 'inherit',
                    }
                  }}
                />
              </Box>
            </MenuItem>
            <Divider sx={{ borderColor: isDarkMode ? '#334155' : '#e5e7eb' }} />
            <MenuItem 
              onClick={handleMenuClose}
              sx={{ 
                color: '#f44336',
                '&:hover': {
                  backgroundColor: isDarkMode ? '#404040' : '#f5f5f5',
                }
              }}
            >
              🚪 Çıkış
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              borderRight: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              borderRight: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
          minHeight: '100vh',
          color: isDarkMode ? '#f1f5f9' : '#1f2937',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;