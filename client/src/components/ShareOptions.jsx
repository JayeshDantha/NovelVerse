import React from 'react';
import { Box, Button, Typography } from '@mui/material';

function ShareOptions({ onCopyLink }) {
  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>Share Post</Typography>
      <Button variant="contained" onClick={onCopyLink}>
        Copy Link
      </Button>
    </Box>
  );
}

export default ShareOptions;