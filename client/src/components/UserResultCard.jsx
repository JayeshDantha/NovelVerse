import React from 'react';
import { ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Box, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import VerifiedIcon from '@mui/icons-material/Verified'; // Import the icon

const UserResultCard = ({ user }) => {
  return (
    <ListItem 
      component={Link} 
      to={`/profile/${user.username}`} 
      sx={{ 
        py: 1.5, // Added more vertical padding for a spacious feel
        borderBottom: '1px solid #eee', 
        '&:hover': { backgroundColor: 'action.hover' } 
      }}
    >
      <ListItemAvatar>
        <Avatar src={user.profilePicture} sx={{ width: 44, height: 44 }}>
          {!user.profilePicture && user.username.charAt(0).toUpperCase()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body1" sx={{ fontWeight: '600' }}>
              {user.username}
            </Typography>
            {user.isVerified && (
              <Tooltip title="Verified Account">
                <VerifiedIcon color="primary" sx={{ fontSize: '1.1rem' }} />
              </Tooltip>
            )}
          </Box>
        }
        secondary={
          user.bio && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {user.bio}
            </Typography>
          )
        }
      />
    </ListItem>
  );
};

export default UserResultCard;
