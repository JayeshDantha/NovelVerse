// client/src/components/Comment.jsx - UPGRADED VERSION (with Verified Badge Fix)

import React, { useState, useContext } from 'react';
import { Box, Typography, Button, IconButton, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import CommentForm from './CommentForm';
import { AuthContext } from '../context/AuthContext';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VerifiedIcon from '@mui/icons-material/Verified'; // --- FIX: Import the badge icon ---
import api from '../api/api';

function Comment({ comment, onCommentSubmit }) {
  const { user } = useContext(AuthContext); // The currently logged-in user
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [likes, setLikes] = useState(comment.likes || []);
  
  const isLikedByMe = user ? likes.includes(user.id) : false;
  const amITheAuthor = user ? user.id === comment.user._id : false;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return alert('You must be logged in to like comments.');
    
    try {
      const res = await api.put(`/comments/${comment._id}/like`);
      setLikes(res.data);
    } catch (error) {
      console.error('Failed to like comment', error);
    }
  };

  const handleReplySubmit = (commentContent) => {
    onCommentSubmit(commentContent, comment._id);
    setShowReplyForm(false);
  };

  if (!comment.user) return null;

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: amITheAuthor ? 'flex-end' : 'flex-start', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          {!amITheAuthor && (
            <IconButton component={Link} to={`/profile/${comment.user.username}`} sx={{ p: 0 }}>
              <Avatar src={comment.user.profilePicture}>
                {!comment.user.profilePicture && comment.user.username.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          )}

          <Box sx={{ bgcolor: amITheAuthor ? 'primary.main' : 'action.hover', color: amITheAuthor ? 'primary.contrastText' : 'text.primary', borderRadius: '16px', p: 1.5, maxWidth: '450px', wordWrap: 'break-word' }}>
            {!amITheAuthor && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Typography variant="caption" component={Link} to={`/profile/${comment.user.username}`} sx={{ fontWeight: 'bold', textDecoration: 'none', color: 'inherit' }}>
                  {comment.user.username}
                </Typography>
                
                {/* --- THE FIX IS HERE --- */}
                {comment.user.isVerified && (
                  <VerifiedIcon sx={{ fontSize: '0.9rem', color: amITheAuthor ? 'primary.contrastText' : 'primary.main' }} />
                )}
                {/* --- END OF FIX --- */}
              </Box>
            )}
            <Typography variant="body2">{comment.content}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Like and Reply buttons section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: amITheAuthor ? 'flex-end' : 'flex-start', pl: amITheAuthor ? 0 : 7, pr: amITheAuthor ? 1 : 0 }}>
        <IconButton onClick={handleLike} size="small">
          {isLikedByMe ? <FavoriteIcon color="error" fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </IconButton>
        <Typography variant="caption" color="text.secondary">{likes.length > 0 ? likes.length : ''}</Typography>
        {user && !amITheAuthor && (
          <Button size="small" onClick={() => setShowReplyForm(!showReplyForm)} sx={{ textTransform: 'none' }}>
            {showReplyForm ? 'Cancel' : 'Reply'}
          </Button>
        )}
      </Box>

      {/* Reply form section */}
      {showReplyForm && (
        <Box sx={{ pl: amITheAuthor ? 0 : 7 }}><CommentForm onCommentSubmit={handleReplySubmit} isReply={true} /></Box>
      )}

      {/* Child comments (replies) section */}
      {comment.children && comment.children.length > 0 && (
        <Box sx={{ pl: 4, mt: 1 }}>
          {comment.children.map(childComment => (
            <Comment key={childComment._id} comment={childComment} onCommentSubmit={onCommentSubmit} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default Comment;
