const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BookshelfItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  novel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Novel',
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['want_to_read', 'reading', 'read'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
  dateStarted: {
    type: Date,
  },
  dateFinished: {
    type: Date,
  },
  // --- ADDED FOR READING PROGRESS ---
  totalPages: {
    type: Number,
    default: 0,
    min: 0,
  },
  pagesRead: {
    type: Number,
    default: 0,
    min: 0,
  },
  // --- END OF ADDITION ---
}, { timestamps: true });

// Ensure a user can only have one entry per book
BookshelfItemSchema.index({ user: 1, novel: 1 }, { unique: true });

module.exports = mongoose.model('BookshelfItem', BookshelfItemSchema);
