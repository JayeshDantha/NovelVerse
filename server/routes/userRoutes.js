// server/routes/userRoutes.js - MERGED WITH NEW GET USER ROUTE

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const { getUser } = require('../socketManager');


// --- ADDED FOR CHAT FEATURE: Get a user by ID or Username ---
// This route is used by the Conversation component to get a friend's details.
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't send back sensitive info
    const { password, updatedAt, ...other } = user._doc; 
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});
// --- END OF ADDITION ---

// @route   GET /api/users/search
// @desc    Search for users by username
// @access  Private (requires login)
router.get('/search', authMiddleware, async (req, res) => {
  // The search term is passed as a query parameter (e.g., ?q=jayesh)
  const searchTerm = req.query.q;

  if (!searchTerm) {
    return res.status(400).json({ message: 'Search term is required' });
  }

  try {
    // Use a regular expression for a case-insensitive partial search
    const users = await User.find({
      username: { $regex: searchTerm, $options: 'i' }
    })
    .limit(10) // Limit to 10 results to keep it fast
    .select('username profilePicture isVerified');

    res.json(users);
  } catch (error) {
    console.error("User search error:", error);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/:username
// @desc    Get user profile and their posts
// @access  Public
// YOUR EXISTING CODE - UNCHANGED
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'username')
      .populate('following', 'username');
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postsFromDb = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePicture')
      .populate('novel', 'title googleBooksId');

    const posts = await Promise.all(postsFromDb.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        return { ...post.toObject(), id: post._id, commentCount, user: post.user, novel: post.novel };
    }));

    res.json({ user, posts });

  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
// YOUR EXISTING CODE - UNCHANGED
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    user = await User.findOne({ username });
    if (user) {
        return res.status(400).json({ message: 'Username is already taken' });
    }

    user = new User({
      username,
      email,
      password,
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
        username: user.username
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
// YOUR EXISTING CODE - UNCHANGED
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        username: user.username
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/profile
// @desc    Update a user's own profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, username, bio, location, website, birthDate, profilePicture, coverPhoto } = req.body;
  const profileFields = {};
  if (name !== undefined) profileFields.name = name;
  if (bio !== undefined) profileFields.bio = bio;
  if (location !== undefined) profileFields.location = location;
  if (website !== undefined) profileFields.website = website;
  if (birthDate !== undefined) profileFields.birthDate = birthDate;
  if (profilePicture !== undefined) profileFields.profilePicture = profilePicture;
  if (coverPhoto !== undefined) profileFields.coverPhoto = coverPhoto;

  try {
    if (username) {
      const userByUsername = await User.findOne({ username: username });
      if (userByUsername && userByUsername._id.toString() !== req.user.id) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      profileFields.username = username;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    if (profileFields.username) {
      const payload = {
        user: {
          id: user.id,
          username: user.username
        },
      };
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5h' },
        (err, token) => {
          if (err) throw err;
          res.json({ user, token });
        }
      );
    } else {
      res.json({ user });
    }

  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).send('Server Error');
  }
});
// @route   PUT /api/users/heartbeat
// @desc    Update the user's lastSeen timestamp
// @access  Private
router.put('/heartbeat', authMiddleware, async (req, res) => {
  try {
    // Find the user by their ID (from the auth token)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update their lastSeen timestamp to the current time
    user.lastSeen = new Date();
    await user.save();

    res.status(200).json({ message: 'Heartbeat updated' });
  } catch (error) {
    console.error("Heartbeat error:", error);
    res.status(500).send('Server Error');
  }
});



// @route   POST /api/users/feedback
// @desc    Provide negative feedback on a post
// @access  Private
router.post('/feedback', authMiddleware, async (req, res) => {
  const { postId, reason } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store the feedback in a new field in the user model
    // We'll need to add this field to the User model
    user.feedback.push({ postId, reason });
    await user.save();

    res.status(200).json({ message: 'Feedback received' });
  } catch (error) {
    console.error("Feedback error:", error);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/:id/follow
// @desc    Follow or unfollow a user
// @access  Private (requires login)
// YOUR EXISTING CODE - UNCHANGED
router.put('/:id/follow', authMiddleware, async (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user.id;

  if (targetUserId === currentUserId) {
    return res.status(400).json({ message: "You cannot follow yourself." });
  }

  try {
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    if (currentUser.following.includes(targetUserId)) {
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
      await currentUser.save();
      await targetUser.save();
      res.status(200).json({ message: "User unfollowed successfully." });
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
      await currentUser.save();
      await targetUser.save();

      // --- NOTIFICATION LOGIC ---
      const newNotification = new Notification({
        recipient: targetUserId,
        sender: currentUserId,
        type: 'follow',
        entityId: currentUserId, // For a follow, the entity is the user who followed.
      });
      await newNotification.save();

      // Send real-time notification if the user is online
      const recipientSocket = getUser(targetUserId);
      if (recipientSocket) {
        req.io.to(recipientSocket.socketId).emit('getNotification', {
          senderName: currentUser.username,
          type: 'follow',
        });
      }
      // --- END NOTIFICATION LOGIC ---

      res.status(200).json({ message: "User followed successfully." });
    }
  } catch (error) {
    console.error("Follow/Unfollow Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
