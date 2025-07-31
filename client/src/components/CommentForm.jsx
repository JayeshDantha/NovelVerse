import React, { useState, useContext } from 'react';
import { Box, TextField, Button, Avatar } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

// We add `sx = {}` to the props. This allows the parent to pass in custom styles.
function CommentForm({ onCommentSubmit, isReply = false, sx = {} }) {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onCommentSubmit(content);
    setContent('');
  };

  return (
    // We merge the default styles with any incoming sx styles.
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, borderRadius: '999px', bgcolor: '#F5F5F5', ...sx }}>
      <Avatar src={user?.profilePicture} sx={{ width: 32, height: 32 }}>{user?.username?.charAt(0).toUpperCase() || 'U'}</Avatar>
      <TextField
        placeholder={isReply ? "Post your reply..." : "Write a comment..."}
        fullWidth
        multiline
        value={content}
        onChange={(e) => setContent(e.target.value)}
        variant="standard"
        InputProps={{ disableUnderline: true, sx: { py: '4px' } }}
      />
      <Button type="submit" variant="contained" sx={{ borderRadius: '999px', height: 'fit-content', px: 3 }}>
        {isReply ? "Reply" : "Post"}
      </Button>
    </Box>
  );
}

export default CommentForm;
