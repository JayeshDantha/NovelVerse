// client/src/components/CreatePostWidget.jsx - VISUALLY ENHANCED VERSION

import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, TextField, Button, Box, CircularProgress, Autocomplete, FormControl, InputLabel, Select, MenuItem, Grid, Paper, Collapse, IconButton, ListItemButton, ListItemText } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import throttle from 'lodash.throttle';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

function CreatePostWidget({ onPostSuccess, bookClubId }) {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [selectedNovel, setSelectedNovel] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postType, setPostType] = useState('review');
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchBookOptions = useMemo(() => throttle(async (request, callback) => {
    try {
      const response = await api.get(`/books/search?q=${request.input}`);
      callback(response.data || []);
    } catch (error) {
      console.error("Failed to fetch book options:", error);
      callback([]);
    }
  }, 500), []);

  useEffect(() => {
    let active = true;
    if (!isExpanded || inputValue === '') {
      setOptions(selectedNovel ? [selectedNovel] : []);
      return undefined;
    }
    setLoading(true);
    fetchBookOptions({ input: inputValue }, (results) => {
      if (active) {
        let newOptions = [];
        if (selectedNovel) { newOptions = [selectedNovel]; }
        if (results) {
          const uniqueResults = results.filter(result => result.googleBooksId !== selectedNovel?.googleBooksId);
          newOptions = [...newOptions, ...uniqueResults];
        }
        setOptions(newOptions);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [selectedNovel, inputValue, fetchBookOptions, isExpanded]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || !selectedNovel) {
      alert('Please write something and select a novel.');
      return;
    }
    try {
      const bookshelfRes = await api.post('/books/bookshelf', { status: 'read', bookData: selectedNovel });
      const novelId = bookshelfRes.data.novel._id;
      if (bookClubId) {
        await api.post(`/bookclubs/${bookClubId}/posts`, { content, novelId, postType });
      } else {
        await api.post('/posts', { content, novelId, postType });
      }

      setContent('');
      setSelectedNovel(null);
      setOptions([]);
      setIsExpanded(false);
      if (onPostSuccess) {
          onPostSuccess();
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Error creating post.');
    }
  };

  const handleCancel = () => {
    setIsExpanded(false);
    setContent('');
    setSelectedNovel(null);
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 4,
        borderRadius: '20px',
        border: '1px solid #E0E0E0',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          placeholder={user ? `What's on your mind, ${user.username}?` : "What's on your mind?"}
          multiline
          rows={isExpanded ? 3 : 1}
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          sx={{ 
            '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: '#F5F5F5',
                '& fieldset': {
                    border: 'none',
                },
                '&:hover fieldset': {
                    border: 'none',
                },
                '&.Mui-focused fieldset': {
                    border: '1px solid',
                    borderColor: 'primary.main',
                },
            },
          }}
        />
        
        <Collapse in={isExpanded}>
          <Box sx={{mt: 2, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)'}}>
            <Autocomplete
              id="novel-search-widget"
              sx={{ mb: 2 }}
              options={options}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.title}
              filterOptions={(x) => x}
              autoComplete
              includeInputInList
              filterSelectedOptions
              value={selectedNovel}
              isOptionEqualToValue={(option, value) => option.googleBooksId === value.googleBooksId}
              noOptionsText="No books found. Keep typing..."
              onChange={(event, newValue) => { setSelectedNovel(newValue); }}
              onInputChange={(event, newInputValue) => { setInputValue(newInputValue); }}
              renderInput={(params) => (
                <TextField {...params} label="Tag a book..." fullWidth InputProps={{ ...params.InputProps, endAdornment: (<>{loading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>),}}/>
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.googleBooksId}>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item><Box component="img" src={option.thumbnail} alt={option.title} sx={{height: 50, borderRadius: 1}}/></Grid>
                    <Grid item xs><Typography variant="body1">{option.title}</Typography><Typography variant="body2" color="text.secondary">{option.authors?.join(', ')}</Typography></Grid>
                  </Grid>
                </li>
              )}
              ListboxComponent={(props) => (
                <ul {...props}>
                  {props.children}
                  <ListItemButton onClick={() => navigate('/add-book', { state: { searchTerm: inputValue } })}>
                    <ListItemText primary="Can't find your book? Add it manually." />
                  </ListItemButton>
                </ul>
              )}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Post Type</InputLabel>
                <Select value={postType} label="Post Type" onChange={(e) => setPostType(e.target.value)}>
                  <MenuItem value="review">Review</MenuItem>
                  <MenuItem value="discussion">Discussion</MenuItem>
                  <MenuItem value="quote">Quote</MenuItem>
                </Select>
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
              <Button onClick={handleCancel} sx={{color: 'text.secondary', fontWeight: 'bold'}}>Cancel</Button>
              <Button type="submit" variant="contained" sx={{ borderRadius: '999px', px: 3 }}>Post</Button>
            </Box>
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
}

export default CreatePostWidget;
