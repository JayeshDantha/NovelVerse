// client/src/components/PostCard.jsx - FINAL WORKING VERSION

import React, { useState, useContext } from 'react';
import { Paper, Box, Avatar, Typography, IconButton, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import { motion } from 'framer-motion';

import { FaHeart, FaRegHeart, FaComment, FaBookmark } from 'react-icons/fa';
import VerifiedIcon from '@mui/icons-material/Verified';

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

    // This robust handleLike function is unchanged.
    const handleLike = async (e) => {
        e.stopPropagation(); 
        if (!currentUser) return alert("Please login to like posts.");
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

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };
  
  return (
    <motion.div
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
    >
      <Paper 
          elevation={0} 
          sx={{ 
              mb: 2, 
              borderRadius: '20px', 
              overflow: 'hidden', 
              border: '1px solid #E0E0E0',
              transition: 'box-shadow 0.3s ease-in-out',
              '&:hover': {
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }
          }}
      >
        <Box sx={{ p: 2 }}>
            <Box onClick={navigateToPost} sx={{ cursor: 'pointer' }}>
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
                            {post.user.isVerified && (
                                <VerifiedIcon color="primary" sx={{ fontSize: '1.1rem' }} />
                            )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            {timeSince(post.createdAt)} ago
                        </Typography>
                    </Box>
                </Box>
                <Typography variant="body1" sx={{ my: 2, whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#333' }}>
                    {post.content}
                </Typography>
                <Box 
                  component={Link} 
                  to={`/book/${post.novel.googleBooksId}`} 
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    p: '6px 14px',
                    borderRadius: '999px',
                    bgcolor: '#F5F5F5',
                    textDecoration: 'none',
                    color: '#555',
                    transition: 'background-color 0.3s',
                    '&:hover': { bgcolor: '#E0E0E0' }
                  }}
                >
                    <FaBookmark />
                    <Typography variant="caption" fontWeight="bold">{post.novel.title}</Typography>
                </Box>
            </Box>

            <Divider sx={{ my: 1.5 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <motion.div whileTap={{ scale: 1.2 }} whileHover={{ scale: 1.1 }}>
                    <IconButton onClick={handleLike} size="small" sx={{ color: isLiked ? '#E91E63' : 'inherit' }}>
                        {isLiked ? <FaHeart /> : <FaRegHeart />}
                    </IconButton>
                </motion.div>
                <Typography variant="body2" color="text.secondary" sx={{mr: 2}}>{likes.length > 0 ? likes.length : ''}</Typography>

                <motion.div whileTap={{ scale: 1.2 }} whileHover={{ scale: 1.1 }}>
                    <IconButton size="small" onClick={navigateToPost}>
                        <FaComment />
                    </IconButton>
                </motion.div>
                <Typography variant="body2" color="text.secondary">{post.commentCount > 0 ? post.commentCount : ''}</Typography>
            </Box>
        </Box>
      </Paper>
    </motion.div>
  );
}

export default PostCard;
