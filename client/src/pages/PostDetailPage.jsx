// client/src/pages/PostDetailPage.jsx - FINAL CORRECTED VERSION

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, List, Divider } from '@mui/material';
import PostCard from '../components/PostCard';
import CommentForm from '../components/CommentForm';
import Comment from '../components/Comment';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

function PostDetailPage() {
  const { postId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [commentTree, setCommentTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const postRes = await api.get(`/posts/${postId}`);
      const commentsRes = await api.get(`/comments/${postId}`);

      setPost(postRes.data);

      setCommentTree(commentsRes.data);

    } catch (err) {
      setError('Could not fetch post details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();

    socket.emit('join post room', postId);

    socket.on('new comment', (newComment) => {
      setCommentTree(prevTree => [newComment, ...prevTree]);
    });

    socket.on('new reply', (newReply) => {
      setCommentTree(prevTree => {
        const newTree = [...prevTree];
        const findAndAddReply = (comments) => {
          for (let i = 0; i < comments.length; i++) {
            if (comments[i]._id === newReply.parentComment) {
              if (!comments[i].children) {
                comments[i].children = [];
              }
              comments[i].children.push(newReply);
              return true;
            }
            if (comments[i].children) {
              if (findAndAddReply(comments[i].children)) {
                return true;
              }
            }
          }
          return false;
        };
        findAndAddReply(newTree);
        return newTree;
      });
    });

    socket.on('comment updated', (updatedComment) => {
      setCommentTree(prevTree => {
        const newTree = [...prevTree];
        const findAndUpdate = (comments) => {
          for (let i = 0; i < comments.length; i++) {
            if (comments[i]._id === updatedComment._id) {
              comments[i].likes = updatedComment.likes;
              return true;
            }
            if (comments[i].children) {
              if (findAndUpdate(comments[i].children)) {
                return true;
              }
            }
          }
          return false;
        };
        findAndUpdate(newTree);
        return newTree;
      });
    });

    return () => {
      socket.emit('leave post room', postId);
      socket.off('new comment');
      socket.off('comment updated');
    };
  }, [postId]);

  // --- THIS FUNCTION IS THE ONLY PART THAT HAS CHANGED ---
  const handleCommentSubmit = async (commentContent, parentId = null) => {
    if (!user) return alert('Please log in to comment.');

    try {
      const body = {
        content: commentContent,
        postId: postId,
        parentId: parentId || null
      };
      await api.post('/comments', body);
      window.location.reload();
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  const handlePostDelete = () => {
    navigate('/');
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>;

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        {post && <PostCard post={post} onPostDelete={handlePostDelete} />}
        <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>Comments</Typography>
        {user && <CommentForm onCommentSubmit={handleCommentSubmit} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px' }} />}
        <List sx={{ mt: 2 }}>
          {commentTree.length > 0 ? (
            commentTree.map(comment => (
              <React.Fragment key={comment._id}>
                <Comment comment={comment} onCommentSubmit={handleCommentSubmit} />
                <Divider sx={{ my: 2 }} />
              </React.Fragment>
            ))
          ) : (
            <Typography sx={{ mt: 2, color: 'text.secondary' }}>No comments yet. Be the first!</Typography>
          )}
        </List>
      </Box>
    </Container>
  );
}

export default PostDetailPage;
