// client/src/pages/UserSearchPage.jsx

import React, { useState, useEffect } from 'react';
import { Container, TextField, Typography, Box, List, CircularProgress } from '@mui/material';
import UserResultCard from '../components/UserResultCard';
import api from '../api/api';

const UserSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If the search term is empty, clear the results and do nothing else.
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    // This is a "debouncing" timer. It waits 500ms after the user stops typing.
    const delayDebounceFn = setTimeout(() => {
      const searchUsers = async () => {
        try {
          // Call our new backend endpoint
          const { data } = await api.get(`/users/search?q=${searchTerm}`);
          setResults(data);
        } catch (error) {
          console.error('Failed to search for users', error);
          setResults([]); // Clear results on error
        } finally {
          setLoading(false);
        }
      };
      
      searchUsers();
    }, 500);

    // This is a cleanup function that clears the timer if the user types again.
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]); // This effect re-runs every time the searchTerm changes

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search for Users
      </Typography>
      <TextField
        fullWidth
        label="Find authors and readers..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
      />

      {loading && <CircularProgress sx={{ display: 'block', margin: 'auto' }} />}

      {!loading && (
        <List>
          {results.length > 0 ? (
            results.map((user) => (
              <UserResultCard key={user._id} user={user} />
            ))
          ) : (
            searchTerm && <Typography>No users found.</Typography>
          )}
        </List>
      )}
    </Container>
  );
};

export default UserSearchPage;