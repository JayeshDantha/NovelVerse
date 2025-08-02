// /Users/jayeshdantha/Desktop/NovelVerse/server/routes/commentRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { getSocketsForUser } = require('../socketManager');

const populateUserDetails = 'username profilePicture isVerified';

// ROUTE 1: GET TOP-LEVEL COMMENTS FOR A POST
router.get('/:postId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
            return res.status(400).json({ message: 'Invalid Post ID' });
        }

        const comments = await Comment.find({ post: req.params.postId, parentComment: null })
            .populate('user', populateUserDetails)
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        console.error("Error fetching comments for post:", error);
        res.status(500).send('Server Error');
    }
});

// ROUTE 2: GET REPLIES FOR A COMMENT
router.get('/:commentId/replies', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.commentId)) {
            return res.status(400).json({ message: 'Invalid Comment ID' });
        }

        const replies = await Comment.find({ parentComment: req.params.commentId })
            .populate('user', populateUserDetails)
            .sort({ createdAt: 'asc' });

        res.json(replies);
    } catch (error) {
        console.error("Error fetching replies for comment:", error);
        res.status(500).send('Server Error');
    }
});


// ROUTE 3: POST A NEW COMMENT OR REPLY
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
            parentComment: parentId || null // Will be null for a top-level comment
        });

        let savedComment = await newComment.save();
        
        // If it's a reply, add it to the parent comment's children array
        if (parentId) {
            await Comment.findByIdAndUpdate(parentId, { $push: { children: savedComment._id } });
        }

        // --- NOTIFICATION LOGIC ---
        const post = await Post.findById(postId);
        const postAuthorId = post.user.toString();
        const commenterId = req.user.id;

        // Only notify if the commenter is not the post author
        if (postAuthorId !== commenterId) {
            const notification = new Notification({
                recipient: postAuthorId,
                sender: commenterId,
                type: 'comment',
                entityId: post._id,
            });
            await notification.save();

            const recipientSockets = getSocketsForUser(postAuthorId);
            if (recipientSockets.length > 0) {
                recipientSockets.forEach(socket => {
                    req.io.to(socket.socketId).emit('getNotification', {
                        senderName: req.user.username, // Assumes username is in the token payload
                        type: 'comment',
                    });
                });
            }
        }

        // --- NOTIFICATION LOGIC FOR REPLIES ---
        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            const parentCommentAuthorId = parentComment.user.toString();

            // Notify parent comment author, ONLY IF they are not the post author (to avoid double notifications)
            // AND they are not replying to their own comment.
            if (parentCommentAuthorId !== commenterId && parentCommentAuthorId !== postAuthorId) {
                const replyNotification = new Notification({
                    recipient: parentCommentAuthorId,
                    sender: commenterId,
                    type: 'reply',
                    entityId: post._id,
                });
                await replyNotification.save();

                const recipientSockets = getSocketsForUser(parentCommentAuthorId);
                if (recipientSockets.length > 0) {
                    recipientSockets.forEach(socket => {
                        req.io.to(socket.socketId).emit('getNotification', {
                            senderName: req.user.username,
                            type: 'reply',
                        });
                    });
                }
            }
        }
        // --- END NOTIFICATION LOGIC ---

        // Populate the new comment with author details before sending back
        savedComment = await savedComment.populate('user', populateUserDetails);
        
        if (parentId) {
            req.io.to(postId).emit('new reply', savedComment);
        } else {
            req.io.to(postId).emit('new comment', savedComment);
        }
        res.status(201).json(savedComment);
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).send('Server Error');
    }
});


// ROUTE 4: LIKE/UNLIKE A COMMENT
router.put('/:id/like', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        
        const userId = req.user.id;
        const index = comment.likes.indexOf(userId);

        if (index === -1) {
            comment.likes.push(userId); // Like

            // --- NOTIFICATION LOGIC FOR LIKING A COMMENT ---
            const commentAuthorId = comment.user.toString();

            // Only notify if the liker is not the comment author
            if (commentAuthorId !== userId) {
                const notification = new Notification({
                    recipient: commentAuthorId,
                    sender: userId,
                    type: 'like_comment',
                    entityId: comment.post, // Link back to the post containing the comment
                });
                await notification.save();

            const recipientSockets = getSocketsForUser(commentAuthorId);
            if (recipientSockets.length > 0) {
                recipientSockets.forEach(socket => {
                    req.io.to(socket.socketId).emit('getNotification', {
                        senderName: req.user.username,
                        type: 'like_comment',
                    });
                });
            }
            }
        } else {
            comment.likes.splice(index, 1); // Unlike
        }

        await comment.save();
        req.io.to(comment.post.toString()).emit('comment updated', comment);
        res.json(comment.likes);
    } catch (error) {
        console.error("Error liking comment:", error.message);
    res.status(500).send('Server Error');
  }
});

// ROUTE 5: DELETE A COMMENT
router.delete('/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if the user owns the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Recursively delete all replies
        const deleteReplies = async (commentId) => {
            const replies = await Comment.find({ parentComment: commentId });
            for (const reply of replies) {
                await deleteReplies(reply._id);
                await reply.deleteOne();
            }
        };

        await deleteReplies(req.params.id);
        await comment.deleteOne();

        res.json({ message: 'Comment removed' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
