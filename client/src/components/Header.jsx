import React, { useContext, useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Box, Menu, MenuItem, IconButton, Avatar, Tooltip, Divider, Badge } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './notifications/NotificationBell';

import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import EventIcon from '@mui/icons-material/Event';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupIcon from '@mui/icons-material/Group';

// --- MAIN HEADER COMPONENT ---
function Header() {
  const { user, logout, unreadConversations } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

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
      <MenuItem onClick={handleProfile}><PersonIcon sx={{ mr: 1.5 }}/> My Profile</MenuItem>
      <MenuItem component={Link} to="/settings" onClick={handleMenuClose}><SettingsIcon sx={{ mr: 1.5 }}/> Settings</MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}><LogoutIcon sx={{ mr: 1.5 }}/> Logout</MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          bgcolor: scrolled ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          boxShadow: scrolled ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
          color: 'black',
          transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        }}
        elevation={0}
      >
        <Toolbar>
          <Typography variant="h5" noWrap component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
            Novelfinity
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
              {/* Desktop-only icons */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                <Tooltip title="Create Post"><motion.div whileTap={{ scale: 0.9 }}><IconButton component={Link} to="/create-post" color="inherit"><AddCircleOutlineIcon /></IconButton></motion.div></Tooltip>
                <Tooltip title="Schedule"><motion.div whileTap={{ scale: 0.9 }}><IconButton component={Link} to="/schedule" color="inherit"><EventIcon /></IconButton></motion.div></Tooltip>
                <Tooltip title="Chat">
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <IconButton component={Link} to="/chat" color="inherit">
                      <Badge color="error" variant="dot" invisible={unreadConversations.size === 0}>
                        <ChatBubbleOutlineIcon />
                      </Badge>
                    </IconButton>
                  </motion.div>
                </Tooltip>
                <Tooltip title="Search Novels"><motion.div whileTap={{ scale: 0.9 }}><IconButton component={Link} to="/search" color="inherit"><MenuBookIcon /></IconButton></motion.div></Tooltip>
                <Tooltip title="Book Clubs"><motion.div whileTap={{ scale: 0.9 }}><IconButton component={Link} to="/bookclubs" color="inherit"><GroupIcon /></IconButton></motion.div></Tooltip>
              </Box>
              
              {/* Icons for all screen sizes */}
              <Tooltip title="Search Users"><motion.div whileTap={{ scale: 0.9 }}><IconButton component={Link} to="/search/users" color="inherit"><SearchIcon /></IconButton></motion.div></Tooltip>
              <NotificationBell />
              <Tooltip title="Account settings">
                <motion.div whileTap={{ scale: 0.9 }}>
                  <IconButton onClick={handleProfileMenuOpen} color="inherit">
                    <Avatar sx={{ width: 32, height: 32 }} src={user.profilePicture} />
                  </IconButton>
                </motion.div>
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
