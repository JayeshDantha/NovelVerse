// client/src/components/Message.jsx - FINAL MERGED VERSION

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { format } from 'timeago.js';

const Message = ({ message, own }) => {
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: own ? 'flex-end' : 'flex-start',
      mb: 1, // Adjusted for slightly tighter spacing
    }}>
      <Paper
        elevation={0} // Using elevation 0 for a flatter, modern look
        sx={{
          px: 2, // Using px and py for more control
          py: 1,
          maxWidth: '70%',
          // KEPT: Using your theme color for your messages
          // UPDATED: Using a specific light grey for other messages to match the reference
          bgcolor: own ? 'primary.main' : '#EFEFEF', 
          color: own ? 'primary.contrastText' : 'text.primary',
          // UPDATED: The key change for the Instagram look
          borderRadius: '22px', 
        }}
      >
        <Typography variant="body1" sx={{ wordWrap: 'break-word' }}>
          {message.text}
        </Typography>
        
        {/* KEPT: Your excellent timestamp functionality */}
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.8, color: 'inherit' }}>
          {format(message.createdAt)}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Message;
