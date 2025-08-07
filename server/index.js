const http = require('http');
const { Server } = require('socket.io');

require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const searchRoutes = require('./routes/searchRoutes'); 

// --- ADDED: Models needed for our socket logic ---
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const { addNewUser, removeUser, getSocketsForUser, getOnlineUsers } = require('./socketManager');
const { startScheduleNotifier } = require('./jobs/scheduleNotifier');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch(err => console.error('Unable to connect to MongoDB Atlas.', err));

const app = express();
const PORT = 3001;

// --- SERVER INITIALIZATION (Moved Up) ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] } });

// --- Middleware (Unchanged) ---
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- Import Routes (Unchanged) ---
const novelRoutes = require('./routes/novelRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const bookRoutes = require('./routes/bookRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const scheduleRoute = require("./routes/schedule");
const bookClubRoutes = require('./routes/bookClubRoutes');


// --- Use Routes (Unchanged) ---
app.use('/api/novels', novelRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/api/schedule", scheduleRoute);
app.use('/api/search', searchRoutes);
app.use('/api/bookclubs', bookClubRoutes);


app.get('/', (req, res) => res.send('Welcome to the NovelVerse API!'));

// --- GLOBAL ERROR HANDLER (Unchanged) ---
app.use((err, req, res, next) => {
  console.error('--- UNHANDLED ERROR ---');
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// --- UPDATED SOCKET.IO CONNECTION LOGIC ---
io.on("connection", (socket) => {
  console.log(`[SERVER LOG] ==> A user connected. Socket ID: ${socket.id}`);
  console.log("A user has connected via WebSocket.");

  // Event when a user comes online (Your existing code)
  socket.on("newUser", (userId) => {
    console.log(`[SERVER LOG] 'newUser' event received for User ID: ${userId}`); 
    addNewUser(userId, socket.id);
    console.log(`[SERVER LOG] 'getOnlineUsers' event emitted. Online users:`, getOnlineUsers().map(u=>u.userId)); 
    console.log("Online users:", getOnlineUsers());
    io.emit("getOnlineUsers", getOnlineUsers());
  });

  // Event when a user sends a message (Your existing code)
  socket.on("sendMessage", ({ senderId, receiverId, text, conversationId }) => { 
    console.log(`[SERVER LOG] 'sendMessage' received from ${senderId} to ${receiverId}`);
    const receiverSockets = getSocketsForUser(receiverId);
    if (receiverSockets.length > 0) {
      receiverSockets.forEach(receiver => {
        console.log(`[SERVER LOG] Receiver ${receiverId} is online. Emitting 'getMessage' to Socket ID: ${receiver.socketId}`);
        io.to(receiver.socketId).emit("getMessage", {
          senderId,
          text,
          conversationId,
        });
      });
      console.log(`Message sent from ${senderId} to ${receiverId}`);
    } else {
      console.log(`[SERVER LOG] Receiver ${receiverId} is OFFLINE. Message not sent in real-time.`);
      console.log(`User ${receiverId} is not online for real-time delivery.`);
    }
  });

  // --- ADDED: Event for when a user reads messages ---
  socket.on("markAsRead", async ({ conversationId, userId }) => {
    try {
      await Message.updateMany(
        { conversationId: conversationId, senderId: { $ne: userId }, isRead: false },
        { $set: { isRead: true } }
      );

      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        const friendId = conversation.members.find(m => String(m) !== String(userId));
        const friendSockets = getSocketsForUser(friendId);
        if (friendSockets.length > 0) {
          friendSockets.forEach(friend => {
            io.to(friend.socketId).emit("messagesSeen", { conversationId });
          });
          console.log(`[SERVER LOG] 'markAsRead': Notified ${friendId} that messages in convo ${conversationId} were seen.`);
        }
      }
    } catch (err) {
      console.error("[SERVER ERROR] Failed to mark messages as read", err);
    }
  });
  // --- END OF ADDITION ---

  // Event when a user disconnects (Your existing code)
  socket.on('join post room', (postId) => {
    socket.join(postId);
    console.log(`A user joined room: ${postId}`);
  });

  socket.on('leave post room', (postId) => {
    socket.leave(postId);
    console.log(`A user left room: ${postId}`);
  });

  socket.on("disconnect", () => {
    console.log(`[SERVER LOG] A user disconnected. Socket ID: ${socket.id}`);
    console.log("A user has disconnected.");
    removeUser(socket.id);
    console.log(`[SERVER LOG] 'getOnlineUsers' event emitted after disconnect. Online users:`, getOnlineUsers().map(u=>u.userId));
    io.emit("getOnlineUsers", getOnlineUsers());
  });
});

server.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

// Start the cron job for sending schedule notifications
startScheduleNotifier(io);
