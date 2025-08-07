import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Grid, Card, CardContent, CardActions, CircularProgress, TextField } from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../api/api';

function BookClubsPage() {
  const [bookClubs, setBookClubs] = useState([]);
  const [recommendedClubs, setRecommendedClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBookClubs = async () => {
      try {
        const [clubsRes, recommendedRes] = await Promise.all([
          api.get('/bookclubs'),
          api.get('/bookclubs/recommendations'),
        ]);
        setBookClubs(clubsRes.data);
        setRecommendedClubs(recommendedRes.data);
      } catch (error) {
        console.error('Failed to fetch book clubs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookClubs();
  }, []);

  const filteredBookClubs = bookClubs.filter((club) =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Book Clubs
          </Typography>
          <Button component={Link} to="/bookclubs/new" variant="contained">
            Create New Club
          </Button>
        </Box>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Recommended for You
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {recommendedClubs.slice(0, 3).map((club) => (
            <Grid item key={club._id} xs={12} sm={6} md={4}>
              <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="div">
                    {club.name}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Created by {club.createdBy.username}
                  </Typography>
                  <Typography variant="body2">
                    {club.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button component={Link} to={`/bookclubs/${club._id}`} size="small">
                    Learn More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          All Clubs
        </Typography>
        <TextField
          label="Search Book Clubs"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 4 }}
        />
        <Grid container spacing={2}>
          {filteredBookClubs.map((club) => (
            <Grid item key={club._id} xs={12} sm={6} md={4}>
              <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="div">
                    {club.name}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Created by {club.createdBy.username}
                  </Typography>
                  <Typography variant="body2">
                    {club.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button component={Link} to={`/bookclubs/${club._id}`} size="small">
                    Learn More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default BookClubsPage;
