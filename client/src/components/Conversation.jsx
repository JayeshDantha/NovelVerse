// client/src/components/Conversation.jsx

import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, Badge, styled, Tooltip } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import api from '../api/api';
import { format } from 'timeago.js';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
}));

// --- FIX #1: Added isPending prop ---
const Conversation = ({ conversation, currentUser, isSelected, isOnline, isPending, hasUnread }) => {
  const [friend, setFriend] = useState(null);

  useEffect(() => {
    const friendId = conversation.members.find((memberId) => memberId !== currentUser._id);
    const getFriend = async () => {
      try {
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

      <StyledBadge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
        invisible={!isOnline}
      >
        <Avatar src={friend?.profilePicture} sx={{ width: 56, height: 56 }} />
      </StyledBadge>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}> 
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography 
            variant="body1" 
            noWrap
            sx={{ fontWeight: hasUnread ? '700' : '600', color: hasUnread ? 'text.primary' : 'text.secondary' }}>
            {friend ? friend.username : "Loading..."}
          </Typography>
          {friend?.isVerified && (
            <Tooltip title="Verified Account">
              <VerifiedIcon color="primary" sx={{ fontSize: '1.1rem' }} />
            </Tooltip>
          )}
        </Box>
        
        {/* --- FIX #2: Conditionally show "Pending" status --- */}
        {isPending ? (
          <Typography variant="body2" noWrap sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            Request pending
          </Typography>
        ) : (
          <Typography 
            variant="body2" 
            noWrap 
            sx={{ fontWeight: hasUnread ? 'bold' : 'normal', color: hasUnread ? 'text.primary' : 'text.secondary' }}>
            {conversation.lastMessage ? `${conversation.lastMessage.text}` : "No messages yet"}
            {' · '}
            {conversation.lastMessage ? format(conversation.lastMessage.createdAt) : ''}
          </Typography>
        )}
      </Box>

      <Box>
        {!isPending && hasUnread && (
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
