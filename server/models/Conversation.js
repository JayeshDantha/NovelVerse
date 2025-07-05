// server/models/Conversation.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema(
  {
    members: {
      type: [String], // An array of user IDs
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', ConversationSchema);