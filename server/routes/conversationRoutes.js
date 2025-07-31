// server/routes/conversationRoutes.js

const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Route 1: Start a new conversation or get an existing one (with cooldown logic).
router.post('/', async (req, res) => {
  try {
    const existingConversation = await Conversation.findOne({
      members: { $all: [req.body.senderId, req.body.receiverId] },
    });
    
    // --- THIS IS THE NEW COOLDOWN LOGIC ---
    if (existingConversation) {
      if (existingConversation.status === 'rejected') {
        const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000;
        const timeSinceRejection = Date.now() - existingConversation.updatedAt.getTime();

        if (timeSinceRejection < thirtyDaysInMillis) {
          // If it's been LESS than 30 days, block the request.
          return res.status(403).json({ message: "You cannot send a message request to this user at this time." });
        } else {
          // If it's been MORE than 30 days, reset the conversation and send as a new request.
          existingConversation.status = 'pending';
          existingConversation.requesterId = req.body.senderId;
          const savedConversation = await existingConversation.save();
          return res.status(200).json(savedConversation);
        }
      }
      // If the conversation exists and is not rejected, just return it.
      return res.status(200).json(existingConversation);
    }
    // --- END OF NEW LOGIC ---

  } catch(err) {
    console.log("Error checking for existing conversation:", err);
    return res.status(500).json(err);
  }

  // If no conversation exists at all, create a brand new one.
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
    requesterId: req.body.senderId, 
  });
  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    console.error("Failed to save new conversation:", err);
    res.status(500).json(err);
  }
});

// Route 2: Get all conversations for the primary list
router.get('/:userId', async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.params.userId] },
      $or: [
        { status: 'accepted' },
        { status: { $exists: false } },
        { status: 'pending', requesterId: req.params.userId }
      ]
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


// ======================================================
// ===           NEW ROUTES FOR REQUESTS              ===
// ======================================================

// Route 3: Get all PENDING conversation requests for a user
router.get('/requests/:userId', async (req, res) => {
    try {
        const requests = await Conversation.find({
            members: { $in: [req.params.userId] },
            status: 'pending',
            requesterId: { $ne: req.params.userId } 
        }).sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Route 4: Accept a conversation request
router.put('/requests/accept/:conversationId', async (req, res) => {
    try {
        const updatedConversation = await Conversation.findByIdAndUpdate(
            req.params.conversationId,
            { $set: { status: 'accepted' } },
            { new: true } 
        );
        res.status(200).json(updatedConversation);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Route 5: Reject a conversation request
router.put('/requests/reject/:conversationId', async (req, res) => {
    try {
        const updatedConversation = await Conversation.findByIdAndUpdate(
            req.params.conversationId,
            { $set: { status: 'rejected' } },
            { new: true }
        );
        res.status(200).json(updatedConversation);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Route 6: Get all conversation IDs where there are unread messages for a user
router.get('/unread/:userId', async (req, res) => {
    try {
        const conversations = await Conversation.find({
            members: { $in: [req.params.userId] },
        }).select('_id');

        const conversationIds = conversations.map(c => c._id);

        const unreadConversations = await Message.distinct('conversationId', {
            conversationId: { $in: conversationIds },
            isRead: false,
            senderId: { $ne: req.params.userId }
        });

        res.status(200).json(unreadConversations);
    } catch (err) {
        console.error("Failed to fetch unread conversation IDs", err);
        res.status(500).json(err);
    }
});


module.exports = router;
