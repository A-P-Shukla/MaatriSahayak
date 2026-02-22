import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Badge,
  useTheme,
  useMediaQuery,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  PregnantWoman as PregnancyIcon,
  Warning as EmergencyIcon,
  LocationOn as TrackingIcon,
  Analytics as AnalyticsIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  emergencyCount?: number;
}

/**
 * Sidebar component for navigation
 * 
 * @param open - Whether the sidebar is open
 * @param onClose - Function to call when sidebar should close (mobile)
 * @param emergencyCount - Number of active emergencies to show in badge
 */
const Sidebar: React.FC<SidebarProps> = ({ open, onClose, emergencyCount = 0 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const drawerWidth = 280;

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      badge: 0,
    },
    {
      text: 'Pregnancies',
      icon: <PregnancyIcon />,
      path: '/pregnancies',
      badge: 0,
    },
    {
      text: 'Emergency Alerts',
      icon: <EmergencyIcon />,
      path: '/emergencies',
      badge: emergencyCount,
    },
    {
      text: 'Live Tracking',
      icon: <TrackingIcon />,
      path: '/tracking',
      badge: 0,
    },
    {
      text: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/analytics',
      badge: 0,
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            backgroundColor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <HomeIcon />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            MaatriSahayak
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Maternal Health Dashboard
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flexGrow: 1, p: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: '12px',
                '&.Mui-selected': {
                  backgroundColor: 'primary.50',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.100',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.badge > 0 ? (
                  <Badge
                    badgeContent={item.badge}
                    color="error"
                    max={99}
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.6rem',
                        height: 16,
                        minWidth: 16,
                      },
                    }}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 600 : 400,
                  fontSize: '0.95rem',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Footer/Status */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            backgroundColor: 'grey.50',
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block">
            Active Emergencies
          </Typography>
          <Typography
            variant="h4"
            fontWeight={700}
            color={emergencyCount > 0 ? 'error.main' : 'success.main'}
          >
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
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? open : true}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            ...(isMobile && {
              top: 64, // Height of the header
              height: 'calc(100% - 64px)',
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;