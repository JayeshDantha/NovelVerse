// /Users/jayeshdantha/Desktop/NovelVerse/client/src/pages/NotificationsPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Box, CircularProgress, List, Paper } from '@mui/material';
import { useSnackbar } from 'notistack';
import NotificationItem from '../components/notifications/NotificationItem';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const res = await api.get('/notifications');
          setNotifications(res.data);
        } catch (err) {
          console.error('Failed to fetch notifications', err);
        } finally {
          setLoading(false);
        }
      }
    };

    if (token) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const handleDeleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n._id !== notificationId)
      );
    } catch (err) {
      console.error("Failed to delete notification", err);
      enqueueSnackbar("Failed to delete notification", { variant: "error" });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        All Notifications
      </Typography>
      <Paper variant="outlined">
        <List sx={{ py: 0 }}>
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <NotificationItem key={notif._id} notification={notif} onDelete={handleDeleteNotification} />
            ))
          ) : (
            <Typography sx={{ p: 2, color: 'text.secondary' }}>
              You have no notifications.
            </Typography>
          )}
        </List>
      </Paper>
    </Container>
  );
};

export default NotificationsPage;
