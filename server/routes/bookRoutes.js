// server/routes/bookRoutes.js - FINAL COMPLETE VERSION

const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');
const Novel = require('../models/Novel');
const BookshelfItem = require('../models/BookshelfItem');
const User = require('../models/User');

// @route   GET /api/books/search?q=...
router.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=20`;

  try {
    const response = await axios.get(url);
    const items = response.data.items || [];
    const books = items.map(item => {
        let coverImage = item.volumeInfo.imageLinks?.large || item.volumeInfo.imageLinks?.medium || item.volumeInfo.imageLinks?.thumbnail || item.volumeInfo.imageLinks?.smallThumbnail;
        if (coverImage) {
          coverImage = coverImage.replace('http://', 'https://');
        }
        return {
          googleBooksId: item.id,
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors || ['N/A'],
          description: item.volumeInfo.description,
          pageCount: item.volumeInfo.pageCount,
          categories: item.volumeInfo.categories,
          thumbnail: coverImage, 
          coverImage: coverImage,
          publishedDate: item.volumeInfo.publishedDate,
        };
    });
    res.json(books);
  } catch (error) {
    console.error('Google Books API Error:', error.message);
    res.status(500).send('Error searching for books');
  }
});

// @route   GET /api/books/details/:googleBooksId
router.get('/details/:googleBooksId', async (req, res) => {
  const { googleBooksId } = req.params;
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `https://www.googleapis.com/books/v1/volumes/${googleBooksId}?key=${apiKey}`;
  try {
    const response = await axios.get(url);
    const item = response.data;
    const volumeInfo = item.volumeInfo;
    let coverImage = volumeInfo.imageLinks?.large || volumeInfo.imageLinks?.medium || volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;
    if (coverImage) {
      coverImage = coverImage.replace('http://', 'https://');
    }
    const bookDetails = {
      googleBooksId: item.id, title: volumeInfo.title, subtitle: volumeInfo.subtitle,
      authors: volumeInfo.authors || ['N/A'], description: volumeInfo.description, pageCount: volumeInfo.pageCount,
      categories: volumeInfo.categories, coverImage: coverImage, publishedDate: volumeInfo.publishedDate,
      publisher: volumeInfo.publisher,
    };
    res.json(bookDetails);
  } catch (error) {
    console.error('Single Book API Error:', error.message);
    res.status(500).send('Error fetching book details');
  }
});

// @route   GET /api/books/view/:googleBooksId
router.get('/view/:googleBooksId', authMiddleware, async (req, res) => {
  const { googleBooksId } = req.params;
  const userId = req.user.id;
  try {
    const [bookDetailsRes, novelInDb] = await Promise.all([
      axios.get(`https://www.googleapis.com/books/v1/volumes/${googleBooksId}?key=${process.env.GOOGLE_BOOKS_API_KEY}`),
      Novel.findOne({ googleBooksId: googleBooksId })
    ]);
    
    let shelfItem = null;
    if (novelInDb) {
      shelfItem = await BookshelfItem.findOne({ user: userId, novel: novelInDb._id });
    }

    const item = bookDetailsRes.data;
    const volumeInfo = item.volumeInfo;
    let coverImage = volumeInfo.imageLinks?.large || volumeInfo.imageLinks?.medium || volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;
    if (coverImage) {
      coverImage = coverImage.replace('http://', 'https://');
    }
    const formattedDetails = {
      googleBooksId: item.id, title: volumeInfo.title, subtitle: volumeInfo.subtitle,
      authors: volumeInfo.authors || ['N/A'], description: volumeInfo.description, pageCount: volumeInfo.pageCount,
      categories: volumeInfo.categories, coverImage: coverImage, publishedDate: volumeInfo.publishedDate,
      publisher: volumeInfo.publisher,
    };
    res.json({ bookDetails: formattedDetails, shelfItem: shelfItem });
  } catch (error) {
    console.error("View Book Error:", error.message);
    res.status(500).send('Error fetching book data');
  }
});

// @route   GET /api/books/bookshelf/my-shelf
router.get('/bookshelf/my-shelf', authMiddleware, async (req, res) => {
    try {
        const shelfItems = await BookshelfItem.find({ user: req.user.id })
            .select('status novel')
            .populate('novel', 'googleBooksId');
        res.json(shelfItems);
    } catch (error) {
        console.error("Error fetching user's shelf:", error);
        res.status(500).send("Server Error");
    }
});

// @route   GET /api/books/bookshelf/:username
router.get('/bookshelf/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const shelfItems = await BookshelfItem.find({ user: user._id })
            .populate('novel');
        res.json(shelfItems);
    } catch (error) {
        console.error("Error fetching user's public shelf:", error);
        res.status(500).send("Server Error");
    }
});

// @route   POST /api/books/bookshelf
// @desc    Add or update a book on a user's bookshelf (Truly Self-healing)
router.post('/bookshelf', authMiddleware, async (req, res) => {
  const { status, bookData } = req.body;
  const userId = req.user.id;

  if (!status || !bookData || !bookData.googleBooksId) {
    return res.status(400).json({ message: 'Status and book data are required.' });
  }

  try {
    let novel = await Novel.findOne({ googleBooksId: bookData.googleBooksId });

    if (novel) {
      // --- THIS IS THE NEW, TRULY SELF-HEALING LOGIC ---
      if (!novel.thumbnail) {
        console.log(`Novel '${novel.title}' found but is missing an image. Fetching fresh data to repair...`);
        
        // If the novel exists but is missing data, make a fresh API call to Google.
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
        const url = `https://www.googleapis.com/books/v1/volumes/${novel.googleBooksId}?key=${apiKey}`;
        const response = await axios.get(url);
        const volumeInfo = response.data.volumeInfo;

        let coverImage = volumeInfo.imageLinks?.large || volumeInfo.imageLinks?.medium || volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;
        if (coverImage) {
          coverImage = coverImage.replace('http://', 'https://');
        }

        // Update the document in our database with the new, complete data
        novel.title = volumeInfo.title || novel.title;
        novel.authors = volumeInfo.authors || novel.authors;
        novel.description = volumeInfo.description || novel.description;
        novel.thumbnail = coverImage;
        novel.coverImage = coverImage;
        await novel.save();
        console.log(`Novel '${novel.title}' has been successfully repaired.`);
      }
    } else {
      // This logic is for brand new books and is already correct.
      novel = new Novel({
        googleBooksId: bookData.googleBooksId,
        title: bookData.title,
        authors: bookData.authors,
        description: bookData.description,
        pageCount: bookData.pageCount,
        categories: bookData.categories,
        thumbnail: bookData.thumbnail,
        coverImage: bookData.coverImage || bookData.thumbnail,
        publishedDate: bookData.publishedDate,
      });
      await novel.save();
    }

    const bookshelfItem = await BookshelfItem.findOneAndUpdate(
      { user: userId, novel: novel._id },
      { $set: { status: status } },
      { new: true, upsert: true }
    ).populate('novel');

    res.status(200).json(bookshelfItem);
  } catch (error) {
    console.error('Bookshelf Error:', error);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/books/bookshelf/progress
// @desc    Update reading progress for a book on the shelf
// @access  Private
router.put('/bookshelf/progress', authMiddleware, async (req, res) => {
  const { bookshelfItemId, totalPages, pagesRead } = req.body;
  const userId = req.user.id;

  if (!bookshelfItemId) {
    return res.status(400).json({ message: 'Bookshelf item ID is required.' });
  }

  try {
    // Find the specific item on the shelf
    const shelfItem = await BookshelfItem.findById(bookshelfItemId);

    // Security check: ensure the item belongs to the logged-in user
    if (!shelfItem || shelfItem.user.toString() !== userId) {
      return res.status(404).json({ message: 'Bookshelf item not found.' });
    }

    // Update the fields if they were provided
    if (totalPages !== undefined) {
      shelfItem.totalPages = totalPages;
    }
    if (pagesRead !== undefined) {
      // Basic validation
      shelfItem.pagesRead = Math.min(pagesRead, shelfItem.totalPages);
    }

    // If all pages are read, automatically move the book to the 'read' shelf
    if (shelfItem.pagesRead > 0 && shelfItem.pagesRead === shelfItem.totalPages) {
        shelfItem.status = 'read';
        shelfItem.dateFinished = new Date();
    }


    const updatedItem = await shelfItem.save();
    res.status(200).json(updatedItem);

  } catch (error) {
    console.error('Error updating reading progress:', error);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/books/bookshelf/:bookshelfItemId
// @desc    Remove a book from a user's bookshelf
// @access  Private
router.delete('/bookshelf/:bookshelfItemId', authMiddleware, async (req, res) => {
  const { bookshelfItemId } = req.params;
  const userId = req.user.id;

  try {
    const shelfItem = await BookshelfItem.findById(bookshelfItemId);

    if (!shelfItem) {
      return res.status(404).json({ message: 'Bookshelf item not found.' });
    }

    // Security check: Ensure the item belongs to the logged-in user
    if (shelfItem.user.toString() !== userId) {
      return res.status(403).json({ message: 'User not authorized to delete this item.' });
    }

    await shelfItem.deleteOne();

    res.status(200).json({ message: 'Book removed from shelf successfully.' });

  } catch (error) {
    console.error('Error removing book from shelf:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;