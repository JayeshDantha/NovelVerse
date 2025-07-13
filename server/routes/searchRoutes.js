// server/routes/searchRoutes.js

const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');

// @route   GET /api/search
// @desc    Universal search for users and books
// @access  Public
router.get('/', async (req, res) => {
  const searchTerm = req.query.q;

  if (!searchTerm) {
    return res.status(400).json({ message: 'Search term is required' });
  }

  try {
    // We will search for users and books in parallel to be fast
    const [userResults, bookResults] = await Promise.all([
      // User Search from our database
      User.find({
        username: { $regex: searchTerm, $options: 'i' }
      })
      .limit(3) // Limit to 3 user results
      .select('username profilePicture isVerified'),

      // Book Search from Google Books API
      axios.get(`https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&maxResults=3&key=${process.env.GOOGLE_BOOKS_API_KEY}`)
    ]);

    // Format the book results to be cleaner
    const formattedBooks = bookResults.data.items ? bookResults.data.items.map(book => ({
        id: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors || [],
        thumbnail: book.volumeInfo.imageLinks?.thumbnail
    })) : [];


    res.json({ users: userResults, books: formattedBooks });

  } catch (error) {
    console.error("Universal search error:", error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;