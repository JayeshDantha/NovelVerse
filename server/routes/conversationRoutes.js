// server/routes/conversationRoutes.js - FINAL SIMPLIFIED VERSION

const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Route 1: Start a new conversation (Unchanged)
router.post('/', async (req, res) => {
  try {
    const existingConversation = await Conversation.findOne({
      members: { $all: [req.body.senderId, req.body.receiverId] },
    });
    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }
  } catch(err) {
    console.log("Could not check for existing conversation, proceeding to create.", err)
  }
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });
  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Route 2: Get all conversations of a user (Simplified)
router.get('/:userId', async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.params.userId] },
    }).sort({ updatedAt: -1 });

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
            conversationId: conv._id,
            isRead: false,
            senderId: { $ne: req.params.userId } 
        });

        const lastMessage = await Message.findOne({
          conversationId: conv._id,
        }).sort({ createdAt: -1 });

        // NOTE: We no longer calculate `isOnline` here.
        return {
          ...conv._doc,
          lastMessage: lastMessage ? { text: lastMessage.text, createdAt: lastMessage.createdAt } : null,
          hasUnread: unreadCount > 0,
        };
      })
    );

    res.status(200).json(conversationsWithDetails);
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
});

module.exports = router;