// server/routes/commentRoutes.js - FINAL STABLE VERSION (with Nested Reply Fix)

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');

const populateUserDetails = 'username profilePicture isVerified';

// This helper function handles the complex population for nested replies.
const populateCommentsRecursively = (comments) => {
    return Promise.all(comments.map(async (comment) => {
        // Populate the author of the current comment
        await comment.populate('user', populateUserDetails);
        
        // If there are children (replies), recursively populate them
        if (comment.children && comment.children.length > 0) {
            // Find the full comment documents for the children IDs
            const populatedChildren = await Comment.find({ '_id': { $in: comment.children } });
            // Recursively call the function for the children
            comment.children = await populateCommentsRecursively(populatedChildren);
        }
        return comment;
    }));
};

// ROUTE 1: GET ALL COMMENTS FOR A SINGLE POST
// --- THE FIX IS HERE ---
// The URL is changed back to /:postId to match what the frontend is calling.
router.get('/:postId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
            return res.status(400).json({ message: 'Invalid Post ID' });
        }

        // Fetch only top-level comments (comments that are not replies)
        const topLevelComments = await Comment.find({ 
            post: req.params.postId,
            parent: null 
        }).sort({ createdAt: -1 });
        
        // Use our new recursive function to populate everything correctly
        const populatedComments = await populateCommentsRecursively(topLevelComments);

        res.json(populatedComments);
    } catch (error) {
        console.error("Error fetching comments for post:", error);
        res.status(500).send('Server Error');
    }
});


// ROUTE 2: POST A NEW COMMENT OR REPLY
router.post('/', auth, async (req, res) => {
    try {
        const { content, postId, parentId } = req.body;
        if (!content || !postId) {
            return res.status(400).json({ message: 'Missing content or postId' });
        }

        const newComment = new Comment({
            content,
            post: postId,
            user: req.user.id,
            parent: parentId || null // Will be null for a top-level comment
        });

        let savedComment = await newComment.save();
        
        // If it's a reply, add it to the parent comment's children array
        if (parentId) {
            await Comment.findByIdAndUpdate(parentId, { $push: { children: savedComment._id } });
        }

        // Populate the new comment with author details before sending back
        savedComment = await savedComment.populate('user', populateUserDetails);
        
        res.status(201).json(savedComment);
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).send('Server Error');
    }
});


// ROUTE 3: LIKE/UNLIKE A COMMENT
router.put('/:id/like', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        
        const userId = req.user.id;
        const index = comment.likes.indexOf(userId);

        if (index === -1) {
            comment.likes.push(userId); // Like
        } else {
            comment.likes.splice(index, 1); // Unlike
        }

        await comment.save();
        res.json(comment.likes);
    } catch (error) {
        console.error("Error liking comment:", error.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
