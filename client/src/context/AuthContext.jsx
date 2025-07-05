import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  // --- ADDITION: State for online users now lives here ---
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({ id: decodedToken.user.id, username: decodedToken.user.username });
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // This useEffect now manages the global socket connection and online user list
  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:3001');
      setSocket(newSocket);

      // --- ADDITION: Global listener for online users ---
      newSocket.on('getOnlineUsers', (users) => {
        console.log('[AuthContext DEBUG] Received online users:', users);
        setOnlineUsers(users.map(u => u.userId));
      });

      // Announce user only after connection is confirmed to prevent race condition
      newSocket.on('connect', () => {
        console.log(`[AuthContext DEBUG] Socket connected: ${newSocket.id}. Announcing user ${user.id}`);
        newSocket.emit('newUser', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log("[AuthContext DEBUG] Socket disconnected.");
      });

      // Heartbeat mechanism (Unchanged)
      const sendHeartbeat = async () => {
        try {
          await api.put('/users/heartbeat');
        } catch (error) {
          console.error('Failed to send heartbeat', error);
        }
      };
      sendHeartbeat(); 
      const heartbeatInterval = setInterval(sendHeartbeat, 30000);

      // Cleanup function
      return () => {
        console.log("[AuthContext DEBUG] Cleaning up. Closing socket.");
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

  const login = (token) => {
    localStorage.setItem('token', token);
    try {
      const decodedToken = jwtDecode(token);
      setUser({ id: decodedToken.user.id, username: decodedToken.user.username });
      window.location.href = '/';
    } catch (error) {
      console.error("Invalid token on login:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  // --- ADDITION: Provide onlineUsers in the context value ---
  const contextValue = { user, login, logout, loading, socket, onlineUsers };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};