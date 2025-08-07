import React, { useState, useEffect, useContext } from 'react';
import { Container, Box, Typography, Button, CircularProgress, Avatar, Grid, Paper } from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import CreatePostWidget from '../components/CreatePostWidget';
import MemberListModal from '../components/MemberListModal';

function BookClubDetailPage() {
  const { id } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const [bookClub, setBookClub] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBookClubData = async () => {
    try {
      const [clubRes, postsRes] = await Promise.all([
        api.get(`/bookclubs/${id}`),
        api.get(`/bookclubs/${id}/posts`),
      ]);
      setBookClub(clubRes.data);
      setPosts(postsRes.data);
      if (currentUser) {
        setIsMember(clubRes.data.members.some((member) => member._id === currentUser._id));
      }
    } catch (error) {
      console.error('Failed to fetch book club data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookClubData();
  }, [id, currentUser]);

  const handleJoin = async () => {
    try {
      await api.put(`/bookclubs/${id}/join`);
      fetchBookClubData();
    } catch (error) {
      console.error('Failed to join book club', error);
    }
  };

  const handleLeave = async () => {
    try {
      await api.put(`/bookclubs/${id}/leave`);
      fetchBookClubData();
    } catch (error) {
      console.error('Failed to leave book club', error);
    }
  };

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  }

  if (!bookClub) {
    return <Typography>Book club not found.</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <Box sx={{ height: { xs: 120, sm: 200 }, bgcolor: 'primary.light', backgroundImage: `url(${bookClub.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" component="h1">
                  {bookClub.name}
                </Typography>
                <Typography color="text.secondary">
                  Created by {bookClub.createdBy.username}
                </Typography>
              </Box>
              {currentUser && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                  {bookClub.createdBy._id === currentUser._id && (
                    <Button component={Link} to={`/bookclubs/${id}/edit`} variant="outlined">
                      Edit Club
                    </Button>
                  )}
                  {isMember ? (
                    <Button variant="outlined" onClick={handleLeave}>
                      Leave Club
                    </Button>
                  ) : (
                    <Button variant="contained" onClick={handleJoin}>
                      Join Club
                    </Button>
                  )}
                </Box>
              )}
            </Box>
            <Typography variant="body1" sx={{ my: 2 }}>
              {bookClub.description}
            </Typography>
          </Box>
          <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Box sx={{ p: { xs: 1, sm: 2 } }}>
                  {isMember && <CreatePostWidget onPostSuccess={fetchBookClubData} bookClubId={id} />}
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={4} sx={{ borderLeft: { md: '1px solid #e0e0e0' } }}>
                <Box sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography variant="h6">Members ({bookClub.members.length})</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', my: 1, cursor: 'pointer' }} onClick={() => setModalOpen(true)}>
                    {bookClub.members.slice(0, 5).map((member, index) => (
                      <Avatar
                        key={member._id}
                        src={member.profilePicture}
                        sx={{
                          width: 32,
                          height: 32,
                          ml: index > 0 ? -1 : 0,
                          border: '2px solid white',
                        }}
                      />
                    ))}
                    {bookClub.members.length > 5 && (
                      <Typography sx={{ ml: 1 }}>+{bookClub.members.length - 5} more</Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
      <MemberListModal open={modalOpen} onClose={() => setModalOpen(false)} members={bookClub.members} />
    </Container>
  );
}

export default BookClubDetailPage;
