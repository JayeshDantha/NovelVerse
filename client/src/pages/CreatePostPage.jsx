// client/src/pages/CreatePostPage.jsx - FINAL CORRECTED VERSION

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Box, CircularProgress, Autocomplete, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import throttle from 'lodash.throttle';
import api from '../api/api';

function CreatePostPage() {
  const [content, setContent] = useState('');
  const [selectedNovel, setSelectedNovel] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postType, setPostType] = useState('review'); 

  const navigate = useNavigate();

  const fetchBookOptions = useMemo(
    () =>
      throttle(async (request, callback) => {
        try {
          const response = await api.get(`/books/search?q=${request.input}`);
          callback(response.data || []);
        } catch (error) {
          console.error("Failed to fetch book options:", error);
          callback([]);
        }
      }, 500),
    [],
  );

  useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions(selectedNovel ? [selectedNovel] : []);
      return undefined;
    }
    
    setLoading(true);
    fetchBookOptions({ input: inputValue }, (results) => {
      if (active) {
        let newOptions = [];
        if (selectedNovel) {
          newOptions = [selectedNovel];
        }
        if (results) {
          // --- FIX for Duplicate Key Warning ---
          // Filter out any results that might already be in the list
          const uniqueResults = results.filter(result => result.googleBooksId !== selectedNovel?.googleBooksId);
          newOptions = [...newOptions, ...uniqueResults];
        }
        setOptions(newOptions);
        setLoading(false);
      }
    });

    return () => { active = false; };
  }, [selectedNovel, inputValue, fetchBookOptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || !selectedNovel) {
      alert('Please write something and select a novel.');
      return;
    }

    try {
      const bookshelfRes = await api.post('/books/bookshelf', {
        status: 'read',
        bookData: selectedNovel,
      });

      const novelId = bookshelfRes.data.novel._id;

      // --- THIS IS THE MAIN BUG FIX ---
      // The URL is now correctly '/posts'
      await api.post('/posts', {
        content,
        novelId: novelId,
        postType: postType, 
      });

      navigate('/');
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Error creating post.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Share Your Thoughts
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Autocomplete
          id="novel-search-autocomplete"
          sx={{ mb: 2 }}
          options={options}
          getOptionLabel={(option) => option.title || ""}
          filterOptions={(x) => x}
          autoComplete
          includeInputInList
          filterSelectedOptions
          value={selectedNovel}
          isOptionEqualToValue={(option, value) => option.googleBooksId === value.googleBooksId}
          noOptionsText="No books found. Keep typing..."
          onChange={(event, newValue) => {
            setSelectedNovel(newValue);
          }}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search for the book you're talking about..."
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.googleBooksId}>
              {/* --- FIX for Grid v2 Syntax --- */}
              <Grid container alignItems="center" spacing={2}>
                <Grid>
                  <Box component="img" src={option.thumbnail} alt={option.title} sx={{height: 50}}/>
                </Grid>
                <Grid xs>
                  <Typography variant="body1">{option.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.authors?.join(', ')}
                  </Typography>
                </Grid>
              </Grid>
            </li>
          )}
        />
        
        <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
            <InputLabel id="post-type-select-label">Post Type</InputLabel>
            <Select
              labelId="post-type-select-label"
              value={postType}
              label="Post Type"
              onChange={(e) => setPostType(e.target.value)}
              required
            >
              <MenuItem value="review">Review</MenuItem>
              <MenuItem value="discussion">Discussion</MenuItem>
              <MenuItem value="quote">Quote</MenuItem>
            </Select>
        </FormControl>

        <TextField
          label="Write your review, discussion, or quote here..."
          multiline
          rows={8}
          fullWidth
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" size="large" fullWidth>
          Create Post
        </Button>
      </Box>
    </Container>
  );
}

export default CreatePostPage;