import React, { useState, useEffect, useContext, useRef } from 'react';
import { Box, Typography, List, TextField, IconButton, Paper, Avatar, Badge, styled, Tabs, Tab, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AuthContext } from '../context/AuthContext';
import Conversation from '../components/Conversation';
import Message from '../components/Message';
import api from '../api/api';
import ConversationRequest from '../components/ConversationRequest'; 

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
    '0%': { transform: 'scale(.8)', opacity: 1 },
    '100%': { transform: 'scale(2.4)', opacity: 0 },
  },
}));

const ChatHeader = ({ currentChat, currentUser, isOnline, onBack }) => {
  const [friend, setFriend] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!currentChat || !currentUser) return;
    const friendId = currentChat.members.find((m) => m !== currentUser._id);
    const getFriend = async () => {
      try {
        const res = await api.get(`/users?userId=${friendId}`);
        setFriend(res.data);
      } catch (err) {
        console.error("Failed to fetch friend data for header", err);
      }
    };
    if (friendId) getFriend();
  }, [currentChat, currentUser]);

  return (
    <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'background.paper' }}>
      {isMobile && (
        <IconButton onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
      )}
      <StyledBadge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" invisible={!isOnline}>
        <Avatar src={friend?.profilePicture} />
      </StyledBadge>
      <Typography variant="h6" fontWeight="600">{friend?.username}</Typography>
    </Box>
  );
};

const ChatPage = () => {
  const { user: currentUser, socket, onlineUsers } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!currentUser?._id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [convRes, reqRes] = await Promise.all([
          api.get(`/conversations/${currentUser._id}`),
          api.get(`/conversations/requests/${currentUser._id}`)
        ]);
        setConversations(convRes.data);
        setRequests(reqRes.data);
      } catch (err) {
        console.error("Failed to fetch chat data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    if (!socket) return;
    const handleGetMessage = (data) => {
      setConversations(prev => prev.map(c => c._id === data.conversationId ? { ...c, lastMessage: { text: data.text, createdAt: Date.now() }, hasUnread: currentChat?._id !== data.conversationId } : c));
      if (currentChat?._id === data.conversationId) {
        setMessages(prev => [...prev, { ...data, createdAt: Date.now() }]);
      }
    };
    socket.on('getMessage', handleGetMessage);
    return () => socket.off('getMessage', handleGetMessage);
  }, [socket, currentChat]);

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
    const message = { senderId: currentUser._id, text: newMessage, conversationId: currentChat._id };
    const receiverId = currentChat.members.find(member => member !== currentUser._id);
    socket.emit('sendMessage', { ...message, receiverId });
    setMessages([...messages, message]);
    setNewMessage('');
    setConversations(prev => prev.map(c => c._id === currentChat._id ? { ...c, lastMessage: { text: newMessage, createdAt: Date.now() } } : c));
    try {
      await api.post('/messages', message);
    } catch (err) { console.error('Failed to save message to DB', err); }
  };
  
  const handleConversationClick = async (conv) => {
    setCurrentChat(conv);
    if (conv.hasUnread) {
      try {
        await api.put(`/messages/read/${conv._id}`);
        setConversations(prev => prev.map(c => c._id === conv._id ? { ...c, hasUnread: false } : c));
      } catch (err) { console.error("Failed to mark messages as read", err); }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setCurrentChat(null);
  };

  const handleAccept = async (request) => {
    try {
      const res = await api.put(`/conversations/requests/accept/${request._id}`);
      setRequests(prev => prev.filter(r => r._id !== request._id));
      setConversations(prev => [res.data, ...prev]);
      setTabIndex(0);
      setCurrentChat(res.data);
    } catch (err) { console.error("Failed to accept request", err); }
  };

  const handleDecline = async (requestId) => {
    try {
      await api.put(`/conversations/requests/reject/${requestId}`);
      setRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (err) { console.error("Failed to decline request", err); }
  };

  const conversationList = (
    <Box sx={{ width: isMobile ? '100%' : '350px', borderRight: isMobile ? 0 : '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Primary" />
          <Tab label={<Badge color="error" badgeContent={requests.length > 0 ? requests.length : null}>Requests</Badge>} />
        </Tabs>
      </Box>
      <List sx={{ overflowY: 'auto', p: 0, flexGrow: 1 }}>
        {loading ? <Box sx={{display: 'flex', justifyContent: 'center', p: 3}}><CircularProgress/></Box> :
         tabIndex === 0 ? (
          conversations.length > 0 ? conversations.map(conv => (
            <Box key={conv._id} onClick={() => handleConversationClick(conv)}>
              <Conversation conversation={conv} currentUser={currentUser} isSelected={currentChat?._id === conv._id} isOnline={onlineUsers.includes(conv.members.find(m => m !== currentUser._id))} />
            </Box>
          )) : <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No conversations yet.</Typography>
        ) : (
          requests.length > 0 ? requests.map(req => (
            <ConversationRequest key={req._id} request={req} currentUser={currentUser} onAccept={handleAccept} onDecline={handleDecline} />
          )) : <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No pending requests.</Typography>
        )}
      </List>
    </Box>
  );

  const chatWindow = (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {currentChat ? (
        <>
          <ChatHeader currentChat={currentChat} currentUser={currentUser} isOnline={onlineUsers.includes(currentChat.members.find(m => m !== currentUser._id))} onBack={() => setCurrentChat(null)} />
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column-reverse', bgcolor: 'grey.50' }}>
            <Box>
              {messages.map((m, index) => <div key={index} ref={index === messages.length - 1 ? scrollRef : null}><Message message={m} own={m.senderId === currentUser._id} /></div>)}
            </Box>
          </Box>
          {currentChat.status === 'pending' ? (
            <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography color="text.secondary" variant="body2">The user will see your message once they accept your request.</Typography>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', p: 1, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <TextField fullWidth variant="outlined" placeholder="Message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} autoComplete="off" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '22px' } }} />
              <IconButton type="submit" color="primary" disabled={!newMessage.trim()}><SendIcon /></IconButton>
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', p: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 300 }}>Your Messages</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Send and receive private messages.</Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ height: 'calc(100vh - 65px)', p: 0, m: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.default' }}>
      <Paper sx={{ width: '100%', maxWidth: '935px', height: '100%', display: 'flex', flexDirection: 'row', borderRadius: { xs: 0, sm: '4px' }, border: { xs: 0, sm: '1px solid' }, borderColor: 'divider' }}>
        {isMobile ? (
          currentChat ? chatWindow : conversationList
        ) : (
          <>
            {conversationList}
            {chatWindow}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ChatPage;
