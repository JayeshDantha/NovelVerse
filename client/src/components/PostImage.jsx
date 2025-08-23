import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

function PostImage({ post, aspectRatio }) {
  const getDimensions = () => {
    switch (aspectRatio) {
      case 'portrait':
        return { width: 1080, height: 1920 };
      case 'landscape':
        return { width: 1920, height: 1080 };
      case 'square':
      default:
        return { width: 1080, height: 1080 };
    }
  };

  const { width, height } = getDimensions();

  return (
    <Box
      sx={{
        width,
        height,
        p: 4,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar src={post.user.profilePicture} sx={{ width: 60, height: 60 }} />
        <Typography variant="h6">{post.user.username}</Typography>
      </Box>
      <Typography variant="body1" sx={{ textAlign: 'center', mb: 2 }}>
        {post.content}
      </Typography>
      {post.imageUrl && (
        <Box
          component="img"
          src={post.imageUrl}
          sx={{
            maxWidth: '100%',
            maxHeight: '60%',
            borderRadius: '8px',
            objectFit: 'contain',
          }}
        />
      )}
    </Box>
  );
}

export default PostImage;