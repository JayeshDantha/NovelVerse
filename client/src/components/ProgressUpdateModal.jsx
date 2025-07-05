import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  LinearProgress
} from '@mui/material';

const ProgressUpdateModal = ({ open, onClose, shelfItem, onSave }) => {
  const [pagesRead, setPagesRead] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // When the modal opens, pre-fill the form with existing data
  useEffect(() => {
    if (shelfItem) {
      setPagesRead(shelfItem.pagesRead || 0);
      setTotalPages(shelfItem.totalPages || shelfItem.novel?.pageCount || 0);
    }
  }, [shelfItem]);

  const handleSave = () => {
    // Pass the updated data back to the parent component to handle the API call
    onSave({
      bookshelfItemId: shelfItem._id,
      pagesRead: Number(pagesRead),
      totalPages: Number(totalPages),
    });
    onClose(); // Close the modal after saving
  };

  // Calculate progress for the progress bar
  const progress = totalPages > 0 ? (pagesRead / totalPages) * 100 : 0;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Update Reading Progress</DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          {shelfItem?.novel?.title}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Pages Read"
            type="number"
            value={pagesRead}
            onChange={(e) => setPagesRead(e.target.value)}
            fullWidth
            variant="outlined"
          />
          <TextField
            margin="dense"
            label="Total Pages"
            type="number"
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            fullWidth
            variant="outlined"
          />
        </Box>

        <Box sx={{ width: '100%', mt: 3 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            {Math.round(progress)}% Complete
          </Typography>
        </Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgressUpdateModal;
