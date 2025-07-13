import React, { useContext, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Menu, MenuItem, IconButton, Avatar, Tooltip, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './notifications/NotificationBell';

// --- ICONS ---
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ChatIcon from '@mui/icons-material/Chat';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EventIcon from '@mui/icons-material/Event';
import MenuBookIcon from '@mui/icons-material/MenuBook';

// --- MAIN HEADER COMPONENT ---
function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate(`/profile/${user.username}`);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu anchorEl={anchorEl} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} id={menuId} keepMounted transformOrigin={{ vertical: 'top', horizontal: 'right' }} open={isMenuOpen} onClose={handleMenuClose} sx={{ mt: 1 }}>
      <MenuItem onClick={handleProfile}><AccountCircleIcon sx={{ mr: 1.5 }}/> My Profile</MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}><LogoutIcon sx={{ mr: 1.5 }}/> Logout</MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" color="primary" elevation={1}>
        <Toolbar>
          {/* Brand Name - Always visible */}
          <Typography variant="h6" noWrap component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
            Novelfinity
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Desktop Icons */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                <Tooltip title="Create Post"><IconButton component={Link} to="/create-post" size="large" color="inherit"><AddCircleOutlineIcon /></IconButton></Tooltip>
                <Tooltip title="Schedule"><IconButton component={Link} to="/schedule" size="large" color="inherit"><EventIcon /></IconButton></Tooltip>
                <Tooltip title="Chat"><IconButton component={Link} to="/chat" size="large" color="inherit"><ChatIcon /></IconButton></Tooltip>
                <Tooltip title="Search Novels"><IconButton component={Link} to="/search" size="large" color="inherit"><MenuBookIcon /></IconButton></Tooltip>
              </Box>

              {/* Icons for all screen sizes */}
              <Tooltip title="Search Users">
                <IconButton component={Link} to="/search/users" size="large" color="inherit">
                  <SearchIcon />
                </IconButton>
              </Tooltip>
              <NotificationBell />
              <Tooltip title="Account settings">
                <IconButton size="large" edge="end" onClick={handleProfileMenuOpen} color="inherit">
                  <Avatar sx={{ width: 32, height: 32 }} src={user.profilePicture} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      {renderMenu}
    </Box>
  );
}

export default Header;
