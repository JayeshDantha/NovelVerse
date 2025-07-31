// client/src/components/BookResultCard.jsx - FINAL CLEANUP

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Box, Button, Menu, MenuItem, CardActions } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import api from '../api/api';

function BookResultCard({ book, shelfStatus, onShelfChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => { setAnchorEl(null); };
  
  const handleAddToShelf = async (status) => {
    event.stopPropagation();
    event.preventDefault();
    handleClose(); 

    const payload = { status: status, bookData: book };
    try {
      await api.post('/books/bookshelf', payload);
      alert(`'${book.title}' updated on your shelf!`);
      if (onShelfChange) {
        onShelfChange();
      }
    } catch (error) {
      console.error('Failed to add book to shelf:', error);
      alert('Error: Could not update shelf.');
    }
  };

  const getButtonContent = () => {
    if (!shelfStatus) {
      return { text: 'Add to Shelf', variant: 'contained', color: 'primary' };
    }
    switch (shelfStatus) {
      case 'read':
        return { text: 'Read', variant: 'contained', color: 'success' };
      case 'reading':
        return { text: 'Reading', variant: 'contained', color: 'info' };
      case 'want_to_read':
        return { text: 'Want to Read', variant: 'contained', color: 'secondary' };
      default:
        return { text: 'Add to Shelf', variant: 'contained', color: 'primary' };
    }
  };
  const buttonContent = getButtonContent();

  return (
    <Card 
      elevation={0} 
      component={Link}
      to={`/book/${book.googleBooksId}`}
      sx={{ 
        borderRadius: '20px', 
        textDecoration: 'none', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        border: '1px solid #E0E0E0',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }
      }}
    >
      <CardMedia 
        component="img" 
        sx={{ height: 220, objectFit: 'cover' }} 
        // --- THIS IS THE CORRECTED LINE ---
        image={book.thumbnail || 'https://placehold.co/150x220'} 
        alt={book.title} 
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: '3em' }}>{book.title}</Typography>
        <Typography variant="body2" color="text.secondary">by {book.authors.join(', ')}</Typography>
      </CardContent>
      <Box sx={{ flexGrow: 1 }} /> 
      <CardActions sx={{ p: 2 }}>
        <Button 
          variant={buttonContent.variant} 
          color={buttonContent.color} 
          size="small" 
          onClick={handleClick} 
          sx={{
            width: '100%', 
            borderRadius: '999px', 
            fontWeight: 'bold'
          }} 
          startIcon={shelfStatus ? <CheckCircleOutlineIcon /> : null}
        >
          {buttonContent.text}
        </Button>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={() => handleAddToShelf('want_to_read')}>Want to Read</MenuItem>
          <MenuItem onClick={() => handleAddToShelf('reading')}>Currently Reading</MenuItem>
          <MenuItem onClick={() => handleAddToShelf('read')}>Read</MenuItem>
        </Menu>
      </CardActions>
    </Card>
  );
}

export default BookResultCard;
