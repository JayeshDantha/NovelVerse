import React, { useState } from 'react';
import { Container, Box, Typography, Button, TextField, CircularProgress, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

function CreateBookClubPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const navigate = useNavigate();

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
      const res = await api.post('/bookclubs', { name, description, coverImage });
      navigate(`/bookclubs/${res.data._id}`);
    } catch (error) {
      console.error('Failed to create book club', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create a New Book Club
        </Typography>
        <Paper elevation={0} sx={{ p: 4, borderRadius: '16px' }}>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Club Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required
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
              {loading ? <CircularProgress size={24} /> : 'Create Club'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default CreateBookClubPage;
