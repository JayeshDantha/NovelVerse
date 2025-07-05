// client/src/components/Header.jsx - MERGED WITH CHAT LINK

import React, { useContext, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AccountCircle from '@mui/icons-material/AccountCircle';

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate(`/profile/${user.username}`);
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          NovelVerse
        </Typography>

        {user ? (
          <>
            <Button component={Link} to="/create-post" color="inherit">Create Post</Button>
            <Button component={Link} to="/search" color="inherit">Search Books</Button>
            <Button component={Link} to="/search/users" color="inherit">Search Users</Button>
            <Button component={Link} to="/schedule" color="inherit">My Schedule</Button>
            
            {/* --- ADDED FOR CHAT --- */}
            <Button component={Link} to="/chat" color="inherit">Chat</Button>
            
            <Button
              color="inherit"
              onClick={handleMenu}
              endIcon={<AccountCircle />}
            >
              {user.username}
            </Button>
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
              open={open}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>My Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Box>
            <Button component={Link} to="/login" color="inherit">Login</Button>
            <Button component={Link} to="/register" color="inherit">Register</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;