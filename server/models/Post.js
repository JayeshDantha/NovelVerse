const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  // This is a reference to the User who created the post
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // This tells Mongoose to connect to the 'User' model
    required: true
  },
  // This is a reference to the Novel this post is about
  novel: {
    type: Schema.Types.ObjectId,
    ref: 'Novel', // This tells Mongoose to connect to the 'Novel' model
    required: true
  },
  postType: {
  type: String,
  required: true,
  enum: ['review', 'discussion', 'quote'] // <-- The corrected list
},
  imageUrl: {
    type: String,
    default: ''
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

postSchema.pre(/^find/, function(next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
