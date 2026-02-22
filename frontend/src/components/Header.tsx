import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '@hooks/useAuth';

interface HeaderProps {
  onMenuClick?: () => void;
  emergencyCount?: number;
}

/**
 * Header component with user info, notifications, and logout
 * 
 * @param onMenuClick - Function to call when menu button is clicked (for mobile)
 * @param emergencyCount - Number of active emergencies to show in badge
 */
const Header: React.FC<HeaderProps> = ({ onMenuClick, emergencyCount = 0 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  const handleNotificationsClick = () => {
    // Navigate to emergencies page
    window.location.href = '/emergencies';
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, md: 64 } }}>
        {/* Menu button for mobile */}
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open menu"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo/App Name */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Box
            component="span"
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
            }}
          />
          MaatriSahayak
          <Typography
            variant="caption"
            sx={{
              ml: 1,
              color: 'text.secondary',
              fontWeight: 400,
              display: { xs: 'none', sm: 'inline' },
            }}
          >
            Dashboard
          </Typography>
        </Typography>

        {/* Notifications */}
        <Tooltip title="Emergency Alerts">
          <IconButton
            color="inherit"
            onClick={handleNotificationsClick}
            sx={{ mr: 1 }}
          >
            <Badge
              badgeContent={emergencyCount}
              color="error"
              max={99}
              invisible={emergencyCount === 0}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              display: { xs: 'none', md: 'block' },
              color: 'text.secondary',
            }}
          >
            {user?.name || 'User'}
          </Typography>
          
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{ ml: 1 }}
              aria-controls={anchorEl ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={anchorEl ? 'true' : undefined}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {userInitials}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
              mt: 1.5,
              minWidth: 200,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem disabled>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" fontWeight={600}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || 'user@example.com'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role === 'district_officer' ? 'District Officer' : 
                 user?.role === 'asha_worker' ? 'ASHA Worker' : 'Administrator'}
              </Typography>
            </Box>
          </MenuItem>
          
          <MenuItem onClick={handleMenuClose}>
            <AccountCircleIcon fontSize="small" sx={{ mr: 2 }} />
            My Profile
          </MenuItem>
          
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <LogoutIcon fontSize="small" sx={{ mr: 2 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;