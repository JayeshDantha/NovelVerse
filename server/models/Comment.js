const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true,
  },
  // Reference to the User who wrote the comment
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Reference to the Post this comment belongs to
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment', // This links a comment to another comment
    default: null // Defaults to null if it's a top-level comment
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;