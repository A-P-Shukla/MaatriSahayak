import React, { useState } from 'react';
import {
  AppBar, Toolbar, IconButton, Typography, Box,
  Avatar, Menu, MenuItem, Badge, Tooltip, useTheme, useMediaQuery, Divider,
} from '@mui/material';
import { Menu as MenuIcon, Bell, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

interface HeaderProps {
  onMenuClick?: () => void;
  emergencyCount?: number;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, emergencyCount = 0 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Tricolor strip */}
      <Box sx={{ display: 'flex', height: 3 }}>
        <Box sx={{ flex: 1, bgcolor: '#FF9933' }} />
        <Box sx={{ flex: 1, bgcolor: '#FFFFFF' }} />
        <Box sx={{ flex: 1, bgcolor: '#138808' }} />
      </Box>

      <Toolbar sx={{ minHeight: { xs: 56, md: 64 }, px: { xs: 1.5, md: 3 }, gap: 1 }}>
        {/* Hamburger - mobile only */}
        {isMobile && (
          <IconButton edge="start" onClick={onMenuClick} size="small" sx={{ mr: 0.5 }}>
            <MenuIcon size={22} />
          </IconButton>
        )}

        {/* Logo + Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1, minWidth: 0 }}>
          <Box
            component="img"
            src={logo}
            alt="logo"
            sx={{
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
              borderRadius: '10px',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(27,107,74,0.25)',
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              fontWeight={800}
              noWrap
              sx={{
                color: '#1B6B4A',
                lineHeight: 1.15,
                fontSize: { xs: '1.05rem', md: '1.2rem' },
                letterSpacing: '-0.3px',
              }}
            >
              MaatriSahayak
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: '#0d9488', fontSize: '0.65rem', fontWeight: 600, display: { xs: 'none', sm: 'block' }, letterSpacing: '0.3px' }}
            >
              Maternal Health Dashboard
            </Typography>
          </Box>
          <Box sx={{
            ml: 1,
            px: 1.2,
            py: 0.3,
            borderRadius: 10,
            bgcolor: 'secondary.main',
            display: { xs: 'none', lg: 'flex' },
            alignItems: 'center',
            gap: 0.5,
            flexShrink: 0,
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
            <Typography variant="caption" sx={{ color: 'primary.main', fontSize: '0.6rem', fontWeight: 600 }}>
              NHM · Govt. of India
            </Typography>
          </Box>
        </Box>

        {/* Notifications */}
        <Tooltip title="Emergency Alerts">
          <IconButton size="small" onClick={() => navigate('/emergencies')}>
            <Badge badgeContent={emergencyCount} color="error" max={99} invisible={emergencyCount === 0}>
              <Bell size={20} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User name - desktop only */}
        <Typography
          variant="body2"
          noWrap
          sx={{ display: { xs: 'none', md: 'block' }, color: 'text.secondary', maxWidth: 140, ml: 0.5 }}
        >
          {user?.name || 'User'}
        </Typography>

        {/* Avatar */}
        <Tooltip title="Account">
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ ml: 0.5 }}>
            <Avatar sx={{ width: { xs: 30, md: 34 }, height: { xs: 30, md: 34 }, bgcolor: 'primary.main', fontSize: '0.75rem', fontWeight: 700 }}>
              {userInitials}
            </Avatar>
          </IconButton>
        </Tooltip>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          onClick={() => setAnchorEl(null)}
          PaperProps={{ sx: { mt: 1.5, minWidth: 200, borderRadius: 2 } }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" fontWeight={700}>{user?.name || 'User'}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            <Typography variant="caption" color="primary.main" display="block" sx={{ mt: 0.3 }}>
              {user?.role === 'district_officer' ? 'District Officer' : user?.role === 'asha_worker' ? 'ASHA Worker' : 'Administrator'}
            </Typography>
          </Box>
          <Divider />
          <MenuItem sx={{ gap: 1.5, py: 1 }}>
            <UserCircle size={18} color="#1B6B4A" />
            <Typography variant="body2">My Profile</Typography>
          </MenuItem>
          <MenuItem onClick={async () => { await logout(); navigate('/login', { replace: true }); }} sx={{ gap: 1.5, py: 1, color: 'error.main' }}>
            <LogOut size={18} />
            <Typography variant="body2">Logout</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
