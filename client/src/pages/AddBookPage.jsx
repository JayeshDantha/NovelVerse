import React, { useState } from 'react';
import { Container, Box, Typography, Button, TextField, CircularProgress, Avatar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/api';
import axios from 'axios';

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

    try {
      // 1. Get signature from backend
      console.log('Requesting signature from backend...');
      const signatureResponse = await api.get('/upload/signature');
      console.log('Signature response:', signatureResponse.data);
      const { signature, timestamp, cloudname, apikey } = signatureResponse.data;

      // 2. Upload image directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apikey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', 'NovelVerse_Uploads');

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudname}/image/upload`;
      console.log('Uploading to Cloudinary...');
      const cloudinaryResponse = await axios.post(cloudinaryUrl, formData);
      console.log('Cloudinary response:', cloudinaryResponse.data);

      setCoverImage(cloudinaryResponse.data.secure_url);
      console.log('Set cover image state to:', cloudinaryResponse.data.secure_url);
    } catch (error) {
      console.error('Failed to upload image', error);
      if (error.response) {
        console.error('Cloudinary error response:', error.response.data);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Submitting book with coverImage:', coverImage);
      await api.post('/books', { title, authors: [author], description, thumbnail: coverImage, coverImage: coverImage });
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
