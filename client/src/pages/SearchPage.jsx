import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, TextField, Box, Button, CircularProgress, InputAdornment } from '@mui/material';
import api from '../api/api';
import BookResultCard from '../components/BookResultCard';
import { AuthContext } from '../context/AuthContext';
import SearchIcon from '@mui/icons-material/Search';

function SearchPage() {
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [myShelf, setMyShelf] = useState(new Map());

  const fetchMyShelf = async () => {
    if (!user) return;
    try {
      const res = await api.get('/books/bookshelf/my-shelf');
      const shelfMap = new Map(res.data.map(item => [item.novel.googleBooksId, item.status]));
      setMyShelf(shelfMap);
    } catch (error) {
      console.error("Could not fetch user shelf", error);
    }
  };

  useEffect(() => {
    fetchMyShelf();
  }, [user]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/books/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (error) {
      console.error("Failed to search for books:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: 'calc(100vh - 64px)',
      py: 4,
      px: 2,
      bgcolor: 'grey.100'
    }}>
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
          Find Your Next Novel
        </Typography>
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary', mb: 4 }}>
          Discover new worlds, one book at a time.
        </Typography>
        
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, mb: 4 }}>
          <TextField 
            fullWidth 
            variant="outlined" 
            placeholder="Search by title, author, or genre..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { borderRadius: '30px', bgcolor: 'background.paper' }
            }}
          />
          <Button type="submit" variant="contained" sx={{ borderRadius: '30px', px: 4 }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
          </Button>
        </Box>

        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : searched && results.length === 0 ? (
            <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
              No books found for "{query}". Try another search.
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
              {results.map((book) => (
                <BookResultCard 
                  key={book.googleBooksId} 
                  book={book} 
                  shelfStatus={myShelf.get(book.googleBooksId)}
                  onShelfChange={fetchMyShelf}
                />
              ))}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default SearchPage;
