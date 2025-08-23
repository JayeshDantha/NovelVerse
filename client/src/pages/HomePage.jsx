// client/src/pages/HomePage.jsx - UPGRADED VERSION

import React, { useState, useEffect, useContext } from 'react';
import { Container, Box, CircularProgress, Typography, Tabs, Tab } from '@mui/material';
import PostCard from '../components/PostCard';
import CreatePostWidget from '../components/CreatePostWidget';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function HomePage() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts/following');
      setPosts(res.data);
    } catch (error) {
      console.error('Failed to fetch posts', error);
    }
  };

  const fetchFeed = async () => {
    try {
      const res = await api.get('/posts/feed');
      setFeed(res.data);
    } catch (error) {
      console.error('Failed to fetch feed', error);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPosts(), fetchFeed()]).finally(() => setLoading(false));
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter((post) => post._id !== postId));
    setFeed(feed.filter((post) => post._id !== postId));
  };

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        {user && <CreatePostWidget onPostSuccess={() => Promise.all([fetchPosts(), fetchFeed()])} />}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} centered>
            <Tab label="For You" />
            <Tab label="Following" />
          </Tabs>
        </Box>

        <TabPanel value={tabIndex} index={0}>
          {feed.length > 0 ? (
            feed.map(post => <PostCard key={post._id} post={post} onPostDelete={handlePostDelete} />)
          ) : (
            <Typography>Your personalized feed is empty. Interact with some posts to get started!</Typography>
          )}
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          {posts.length > 0 ? (
            posts.map(post => <PostCard key={post._id} post={post} onPostDelete={handlePostDelete} />)
          ) : (
            <Typography>No posts from the users you follow yet.</Typography>
          )}
        </TabPanel>
      </Box>
    </Container>
  );
}

export default HomePage;
