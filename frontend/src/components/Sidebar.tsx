import React from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Badge, useTheme, useMediaQuery, Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon, PregnantWoman as PregnancyIcon,
  Warning as EmergencyIcon, LocationOn as TrackingIcon,
  Analytics as AnalyticsIcon, People as PeopleIcon,
  DirectionsCar as DriverIcon, LocalHospital as HospitalIcon,
  AccountCircle as ProfileIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  emergencyCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, emergencyCount = 0 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const drawerWidth = 270;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', badge: 0 },
    { text: 'Pregnancies', icon: <PregnancyIcon />, path: '/pregnancies', badge: 0 },
    { text: 'Emergency Alerts', icon: <EmergencyIcon />, path: '/emergencies', badge: emergencyCount },
    { text: 'ASHA Workers', icon: <PeopleIcon />, path: '/asha', badge: 0 },
    { text: 'Drivers', icon: <DriverIcon />, path: '/drivers', badge: 0 },
    { text: 'Live Tracking', icon: <TrackingIcon />, path: '/tracking', badge: 0 },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics', badge: 0 },
    { text: 'Hospitals', icon: <HospitalIcon />, path: '/hospitals', badge: 0 },
    { text: 'My Profile', icon: <ProfileIcon />, path: '/profile', badge: 0 },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const isActive = (path: string) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box component="img" src={logo} alt="logo"
          sx={{ width: 40, height: 40, borderRadius: '10px', objectFit: 'cover' }} />
        <Box>
          <Typography variant="h6" fontWeight={700} color="text.primary">MaatriSahayak</Typography>
          <Typography variant="caption" color="text.secondary">Health Dashboard</Typography>
        </Box>
      </Box>

      <List sx={{ flexGrow: 1, p: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: '10px',
                '&.Mui-selected': {
                  backgroundColor: 'secondary.main',
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'secondary.light' },
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                },
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? 'primary.main' : 'text.secondary' }}>
                {item.badge > 0 ? (
                  <Badge badgeContent={item.badge} color="error" max={99}
                    sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}>
                    {item.icon}
                  </Badge>
                ) : item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text}
                primaryTypographyProps={{ fontWeight: isActive(item.path) ? 600 : 400, fontSize: '0.95rem' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 2, borderRadius: '10px', bgcolor: 'secondary.main', textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" display="block">Active Emergencies</Typography>
          <Typography variant="h4" fontWeight={700} color={emergencyCount > 0 ? 'error.main' : 'success.main'}>
            {emergencyCount}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {emergencyCount === 0 ? 'All clear' : 'Require attention'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? open : true}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
            top: { xs: 0, md: '64px' },
            height: { xs: '100%', md: 'calc(100% - 64px)' },
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
