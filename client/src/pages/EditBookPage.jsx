import React, { useState, useEffect, useContext } from 'react';
import { Container, Box, Typography, Button, TextField, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

function EditBookPage() {
  const { googleBooksId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [book, setBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    publisher: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await api.get(`/books/view/${googleBooksId}`);
        const bookData = res.data.bookDetails;
        setBook(bookData);
        setFormData({
          title: bookData.title,
          authors: bookData.authors.join(', '),
          publisher: bookData.publisher || '',
          description: bookData.description || '',
        });
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch book for editing', error);
        navigate('/'); // Redirect home on error
      }
    };
    fetchBook();
  }, [googleBooksId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/books/${googleBooksId}`, formData);
      navigate(`/book/${googleBooksId}`);
    } catch (error) {
      console.error('Failed to update book', error);
      // Handle error (e.g., show a notification)
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit "{book.title}"
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            name="title"
            label="Title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            name="authors"
            label="Author(s)"
            value={formData.authors}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            helperText="Separate multiple authors with a comma"
          />
          <TextField
            name="publisher"
            label="Publisher"
            value={formData.publisher}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={6}
            margin="normal"
          />
          <Button type="submit" variant="contained" disabled={saving} sx={{ mt: 2 }}>
            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default EditBookPage;
