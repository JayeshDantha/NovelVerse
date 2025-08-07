const Post = require('../models/Post');
const User = require('../models/User');
const BookshelfItem = require('../models/BookshelfItem');
const Comment = require('../models/Comment');

const populateUserDetails = 'username profilePicture isVerified';

exports.getPersonalizedFeed = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get user data
    const currentUser = await User.findById(userId);
    const followingIds = currentUser.following;
    const userGenres = [...new Set((await BookshelfItem.find({ user: userId })).map(item => item.genres).flat())];
    const feedbackPostIds = currentUser.feedback.map(f => f.postId);

    // 2. Fetch all potentially relevant posts
    const allPosts = await Post.find({ 
      user: { $ne: userId },
      _id: { $nin: feedbackPostIds } // Exclude posts the user has given feedback on
    })
      .sort({ createdAt: -1 })
      .populate('user', populateUserDetails)
      .populate('novel', 'title googleBooksId genres');

    // 3. Score and rank the posts
    const scoredPosts = await Promise.all(allPosts.map(async (post) => {
      let score = 0;
      const isFollowed = followingIds.some(id => id.equals(post.user._id));
      const hasLiked = post.likes.some(id => id.equals(userId));
      const inGenre = post.novel && post.novel.genres && post.novel.genres.some(genre => userGenres.includes(genre));
      const commentCount = await Comment.countDocuments({ post: post._id });

      if (isFollowed) score += 5;
      if (hasLiked) score += 3;
      if (inGenre) score += 2;

      // Add recency score (e.g., posts from the last 24 hours get a boost)
      const hoursAgo = (Date.now() - new Date(post.createdAt).getTime()) / 3600000;
      if (hoursAgo < 24) score += 2;

      // Add popularity score
      score += post.likes.length;
      score += commentCount * 2; // Comments are worth more than likes

      return { ...post.toObject(), score, commentCount };
    }));

    // 4. Sort by score
    const sortedPosts = scoredPosts.sort((a, b) => b.score - a.score);

    res.json(sortedPosts);
  } catch (error) {
    console.error("Error fetching personalized feed:", error.message);
    res.status(500).send('Server Error');
  }
};
