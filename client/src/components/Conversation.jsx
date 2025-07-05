import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, Badge, styled, Tooltip } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified'; // Import the icon
import api from '../api/api';
import { format } from 'timeago.js';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
}));

const Conversation = ({ conversation, currentUser, isSelected, isOnline }) => {
  const [friend, setFriend] = useState(null);

  useEffect(() => {
    const friendId = conversation.members.find((memberId) => memberId !== currentUser.id);
    const getFriend = async () => {
      try {
        // The API already sends the isVerified status, so no backend change is needed
        const res = await api.get(`/users?userId=${friendId}`);
        setFriend(res.data);
      } catch (err) {
        console.error("Failed to fetch conversation friend's data", err);
      }
    };
    if (friendId) getFriend();
  }, [conversation, currentUser]);

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      py: 1.2,
      px: 2,
      cursor: 'pointer',
      backgroundColor: isSelected ? 'action.selected' : 'transparent',
      '&:hover': { backgroundColor: 'action.hover' },
    }}>

      {/* Item 1: Avatar with Online Badge */}
      <StyledBadge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
        invisible={!isOnline}
      >
        <Avatar src={friend?.profilePicture} sx={{ width: 56, height: 56 }} />
      </StyledBadge>

      {/* Item 2: Text block */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}> 
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography 
            variant="body1" 
            noWrap
            sx={{ fontWeight: conversation.hasUnread ? '700' : '600', color: conversation.hasUnread ? 'text.primary' : 'text.secondary' }}>
            {friend ? friend.username : "Loading..."}
          </Typography>
          {/* --- ADDED: Logic to display the badge --- */}
          {friend?.isVerified && (
            <Tooltip title="Verified Account">
              <VerifiedIcon color="primary" sx={{ fontSize: '1.1rem' }} />
            </Tooltip>
          )}
        </Box>
        <Typography 
          variant="body2" 
          noWrap 
          sx={{ fontWeight: conversation.hasUnread ? 'bold' : 'normal', color: conversation.hasUnread ? 'text.primary' : 'text.secondary' }}>
          {conversation.lastMessage ? `${conversation.lastMessage.text}` : "No messages yet"}
          {' · '}
          {conversation.lastMessage ? format(conversation.lastMessage.createdAt) : ''}
        </Typography>
      </Box>

      {/* Item 3: The Unread Dot */}
      <Box>
        {conversation.hasUnread && (
            <Box sx={{
              height: 12,
              width: 12,
              minWidth: 12,
              borderRadius: '50%',
              bgcolor: 'primary.main',
            }} />
        )}
      </Box>

    </Box>
  );
};

export default Conversation;
