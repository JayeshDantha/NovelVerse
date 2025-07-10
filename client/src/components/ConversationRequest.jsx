// client/src/components/conversations/ConversationRequest.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button, Stack } from '@mui/material';
import api from "../api/api";

const ConversationRequest = ({ request, currentUser, onAccept, onDecline }) => {
  const [requester, setRequester] = useState(null);

  // This useEffect fetches the profile data of the user who sent the request
  useEffect(() => {
    const requesterId = request.members.find((m) => m !== currentUser.id);
    if (requesterId) {
      const getUser = async () => {
        try {
          const res = await api.get(`/users?userId=${requesterId}`);
          setRequester(res.data);
        } catch (err) {
          console.error("Failed to fetch requester data", err);
        }
      };
      getUser();
    }
  }, [request, currentUser]);

  if (!requester) {
    return null; // Don't render anything until we have the user data
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #f0f0f0', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar src={requester.profilePicture} />
        <Typography variant="body1" fontWeight="500">
          {requester.username}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" size="small" onClick={() => onAccept(request)}>
          Accept
        </Button>
        <Button variant="text" size="small" color="secondary" onClick={() => onDecline(request._id)}>
          Decline
        </Button>
      </Stack>
    </Box>
  );
};

export default ConversationRequest;