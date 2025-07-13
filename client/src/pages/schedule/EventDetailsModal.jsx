import React, { useState, useContext } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Chip
} from '@mui/material';
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const EventDetailsModal = ({ event, open, onClose, onUpdate }) => {
  const { token } = useContext(AuthContext);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!event) return null;

  const handleMarkComplete = async () => {
    if (!token) return setError("Authentication error. Please log in again.");
    setSubmitting(true);
    setError('');
    try {
      await api.put(`/schedule/event/${event._id}/complete`);
      onUpdate();
      handleClose();
    } catch (err) {
      console.error('Failed to mark event as complete:', err);
      setError(err.response?.data?.message || 'Could not complete event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!token) return setError("Authentication error. Please log in again.");
    if (window.confirm('Are you sure you want to delete this entire reading goal? This action cannot be undone.')) {
      setSubmitting(true);
      setError('');
      try {
        await api.delete(`/schedule/group/${event.groupId}`);
        onUpdate();
        handleClose();
      } catch (err) {
        console.error('Failed to delete goal:', err);
        setError(err.response?.data?.message || 'Could not delete goal.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setError('');
    setSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          {event.title}
        </Typography>
        <IconButton onClick={handleClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <EventIcon color="action" sx={{ mr: 1.5 }} />
          <Typography variant="body1">
            {format(event.start, 'MMMM d, yyyy')}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <AccessTimeIcon color="action" sx={{ mr: 1.5 }} />
          <Typography variant="body1">
            {format(event.start, 'p')} - {format(event.end, 'p')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <MenuBookIcon color="action" sx={{ mr: 1.5 }} />
          <Typography variant="body1">
            Goal: Read {event.pagesToRead} pages
          </Typography>
        </Box>

        <Chip 
          icon={event.completed ? <CheckCircleOutlineIcon /> : <HighlightOffIcon />}
          label={event.completed ? 'Completed' : 'Pending'}
          color={event.completed ? 'success' : 'default'}
          variant="outlined"
        />
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          Deleting this goal will remove all scheduled reading blocks for this book.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={handleDeleteGoal} color="error" disabled={submitting}>
          Delete Goal
        </Button>
        {!event.completed ? (
          <Button onClick={handleMarkComplete} variant="contained" disabled={submitting} startIcon={<CheckCircleOutlineIcon />}>
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Mark as Complete'}
          </Button>
        ) : (
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EventDetailsModal;
