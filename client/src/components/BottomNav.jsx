import React, { useState, useEffect, useContext } from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EventIcon from '@mui/icons-material/Event';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ChatIcon from '@mui/icons-material/Chat';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';

function BottomNav() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [value, setValue] = useState(0);

  useEffect(() => {
    const path = location.pathname;
    // New Order: Home(0), Schedule(1), Create Post(2), Chat(3), Search Novels(4)
    if (path === '/') setValue(0);
    else if (path.startsWith('/schedule')) setValue(1);
    else if (path === '/create-post') setValue(2);
    else if (path === '/chat') setValue(3);
    else if (path.startsWith('/search')) setValue(4);
    else setValue(-1); 
  }, [location]);

  if (!user) {
    return null;
  }

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200, borderTop: '1px solid #E0E0E0' }} elevation={0}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction label="Home" icon={value === 0 ? <HomeIcon /> : <HomeOutlinedIcon />} component={Link} to="/" />
        <BottomNavigationAction label="Schedule" icon={value === 1 ? <EventIcon /> : <EventOutlinedIcon />} component={Link} to="/schedule" />
        <BottomNavigationAction label="Create" icon={value === 2 ? <AddCircleIcon /> : <AddCircleOutlineIcon />} component={Link} to="/create-post" />
        <BottomNavigationAction label="Chat" icon={value === 3 ? <ChatIcon /> : <ChatBubbleOutlineIcon />} component={Link} to="/chat" />
        <BottomNavigationAction label="Novels" icon={value === 4 ? <MenuBookIcon /> : <BookOutlinedIcon />} component={Link} to="/search" />
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNav;
