// File: server/controllers/postController.js
// This is the "brain" for all post-related actions.

import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = async (req, res) => {
    try {
        const { content, taggedBook, category } = req.body;
        
        const newPost = new Post({
            content,
            author: req.user.id, // This comes from the authMiddleware
            taggedBook: taggedBook || null,
            category: category || 'Discussion',
        });

        let post = await newPost.save();
        
        // Return the post with author details populated, including the fix
        post = await post.populate('author', 'username profilePicture role isVerified'); // <-- THE FIX
        if (post.taggedBook) {
            post = await post.populate('taggedBook', 'title coverImage');
        }

        res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Get posts for the main feed
 * @route   GET /api/posts/feed
 * @access  Private
 */
export const getFeedPosts = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const following = [...currentUser.following, req.user.id]; // Include user's own posts

        const posts = await Post.find({ author: { $in: following } })
            .populate('author', 'username profilePicture role isVerified') // <-- THE FIX
            .populate('taggedBook', 'title coverImage authorName')
            .populate('comments') // We just need the count here for the feed
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching feed posts:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Add a comment to a post
 * @route   POST /api/posts/:id/comments
 * @access  Private
 */
export const addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = new Comment({
            content: req.body.content,
            author: req.user.id,
            post: req.params.id,
        });

        const comment = await newComment.save();
        post.comments.push(comment._id);
        await post.save();

        // Populate the comment with author details before sending back
        const populatedComment = await Comment.findById(comment._id)
            .populate('author', 'username profilePicture role isVerified'); // <-- THE FIX
            
        res.status(201).json(populatedComment);
    } catch (error) {
        console.error('Error adding comment:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Add other post-related functions here as needed (like getPostById, likePost, etc.)
// Make sure to add the .populate('author', '... isVerified') fix to all of them.
