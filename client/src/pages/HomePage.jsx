// client/src/pages/HomePage.jsx - UPGRADED VERSION

import React, { useState, useEffect, useContext } from 'react';
import { Container, Box, CircularProgress, Typography } from '@mui/material';
import PostCard from '../components/PostCard';
import CreatePostWidget from '../components/CreatePostWidget'; // Import the new widget
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

function HomePage() {
  const { user } = useContext(AuthContext); // Get the logged-in user
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // We put the fetching logic into its own function so we can call it again
  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (error) {
      console.error('Failed to fetch posts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPosts();
  }, []);

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        {/* The CreatePostWidget only shows if a user is logged in */}
        {user && <CreatePostWidget onPostSuccess={fetchPosts} />}
        
        {posts.length > 0 ? (
          posts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <Typography>No posts yet. Follow some users to see their posts!</Typography>
        )}
      </Box>
    </Container>
  );
}

export default HomePage;