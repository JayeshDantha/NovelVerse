import React, { useState, useEffect, useContext } from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, Badge } from '@mui/material';
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
import GroupIcon from '@mui/icons-material/Group';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';

function BottomNav() {
  const { user, unreadConversations } = useContext(AuthContext);
  const location = useLocation();
  const [value, setValue] = useState(0);

  useEffect(() => {
    const path = location.pathname;
    // New Order: Home(0), Schedule(1), Create Post(2), Chat(3), Book Clubs(4), Search Novels(5)
    if (path === '/') setValue(0);
    else if (path.startsWith('/schedule')) setValue(1);
    else if (path === '/create-post') setValue(2);
    else if (path === '/chat') setValue(3);
    else if (path.startsWith('/bookclubs')) setValue(4);
    else if (path.startsWith('/search')) setValue(5);
    else setValue(-1);
  }, [location]);

  if (!user) {
    return null;
  }

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 16, 
        left: '50%', 
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '400px',
        zIndex: 1200, 
        borderRadius: '24px',
        bgcolor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }} 
      elevation={0}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        sx={{
          bgcolor: 'transparent',
          "& .MuiBottomNavigationAction-root": {
            minWidth: 0,
            flex: 1,
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
        }}
      >
        <BottomNavigationAction label="Home" icon={value === 0 ? <HomeIcon /> : <HomeOutlinedIcon />} component={Link} to="/" />
        <BottomNavigationAction label="Schedule" icon={value === 1 ? <EventIcon /> : <EventOutlinedIcon />} component={Link} to="/schedule" />
        <BottomNavigationAction label="Create" icon={value === 2 ? <AddCircleIcon /> : <AddCircleOutlineIcon />} component={Link} to="/create-post" />
        <BottomNavigationAction label="Chat" icon={
          <Badge color="error" variant="dot" invisible={unreadConversations.size === 0}>
            {value === 3 ? <ChatIcon /> : <ChatBubbleOutlineIcon />}
          </Badge>
        } component={Link} to="/chat" />
        <BottomNavigationAction label="Clubs" icon={value === 4 ? <GroupIcon /> : <GroupOutlinedIcon />} component={Link} to="/bookclubs" />
        <BottomNavigationAction label="Novels" icon={value === 5 ? <MenuBookIcon /> : <BookOutlinedIcon />} component={Link} to="/search" />
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNav;
