// client/src/pages/NovelDetailPage.jsx - FINAL STABLE VERSION

import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Grid, CircularProgress, Paper, Button, Menu, MenuItem, Divider } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import api from '../api/api';
import PostCard from '../components/PostCard';
import { AuthContext } from '../context/AuthContext';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function NovelDetailPage() {
  const { googleBooksId } = useParams();
  const { user } = useContext(AuthContext);

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [shelfItem, setShelfItem] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => { setAnchorEl(event.currentTarget); };
  const handleClose = () => { setAnchorEl(null); };

  const handleAddToShelf = async (status) => {
    handleClose();
    if (!book) return;
    const payload = { status: status, bookData: book };
    try {
      const res = await api.post('/books/bookshelf', payload);
      setShelfItem(res.data);
      alert(`'${book.title}' moved to your '${status.replace(/_/g, ' ')}' shelf!`);
    } catch (error) {
      console.error('Failed to add book to shelf:', error);
      alert('Error: Could not update shelf.');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = user ? `/books/view/${googleBooksId}` : `/books/details/${googleBooksId}`;
      const res = await api.get(url);

      if (user) {
        setBook(res.data.bookDetails);
        setShelfItem(res.data.shelfItem);
      } else {
        setBook(res.data);
        setShelfItem(null);
      }

      const [reviewsRes, discussionsRes] = await Promise.all([
        api.get(`/posts/book/${googleBooksId}`),
        api.get(`/posts/book/${googleBooksId}/discussions`)
      ]);
      setReviews(reviewsRes.data);
      setDiscussions(discussionsRes.data);

    } catch (err) {
      console.error("Failed to fetch page data:", err);
      setError("Could not load page data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (googleBooksId) {
      fetchData();
    }
  }, [googleBooksId, user]);

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
  if (error) return <Typography color="error" sx={{ textAlign: 'center', mt: 4 }}>{error}</Typography>;
  if (!book) return <Typography sx={{ textAlign: 'center', mt: 4 }}>Book not found.</Typography>;

  const getButtonContent = () => {
    if (!shelfItem || !user) {
      return { text: 'Add to Shelf', variant: 'contained', color: 'primary' };
    }
    switch (shelfItem.status) {
      case 'read':
        return { text: 'Read', variant: 'contained', color: 'success' };
      case 'reading':
        return { text: 'Reading', variant: 'contained', color: 'info' };
      case 'want_to_read':
        return { text: 'Want to Read', variant: 'contained', color: 'secondary' };
      default:
        return { text: 'Add to Shelf', variant: 'contained', color: 'primary' };
    }
  };
  const buttonContent = getButtonContent();

  const handleClaimOwnership = async () => {
    try {
      const res = await api.post(`/books/${googleBooksId}/claim`);
      setBook(res.data);
    } catch (error) {
      console.error('Failed to claim ownership:', error);
      alert('Error: Could not claim ownership.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: {xs: 2, md: 4}, borderRadius: '16px' }}>
        {/* --- THIS IS THE CORRECTED GRID WITH THE OLD, STABLE SYNTAX --- */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Box 
                component="img" 
                src={book.coverImage || 'https://placehold.co/300x450'} 
                alt={book.title} 
                sx={{ width: '100%', maxWidth: '300px', height: 'auto', borderRadius: '8px', boxShadow: 3 }}
            />
            {user && (
              <Box sx={{ mt: 2 }}>
                  <Button 
                      variant={buttonContent.variant} 
                      color={buttonContent.color} 
                      fullWidth 
                      onClick={handleClick}
                      startIcon={shelfItem ? <CheckCircleOutlineIcon /> : null}
                  >
                      {buttonContent.text}
                  </Button>
                  <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                      <MenuItem onClick={() => handleAddToShelf('want_to_read')}>Want to Read</MenuItem>
                      <MenuItem onClick={() => handleAddToShelf('reading')}>Currently Reading</MenuItem>
                      <MenuItem onClick={() => handleAddToShelf('read')}>Read</MenuItem>
                  </Menu>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" gutterBottom>{book.title}</Typography>
            {book.subtitle && <Typography variant="h5" component="h2" color="text.secondary" sx={{mt: -2, mb: 2}}>{book.subtitle}</Typography>}
            <Typography variant="h6" component="p" gutterBottom>by {book.authors.join(', ')}</Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Published {book.publishedDate ? `on ${book.publishedDate}` : ''} {book.publisher ? `by ${book.publisher}` : ''}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>{book.pageCount ? `${book.pageCount} pages` : ''}</Typography>
            {user && book.createdBy === user._id && (
              <Button
                component={Link}
                to={`/book/${googleBooksId}/edit`}
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{ mt: 2 }}
              >
                Edit Book
              </Button>
            )}
            {user && !book.createdBy && book.googleBooksId.startsWith('custom-') && (
              <Button
                variant="contained"
                onClick={handleClaimOwnership}
                sx={{ mt: 2 }}
              >
                Claim Ownership
              </Button>
            )}
            <Box sx={{ my: 3 }}><Typography variant="h6" gutterBottom>Description</Typography><Typography variant="body1" dangerouslySetInnerHTML={{ __html: book.description || 'No description available.' }} /></Box>
          </Grid>
        </Grid>
        <Box sx={{ mt: 5 }}>
            <Typography variant="h4" component="h2" gutterBottom>Community Reviews</Typography>
            <Divider sx={{ mb: 3 }} />
            {reviews.length > 0 ? (
                reviews.map(review => (<PostCard key={review._id} post={review} />))
            ) : ( <Typography color="text.secondary">No reviews yet. Be the first to share your thoughts!</Typography>)}
        </Box>
        <Box sx={{ mt: 5 }}>
            <Typography variant="h4" component="h2" gutterBottom>Community Discussions</Typography>
            <Divider sx={{ mb: 3 }} />
            {discussions.length > 0 ? (
                discussions.map(discussion => (<PostCard key={discussion._id} post={discussion} />))
            ) : ( <Typography color="text.secondary">No discussions or quotes for this book yet.</Typography>)}
        </Box>
      </Paper>
    </Container>
  );
}

export default NovelDetailPage;
