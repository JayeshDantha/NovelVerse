// client/src/components/PostCard.jsx - MODERN & MINIMAL REDESIGN (with Verified Badge Fix)

import React, { useState, useContext } from 'react';
import { Paper, Box, Avatar, Typography, IconButton, Divider, CardActionArea } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import VerifiedIcon from '@mui/icons-material/Verified'; // --- FIX: Import the badge icon ---

// Helper function to format dates nicely
const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
};

function PostCard({ post }) {
    const { user: currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [likes, setLikes] = useState(post.likes || []);
    
    const isLiked = currentUser ? likes.includes(currentUser.id) : false;

    const handleLike = async (e) => {
        e.stopPropagation(); // Stop click from propagating to the parent card
        if (!currentUser) return alert("Please login to like posts.");
        
        if (isLiked) {
            setLikes(likes.filter(id => id !== currentUser.id));
        } else {
            setLikes([...likes, currentUser.id]);
        }
        
        try {
            const res = await api.put(`/posts/${post._id}/like`);
            setLikes(res.data);
        } catch (error) {
            console.error("Failed to like post", error);
        }
    };
    
    const navigateToPost = () => {
        navigate(`/post/${post._id}`);
    };

    if (!post || !post.user || !post.novel) {
        return null; 
    }
  
  return (
    <CardActionArea component="div" onClick={navigateToPost} sx={{ borderRadius: '16px' }}>
      <Paper 
        elevation={0} 
        sx={{ 
            mb: 2, 
            borderRadius: '16px', 
            overflow: 'hidden', 
            border: '1px solid',
            borderColor: 'divider'
        }}
      >
        <Box sx={{ p: 2 }}>
            {/* --- HEADER --- */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar 
                    component={Link} 
                    to={`/profile/${post.user.username}`} 
                    src={post.user.profilePicture}
                    onClick={(e) => e.stopPropagation()} 
                >
                    {!post.user.profilePicture && post.user.username.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography 
                            variant="body1" 
                            fontWeight="bold"
                            component={Link}
                            to={`/profile/${post.user.username}`}
                            onClick={(e) => e.stopPropagation()}
                            sx={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            {post.user.username}
                        </Typography>
                        
                        {/* --- THE FIX IS HERE --- */}
                        {post.user.isVerified && (
                            <VerifiedIcon color="primary" sx={{ fontSize: '1.1rem' }} />
                        )}
                        {/* --- END OF FIX --- */}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                        {timeSince(post.createdAt)} ago
                    </Typography>
                </Box>
            </Box>

            {/* --- CONTENT --- */}
            <Typography variant="body1" sx={{ my: 2, whiteSpace: 'pre-wrap' }}>
                {post.content}
            </Typography>

            {/* --- NOVEL TAG --- */}
            <Box 
              component={Link} 
              to={`/book/${post.novel.googleBooksId}`} 
              onClick={(e) => e.stopPropagation()}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                p: '4px 12px',
                borderRadius: '999px',
                bgcolor: 'action.hover',
                textDecoration: 'none',
                color: 'text.primary',
                '&:hover': { bgcolor: 'action.selected' }
              }}
            >
                <BookmarkBorderIcon fontSize='small' />
                <Typography variant="caption" fontWeight="bold">{post.novel.title}</Typography>
            </Box>

            <Divider sx={{ my: 1.5 }} />
            
            {/* --- FOOTER / ACTIONS --- */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={handleLike} size="small">
                    {isLiked ? <FavoriteIcon sx={{color: '#F44336'}}/> : <FavoriteBorderIcon />}
                </IconButton>
                <Typography variant="body2" color="text.secondary" sx={{mr: 2}}>{likes.length > 0 ? likes.length : ''}</Typography>

                <IconButton size="small">
                    <ChatBubbleOutlineIcon />
                </IconButton>
                <Typography variant="body2" color="text.secondary">{post.commentCount > 0 ? post.commentCount : ''}</Typography>
            </Box>
        </Box>
      </Paper>
    </CardActionArea>
  );
}

export default PostCard;

