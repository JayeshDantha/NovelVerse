// server/models/Novel.js - UPGRADED VERSION

const mongoose = require('mongoose');

const NovelSchema = new mongoose.Schema({
  // This will be the unique ID from the Google Books API
  googleBooksId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  authors: {
    type: [String],
    required: true,
  },
  description: {
    type: String,
  },
  pageCount: {
    type: Number,
  },
  categories: {
    type: [String],
  },
  thumbnail: { // Small cover image
    type: String,
  },
  coverImage: { // Large cover image
    type: String,
  },
  publishedDate: {
    type: String,
  },
  publisher: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Novel', NovelSchema);
