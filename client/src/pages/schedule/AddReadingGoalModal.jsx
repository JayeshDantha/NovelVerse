import React, { useState, useEffect, useContext } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Box,
  Alert,
  Grid,
  Typography,
  IconButton
} from '@mui/material';
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';
import CloseIcon from '@mui/icons-material/Close';

const AddReadingGoalModal = ({ open, onClose, onGoalAdded }) => {
  const { token } = useContext(AuthContext);
  const [readingShelf, setReadingShelf] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedBookId, setSelectedBookId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('20:00');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [pagesPerDay, setPagesPerDay] = useState(20);

  useEffect(() => {
    if (open && token) {
      const fetchReadingShelf = async () => {
        setLoadingBooks(true);
        setError('');
        try {
          const res = await api.get('/schedule/reading-shelf');
          setReadingShelf(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error('Failed to fetch reading shelf:', err);
          setError('Could not load your "Reading" shelf. Please try again.');
          setReadingShelf([]);
        } finally {
          setLoadingBooks(false);
        }
      };
      fetchReadingShelf();
    }
  }, [open, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookId) {
      setError('Please select a book.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        bookId: selectedBookId,
        startDate,
        startTime,
        durationMinutes: Number(durationMinutes),
        pagesPerDay: Number(pagesPerDay),
      };
      await api.post('/schedule/reading-goal', payload);
      onGoalAdded();
      handleClose();
    } catch (err) {
      console.error('Failed to create reading goal:', err);
      setError(err.response?.data?.message || 'An unknown error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedBookId('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setStartTime('20:00');
    setDurationMinutes(30);
    setPagesPerDay(20);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Add a New Reading Goal
        </Typography>
        <IconButton onClick={handleClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="book-select-label">Select a Book</InputLabel>
            <Select
              labelId="book-select-label"
              value={selectedBookId}
              label="Select a Book"
              onChange={(e) => setSelectedBookId(e.target.value)}
              disabled={loadingBooks}
            >
              {loadingBooks ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} /> Loading books...
                </MenuItem>
              ) : readingShelf.length > 0 ? (
                readingShelf.map((book) => (
                  <MenuItem key={book.googleBooksId} value={book.googleBooksId}>
                    {book.title}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  No books found on your 'Reading' shelf.
                </MenuItem>
              )}
            </Select>
          </FormControl>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Start Time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }} // 5 min
              />
            </Grid>
          </Grid>

          <TextField
            margin="normal"
            required
            fullWidth
            label="Daily Reading Duration (minutes)"
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            inputProps={{ min: 1 }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Daily Page Goal"
            type="number"
            value={pagesPerDay}
            onChange={(e) => setPagesPerDay(e.target.value)}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleClose} color="inherit" sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting} sx={{ borderRadius: '20px', px: 4 }}>
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Set Goal'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddReadingGoalModal;
