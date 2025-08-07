const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const BookClub = require('../models/BookClub');
const Post = require('../models/Post');
const User = require('../models/User');
const { getRecommendedClubs } = require('../controllers/bookClubController');

// @route   POST /api/bookclubs
// @desc    Create a new book club
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, description, coverImage } = req.body;
  try {
    const newBookClub = new BookClub({
      name,
      description,
      coverImage,
      createdBy: req.user.id,
      members: [req.user.id],
    });
    const bookClub = await newBookClub.save();
    res.json(bookClub);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/bookclubs/recommendations
// @desc    Get recommended book clubs
// @access  Private
router.get('/recommendations', auth, getRecommendedClubs);

// @route   GET /api/bookclubs
// @desc    Get all book clubs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const bookClubs = await BookClub.find().populate('createdBy', 'username');
    res.json(bookClubs);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/bookclubs/:id
// @desc    Update a book club
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, description, coverImage } = req.body;
  try {
    let bookClub = await BookClub.findById(req.params.id);
    if (!bookClub) {
      return res.status(404).json({ msg: 'Book club not found' });
    }
    if (bookClub.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    bookClub = await BookClub.findByIdAndUpdate(
      req.params.id,
      { $set: { name, description, coverImage } },
      { new: true }
    );
    res.json(bookClub);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/bookclubs/:id
// @desc    Get a single book club
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const bookClub = await BookClub.findById(req.params.id)
      .populate('createdBy', 'username profilePicture')
      .populate('members', 'username profilePicture');
    if (!bookClub) {
      return res.status(404).json({ msg: 'Book club not found' });
    }
    res.json(bookClub);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/bookclubs/:id/join
// @desc    Join a book club
// @access  Private
router.put('/:id/join', auth, async (req, res) => {
  try {
    const bookClub = await BookClub.findById(req.params.id);
    if (!bookClub) {
      return res.status(404).json({ msg: 'Book club not found' });
    }
    if (bookClub.members.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Already a member' });
    }
    bookClub.members.push(req.user.id);
    await bookClub.save();
    res.json(bookClub.members);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/bookclubs/:id/leave
// @desc    Leave a book club
// @access  Private
router.put('/:id/leave', auth, async (req, res) => {
  try {
    const bookClub = await BookClub.findById(req.params.id);
    if (!bookClub) {
      return res.status(404).json({ msg: 'Book club not found' });
    }
    if (!bookClub.members.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Not a member' });
    }
    bookClub.members = bookClub.members.filter(
      (member) => member.toString() !== req.user.id
    );
    await bookClub.save();
    res.json(bookClub.members);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/bookclubs/:id/posts
// @desc    Create a post in a book club
// @access  Private
router.post('/:id/posts', auth, async (req, res) => {
  try {
    const bookClub = await BookClub.findById(req.params.id);
    if (!bookClub) {
      return res.status(404).json({ msg: 'Book club not found' });
    }
    if (!bookClub.members.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Must be a member to post' });
    }
    const { content, novelId } = req.body;
    const newPost = new Post({
      content,
      novel: novelId,
      user: req.user.id,
      postType: 'discussion',
    });
    const post = await newPost.save();
    bookClub.posts.push(post._id);
    await bookClub.save();
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/bookclubs/:id/posts
// @desc    Get all posts in a book club
// @access  Public
router.get('/:id/posts', async (req, res) => {
  try {
    const bookClub = await BookClub.findById(req.params.id).populate({
      path: 'posts',
      populate: {
        path: 'user',
        select: 'username profilePicture isVerified',
      },
    });
    if (!bookClub) {
      return res.status(404).json({ msg: 'Book club not found' });
    }
    res.json(bookClub.posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
