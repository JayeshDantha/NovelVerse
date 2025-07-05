// client/src/pages/SearchPage.jsx - FINAL CORRECTED VERSION

import React, { useState, useEffect, useContext } from 'react'; // Import useContext
import { Container, Typography, TextField, Box, Button, CircularProgress } from '@mui/material';
import api from '../api/api';
import BookResultCard from '../components/BookResultCard';
import { AuthContext } from '../context/AuthContext'; // Import the AuthContext

function SearchPage() {
  const { user } = useContext(AuthContext); // Get the logged-in user state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [myShelf, setMyShelf] = useState(new Map());

  const fetchMyShelf = async () => {
    try {
      const res = await api.get('/books/bookshelf/my-shelf');
      const shelfMap = new Map(res.data.map(item => [item.novel.googleBooksId, item.status]));
      setMyShelf(shelfMap);
    } catch (error) {
      console.error("Could not fetch user shelf", error);
      // We don't want to show an error here if the user is just not logged in.
    }
  };

  // Fetch the user's shelf when the page first loads, ONLY if a user is logged in.
  useEffect(() => {
    if (user) {
      fetchMyShelf();
    }
  }, [user]); // This effect now depends on the user object

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/books/search?q=${query}`);
      setResults(res.data);
    } catch (error) {
      console.error("Failed to search for books:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Find Your Next Novel
      </Typography>
      
      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, mb: 4 }}>
        <TextField fullWidth variant="outlined" label="Search for a book..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button type="submit" variant="contained" sx={{ px: 4 }} disabled={loading}>Search</Button>
      </Box>

      <Box>
        {loading && <CircularProgress sx={{ display: 'block', margin: 'auto' }} />}
        {!loading && searched && results.length === 0 && (<Typography sx={{ textAlign: 'center', mt: 4 }}>No books found.</Typography>)}
        {!loading && results.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
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
  );
}

export default SearchPage;