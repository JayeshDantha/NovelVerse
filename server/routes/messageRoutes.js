// server/routes/messageRoutes.js - UPDATED

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Route 1: Add a new message (Unchanged)
router.post('/', async (req, res) => {
  const newMessage = new Message(req.body);
  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Route 2: Get all messages from a conversation (Unchanged)
router.get('/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

// --- ADDED: Route 3: Mark messages in a conversation as read ---
router.put('/read/:conversationId', async (req, res) => {
    try {
        await Message.updateMany(
            { conversationId: req.params.conversationId, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json("Messages marked as read.");
    } catch (err) {
        res.status(500).json(err);
    }
});


module.exports = router;