// client/src/pages/ChatPage.jsx - FINAL SIMPLIFIED VERSION

import React, { useState, useEffect, useContext, useRef } from 'react';
import { Box, Typography, List, TextField, IconButton, Paper, Avatar, Badge, styled } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
// --- MODIFICATION: We now get 'onlineUsers' from the context ---
import { AuthContext } from '../context/AuthContext';
import Conversation from '../components/Conversation';
import Message from '../components/Message';
import api from '../api/api';


const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': { transform: 'scale(.8)', opacity: 1, },
    '100%': { transform: 'scale(2.4)', opacity: 0, },
  },
}));

const ChatHeader = ({ currentChat, currentUser, isOnline }) => {
  const [friend, setFriend] = useState(null);
  useEffect(() => {
    if (!currentChat || !currentUser) return;
    const friendId = currentChat.members.find((m) => m !== currentUser.id);
    const getFriend = async () => {
      try {
        const res = await api.get(`/users?userId=${friendId}`);
        setFriend(res.data);
      } catch (err) {
        console.error("Failed to fetch friend data for header", err)
      }
    };
    if (friendId) getFriend();
  }, [currentChat, currentUser]);

  return (
    <Box sx={{ p: 1.5, borderBottom: '1px solid #dbdbdb', display: 'flex', alignItems: 'center', gap: 2 }}>
      <StyledBadge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" invisible={!isOnline}>
        <Avatar src={friend?.profilePicture} />
      </StyledBadge>
      <Typography variant="h6" fontWeight="600">{friend?.username}</Typography>
    </Box>
  );
};


const ChatPage = () => {
  // --- MODIFICATION: Consume 'onlineUsers' directly from the context ---
  const { user: currentUser, socket, onlineUsers } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  // --- REMOVED: No longer need local onlineUsers state as it's now global ---
  const scrollRef = useRef();

  // This useEffect to fetch the user's conversations is correct and unchanged.
  useEffect(() => {
    const getConversations = async () => {
      if (currentUser?.id) {
        try {
          const res = await api.get(`/conversations/${currentUser.id}`);
          setConversations(res.data);
        } catch (err) {
          console.error("Failed to fetch conversations", err);
        }
      }
    };
    getConversations();
  }, [currentUser]);

  // --- REMOVED ---
  // The useEffect for 'getOnlineUsers' and emitting 'newUser' has been removed from this file.
  // Its logic now lives globally in AuthContext.jsx.

  // This useEffect for receiving messages is still needed and is correct.
  useEffect(() => {
    if (!socket) return;
    const handleGetMessage = (data) => {
      // Update the conversation list with the latest message
      setConversations(prevConvos =>
        prevConvos.map(conv => {
          if (conv._id === data.conversationId) {
            return { ...conv, lastMessage: { text: data.text, createdAt: Date.now() }, hasUnread: currentChat?._id !== data.conversationId };
          }
          return conv;
        })
      );
      // If the message is for the currently open chat, add it to the view
      if (currentChat?._id === data.conversationId) {
        setMessages((prev) => [...prev, { ...data, createdAt: Date.now() }]);
      }
    };
    socket.on('getMessage', handleGetMessage);
    return () => {
      socket.off('getMessage', handleGetMessage);
    };
  }, [socket, currentChat]);

  // The rest of the component logic remains the same.
  useEffect(() => {
    const getMessages = async () => {
      if (currentChat) {
        try {
          const res = await api.get(`/messages/${currentChat._id}`);
          setMessages(res.data);
        } catch (err) { console.error("Failed to fetch messages", err); }
      }
    };
    getMessages();
  }, [currentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentChat) return;
    const message = { senderId: currentUser.id, text: newMessage, conversationId: currentChat._id };
    const receiverId = currentChat.members.find(member => member !== currentUser.id);
    socket.emit('sendMessage', { senderId: currentUser.id, receiverId, text: newMessage, conversationId: currentChat._id });
    setMessages([...messages, message]);
    setNewMessage('');
    setConversations(prevConvos =>
      prevConvos.map(conv =>
        conv._id === currentChat._id ? { ...conv, lastMessage: { text: newMessage, createdAt: Date.now() } } : conv
      )
    );
    try {
      await api.post('/messages', message);
    } catch (err) { console.error('Failed to save message to DB', err); }
  };
  
  const handleConversationClick = async (conv) => {
    setCurrentChat(conv);
    if (conv.hasUnread) {
      try {
        await api.put(`/messages/read/${conv._id}`);
        setConversations(prevConvos => prevConvos.map(c => c._id === conv._id ? { ...c, hasUnread: false } : c));
      } catch (err) { console.error("Failed to mark messages as read", err); }
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 65px)', p: 0, m: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#fafafa' }}>
      <Paper sx={{ width: '95%', maxWidth: '935px', height: '95%', display: 'flex', flexDirection: 'row', borderRadius: '4px', border: '1px solid #dbdbdb' }}>
        
        {/* Left Side */}
        <Box sx={{ width: '350px', borderRight: '1px solid #dbdbdb', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #dbdbdb', textAlign: 'center' }}><Typography variant="h6" fontWeight="600">{currentUser?.username || "Messages"}</Typography></Box>
          <List sx={{ overflowY: 'auto', p: 0, flexGrow: 1 }}>
            {conversations.map((conv) => {
              const friendId = conv.members.find(m => m !== currentUser.id);
              // --- This now uses 'onlineUsers' from the context! ---
              const isOnline = onlineUsers.includes(friendId);
              return (
                <Box key={conv._id} onClick={() => handleConversationClick(conv)}>
                  <Conversation conversation={conv} currentUser={currentUser} isSelected={currentChat?._id === conv._id} isOnline={isOnline}/>
                </Box>
              )
            })}
          </List>
        </Box>

        {/* Right Side */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {currentChat ? (
            <>
              <ChatHeader currentChat={currentChat} currentUser={currentUser} isOnline={onlineUsers.includes(currentChat.members.find(m => m !== currentUser.id))}/>
              <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column-reverse' }}>
                <Box>
                  {messages.map((m, index) => ( <div key={index} ref={index === messages.length - 1 ? scrollRef : null}> <Message message={m} own={m.senderId === currentUser.id} /> </div> ))}
                </Box>
              </Box>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', p: 2 }}>
                <TextField fullWidth variant="outlined" placeholder="Message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} autoComplete="off" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '22px' } }} />
                <IconButton type="submit" color="primary" disabled={!newMessage.trim()}><SendIcon /></IconButton>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
               <Typography variant="h4" sx={{fontWeight: 300}}>Your Messages</Typography>
               <Typography color="text.secondary" sx={{mt: 1}}>Send private messages to a friend.</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatPage;