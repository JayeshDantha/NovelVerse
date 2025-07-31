// client/src/pages/PostDetailPage.jsx - FINAL CORRECTED VERSION

import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, List, Divider } from '@mui/material';
import PostCard from '../components/PostCard';
import CommentForm from '../components/CommentForm';
import Comment from '../components/Comment';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

function PostDetailPage() {
  const { postId } = useParams();
  const { user } = useContext(AuthContext);

  const [post, setPost] = useState(null);
  const [commentTree, setCommentTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const postRes = await api.get(`/posts/${postId}`);
      const commentsRes = await api.get(`/comments/${postId}`);

      setPost(postRes.data);

      const comments = commentsRes.data;
      const commentsById = {};
      comments.forEach(c => {
        commentsById[c._id] = { ...c, children: [] };
      });

      const tree = [];
      comments.forEach(c => {
        if (c.parentComment && commentsById[c.parentComment]) {
          commentsById[c.parentComment].children.push(commentsById[c._id]);
        } else {
          tree.push(commentsById[c._id]);
        }
      });
      setCommentTree(tree);

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
  }, [postId]);

  // --- THIS FUNCTION IS THE ONLY PART THAT HAS CHANGED ---
  const handleCommentSubmit = async (commentContent, parentId = null) => {
    if (!user) return alert('Please log in to comment.'); 
    
    try {
      // 1. We now include the postId in the body of the request.
      const body = { 
        content: commentContent, 
        postId: postId,
        parentId: parentId || null // Ensure we use parentId to match backend
      };
      
      // 2. We now send the request to /comments/ instead of /comments/:postId
      const res = await api.post('/comments', body); 
      
      // Refresh all data to show the new comment
      setCommentTree(res.data);
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>;

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        {post && <PostCard post={post} />}
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
