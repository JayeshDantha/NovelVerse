// server/routes/postRoutes.js - FINAL STABLE VERSION (with Verified Badge Fix)

const express = require('express');
const router = express.Router();
// --- THE FIX IS HERE ---
// Reverting to the original middleware import. This resolves the server crash.
const auth = require('../middleware/authMiddleware');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Novel = require('../models/Novel');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { getSocketsForUser } = require('../socketManager');

// --- HELPER FUNCTION TO ADD THE FIX IN ONE PLACE ---
// This function adds 'isVerified' to every user population call.
const populateUserDetails = 'username profilePicture isVerified';


// ROUTE 1: GET ALL POSTS
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('user', populateUserDetails) // <-- FIX APPLIED
      .populate('novel', 'title googleBooksId');

    const postsWithCommentCount = await Promise.all(posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        return { 
          ...post.toObject(),
          id: post._id, 
          commentCount,
          user: post.user,
          novel: post.novel
        };
    }));

    res.json(postsWithCommentCount);
  } catch (error) {
    console.error("Error fetching all posts:", error.message);
    res.status(500).send('Server Error');
  }
});


// ROUTE 2: GET A SINGLE POST
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = await Post.findById(req.params.id)
      .populate('user', populateUserDetails) // <-- FIX APPLIED
      .populate('novel', 'title googleBooksId');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const commentCount = await Comment.countDocuments({ post: post._id });
    const postWithCount = { ...post.toObject(), id: post._id, commentCount };
    
    res.json(postWithCount);
  } catch (error) {
    console.error("Error getting single post:", error.message);
    res.status(500).send('Server Error');
  }
});


// ROUTE 3: GET POSTS FOR A SPECIFIC BOOK (REVIEWS)
router.get('/book/:googleBooksId', async (req, res) => {
    try {
        const novel = await Novel.findOne({ googleBooksId: req.params.googleBooksId });
        if (!novel) return res.json([]);
        const posts = await Post.find({ novel: novel._id, postType: 'review' })
            .populate('user', populateUserDetails) // <-- FIX APPLIED
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error("Error fetching posts for book:", error);
        res.status(500).send('Server Error');
    }
});

// ROUTE 4: GET POSTS FOR A SPECIFIC BOOK (DISCUSSIONS)
router.get('/book/:googleBooksId/discussions', async (req, res) => {
    try {
        const novel = await Novel.findOne({ googleBooksId: req.params.googleBooksId });
        if (!novel) return res.json([]);
        const posts = await Post.find({ novel: novel._id, postType: { $in: ['discussion', 'quote'] } })
            .populate('user', populateUserDetails) // <-- FIX APPLIED
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error("Error fetching discussions for book:", error);
        res.status(500).send('Server Error');
    }
});

// ROUTE 5: CREATE A NEW POST
router.post('/', auth, async (req, res) => {
  try {
    const { content, novelId, postType } = req.body;
    if (!content || !novelId || !postType) {
        return res.status(400).json({ message: 'Missing content, novelId, or postType.' });
    }
    const newPost = new Post({ content, novel: novelId, postType, user: req.user.id });
    let post = await newPost.save();

    // --- IMPROVEMENT ---
    // We populate the post before sending it back.
    // This ensures the frontend gets the author's details (including the verified badge) immediately.
    post = await post.populate('user', populateUserDetails);
    
    res.status(201).json(post);
  } catch (error) {
    console.error("--- ERROR SAVING POST ---", error);
    res.status(500).send('Server Error');
  }
});

// ROUTE 6: LIKE/UNLIKE A POST
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user.id;
    const postAuthorId = post.user.toString();

    const index = post.likes.indexOf(userId);

    if (index === -1) {
      // User is liking the post
      post.likes.push(userId);

      // --- NOTIFICATION LOGIC ---
      // Only send a notification if the user is not liking their own post
      if (postAuthorId !== userId) {
        const newNotification = new Notification({
          recipient: postAuthorId,
          sender: userId,
          type: 'like',
          entityId: post._id,
        });
        await newNotification.save();

        // Send real-time notification if the user is online
        const recipientSockets = getSocketsForUser(postAuthorId);
        if (recipientSockets.length > 0) {
            recipientSockets.forEach(socket => {
                req.io.to(socket.socketId).emit('getNotification', {
                    senderName: req.user.username, // Assumes username is in the token payload
                    type: 'like',
                });
            });
        }
      }
      // --- END NOTIFICATION LOGIC ---
    } else {
      // User is unliking the post
      post.likes.splice(index, 1);
    }
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// ROUTE 7: DELETE A POST
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user owns the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Delete all comments associated with the post
    await Comment.deleteMany({ post: req.params.id });

    await post.deleteOne();

    res.json({ message: 'Post removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
