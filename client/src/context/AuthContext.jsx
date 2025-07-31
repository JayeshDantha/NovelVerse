// /Users/jayeshdantha/Desktop/NovelVerse/client/src/context/AuthContext.jsx - ROBUST FINAL VERSION

import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // Start as true
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadConversations, setUnreadConversations] = useState(new Set());

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          // Check for token expiration
          if (decodedToken.exp * 1000 < Date.now()) {
            throw new Error("Token expired");
          }
          const userId = decodedToken.user.id;
          
          // --- MODIFIED: We add a special config to this initial API call ---
          const res = await api.get(`/users?userId=${userId}`, { _isAuthCheck: true });
          
          setUser(res.data);

          // --- ADDED: Fetch unread conversations ---
          const unreadRes = await api.get(`/conversations/unread/${userId}`);
          setUnreadConversations(new Set(unreadRes.data));


        } catch (error) {
          // If anything goes wrong (expired token, network error), just log out silently.
          console.error("AuthContext Error:", error.message);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      // We only stop loading after we've tried to fetch the user.
      setLoading(false);
    };

    setLoading(true); // Set loading to true every time the token changes
    if (!token) {
      setLoading(false);
    }
    fetchUser();
  }, [token]);

  // Socket connection logic remains the same
  useEffect(() => {
    if (user) {
      const userIdToAnnounce = user._id || user.id;
      const newSocket = io('http://localhost:3001');
      setSocket(newSocket);

      newSocket.on('getOnlineUsers', (users) => setOnlineUsers(users.map(u => u.userId)));
      newSocket.on('connect', () => newSocket.emit('newUser', userIdToAnnounce));

      // --- ADDED: Listen for new messages to update unread status ---
      newSocket.on('getMessage', ({ conversationId }) => {
        setUnreadConversations(prev => new Set(prev).add(conversationId));
      });

      // --- ADDED: Listen for when messages are seen by the other user ---
      newSocket.on('messagesSeen', ({ conversationId }) => {
        setUnreadConversations(prev => {
            const newUnread = new Set(prev);
            newUnread.delete(conversationId);
            return newUnread;
        });
      });

      const sendHeartbeat = async () => {
        try { await api.put('/users/heartbeat'); } 
        catch (error) { console.error('Failed to send heartbeat', error); }
      };
      sendHeartbeat(); 
      const heartbeatInterval = setInterval(sendHeartbeat, 30000);

      return () => {
        newSocket.close();
        clearInterval(heartbeatInterval);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setUnreadConversations(new Set());
  };

  const markConversationAsRead = (conversationId) => {
    setUnreadConversations(prev => {
        const newUnread = new Set(prev);
        newUnread.delete(conversationId);
        return newUnread;
    });
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  }

  const contextValue = { user, token, login, logout, loading, socket, onlineUsers, unreadConversations, markConversationAsRead, updateUser };

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Only render the app when the initial loading is complete */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
