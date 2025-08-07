import React, { useState } from 'react';
import { Container, Box, Typography, Button, TextField, CircularProgress, Avatar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';

function AddBookPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState(location.state?.searchTerm || '');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setCoverImage(res.data.imageUrl);
    } catch (error) {
      console.error('Failed to upload image', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/books', { title, authors: [author], description, thumbnail: coverImage });
      navigate(-1); // Go back to the previous page
    } catch (error) {
      console.error('Failed to add book', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add a New Book
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            margin="normal"
          />
          <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar src={imagePreview} sx={{ width: 100, height: 100, mr: 2 }} />
            <Button variant="contained" component="label">
              Upload Cover Image
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </Button>
          </Box>
          <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} /> : 'Add Book'}
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default AddBookPage;
