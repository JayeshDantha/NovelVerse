import React, { useState } from 'react';
import { Card, CardMedia, CardContent, Typography, Box, LinearProgress, Button, Tooltip, Menu, MenuItem, IconButton, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import api from '../api/api';

const BookshelfCard = ({ shelfItem, onUpdateProgress, onShelfChange }) => {
  const { novel, pagesRead, totalPages, status } = shelfItem;
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.preventDefault(); // Prevent navigation when opening menu
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleStatusChange = async (newStatus) => {
    handleClose();
    try {
      await api.post('/books/bookshelf', { bookData: novel, status: newStatus });
      if (onShelfChange) onShelfChange(); // Refresh the profile page
    } catch (error) {
      console.error("Failed to change shelf status", error);
    }
  };
  const handleRemove = async () => {
    handleClose();
    try {
      await api.delete(`/books/bookshelf/${shelfItem._id}`);
      if (onShelfChange) onShelfChange(); // Refresh the profile page
    } catch (error) {
      console.error("Failed to remove book from shelf", error);
    }
  };

  const progress = totalPages > 0 ? (pagesRead / totalPages) * 100 : 0;
  const canUpdate = typeof onUpdateProgress === 'function';

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* The menu button is only shown if the onShelfChange prop is provided (i.e., it's your own shelf) */}
      {onShelfChange && (
        <>
          <IconButton
            aria-label="settings"
            onClick={handleClick}
            sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.7)', p: 0.5 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={() => handleStatusChange('reading')} disabled={status === 'reading'}>Currently Reading</MenuItem>
            <MenuItem onClick={() => handleStatusChange('want_to_read')} disabled={status === 'want_to_read'}>Want to Read</MenuItem>
            <MenuItem onClick={() => handleStatusChange('read')} disabled={status === 'read'}>Read</MenuItem>
            <Divider />
            <MenuItem onClick={handleRemove} sx={{ color: 'error.main' }}>
              Remove from Shelf
            </MenuItem>
          </Menu>
        </>
      )}

      <CardMedia
        component={Link}
        to={`/books/view/${novel.googleBooksId}`}
        image={novel.thumbnail || 'https://placehold.co/128x192/EEE/31343C?text=No+Image'}
        sx={{ height: 190, backgroundSize: 'contain', bgcolor: '#f5f5f5' }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 1.5 }}>
        <Tooltip title={novel.title}>
            <Typography gutterBottom variant="subtitle2" noWrap sx={{ fontWeight: 'bold' }}>
            {novel.title}
            </Typography>
        </Tooltip>
        
        {status === 'reading' && (
          <Box sx={{ mt: 'auto', pt: 1 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {pagesRead || 0} / {totalPages > 0 ? totalPages : '?'} pages
            </Typography>
            {canUpdate && (
                <Button size="small" variant="outlined" onClick={(e) => { e.preventDefault(); onUpdateProgress(shelfItem); }} fullWidth sx={{ mt: 1 }}>
                  Update Progress
                </Button>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default BookshelfCard;