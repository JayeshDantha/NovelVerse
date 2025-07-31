// client/src/components/Comment.jsx - UPGRADED VERSION (with Verified Badge Fix)

import React, { useState, useContext } from 'react';
import { Box, Typography, Button, IconButton, Avatar, Collapse } from '@mui/material';
import { Link } from 'react-router-dom';
import CommentForm from './CommentForm';
import { AuthContext } from '../context/AuthContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import VerifiedIcon from '@mui/icons-material/Verified';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/api';

function Comment({ comment, onCommentSubmit }) {
  const { user } = useContext(AuthContext);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
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

          <Box sx={{
              bgcolor: amITheAuthor ? '#007aff' : '#e5e5ea',
              color: amITheAuthor ? 'white' : 'black',
              borderRadius: '18px',
              p: '8px 12px',
              maxWidth: '450px',
              wordWrap: 'break-word',
          }}>
            {!amITheAuthor && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Typography variant="caption" component={Link} to={`/profile/${comment.user.username}`} sx={{ fontWeight: 'bold', textDecoration: 'none', color: 'inherit' }}>
                  {comment.user.username}
                </Typography>
                {comment.user.isVerified && (
                  <VerifiedIcon sx={{ fontSize: '0.9rem', color: '#007aff' }} />
                )}
              </Box>
            )}
            <Typography variant="body2">{comment.content}</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: amITheAuthor ? 'flex-end' : 'flex-start', pl: amITheAuthor ? 0 : 7, pr: amITheAuthor ? 1 : 0, mt: -0.5, mb: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
        </Typography>
        <IconButton onClick={handleLike} size="small" sx={{ color: isLikedByMe ? '#E91E63' : 'inherit' }}>
          {isLikedByMe ? <FaHeart /> : <FaRegHeart />}
        </IconButton>
        <Typography variant="caption" color="text.secondary">{likes.length > 0 ? likes.length : ''}</Typography>
        {user && !amITheAuthor && (
          <Button size="small" onClick={() => setShowReplyForm(!showReplyForm)} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
            {showReplyForm ? 'Cancel' : 'Reply'}
          </Button>
        )}
      </Box>

      {showReplyForm && (
        <Box sx={{ pl: amITheAuthor ? 0 : 7 }}><CommentForm onCommentSubmit={handleReplySubmit} isReply={true} /></Box>
      )}

      {comment.children && comment.children.length > 0 && (
        <Box sx={{ pl: 2, ml: 2, borderLeft: '2px solid #e0e0e0' }}>
          <Button size="small" onClick={() => setShowReplies(!showReplies)} sx={{ textTransform: 'none', mb: 1 }}>
            {showReplies ? 'Hide replies' : `Show ${comment.children.length} replies`}
          </Button>
          <Collapse in={showReplies}>
            {comment.children.map(childComment => (
              <Comment key={childComment._id} comment={childComment} onCommentSubmit={onCommentSubmit} />
            ))}
          </Collapse>
        </Box>
      )}
    </Box>
  );
}

export default Comment;
