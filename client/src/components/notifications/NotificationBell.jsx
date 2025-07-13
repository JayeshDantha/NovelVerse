// /Users/jayeshdantha/Desktop/NovelVerse/client/src/components/notifications/NotificationBell.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useSnackbar } from 'notistack';
import { IconButton, Badge, Menu, Typography, Box, Button, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationItem from './NotificationItem';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api';

// Helper to generate a user-friendly message for the toast
const getToastMessage = (data) => {
  const { senderName, type, title } = data;
  switch (type) {
    case 'like':
      return `${senderName} liked your post.`;
    case 'comment':
      return `${senderName} commented on your post.`;
    case 'follow':
      return `${senderName} started following you.`;
    case 'reply':
      return `${senderName} replied to your comment.`;
    case 'like_comment':
      return `${senderName} liked your comment.`;
    case 'schedule_reminder':
      return `Reminder: Your reading session for "${title}" starts in about 15 minutes.`;
    case 'schedule_follow_up':
      return `Did you complete your reading session for "${title}"?`;
    default:
      return 'You have a new notification.';
  }
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, socket } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const open = Boolean(anchorEl);

  const fetchNotifications = async () => {
    if (user) {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('getNotification', (data) => {
        // To make it real-time, we'll just refetch all notifications.
        // A more advanced implementation could add the new one to the top.
        fetchNotifications();
        // --- FIX: Use enqueueSnackbar instead of alert ---
        const message = getToastMessage(data);
        enqueueSnackbar(message, { variant: 'info' });
      });

      return () => {
        socket.off('getNotification');
      };
    }
  }, [socket]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = async () => {
    setAnchorEl(null);
    if (unreadCount > 0) {
      try {
        // Mark all as read on the backend
        await api.put('/notifications/read');
        // Update the state on the frontend immediately for a snappy UI
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      } catch (err) {
        console.error('Failed to mark notifications as read', err);
      }
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      // Call the new backend endpoint
      await api.delete(`/notifications/${notificationId}`);
      // Update state to remove the notification instantly for a snappy UI
      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n._id !== notificationId)
      );
    } catch (err) {
      console.error("Failed to delete notification", err);
      enqueueSnackbar("Failed to delete notification", { variant: "error" });
    }
  };

  // --- FIX: Build an array of children for the Menu to avoid Fragment error ---
  const renderMenuItems = () => {
    const items = [
      <Box key="header" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6">Notifications</Typography>
      </Box>
    ];

    if (notifications.length > 0) {
      notifications.forEach((notif) => {
        items.push(<NotificationItem key={notif._id} notification={notif} onClick={handleClose} onDelete={handleDeleteNotification} />);
      });
      items.push(<Divider key="footer-divider" />);
      items.push(
        <Box key="footer-link" sx={{ p: 1, textAlign: 'center' }}>
          <Button component={Link} to="/notifications" onClick={handleClose} size="small">
            View All Notifications
          </Button>
        </Box>
      );
    } else {
      items.push(
        <Typography key="empty" sx={{ p: 2, color: 'text.secondary' }}>
          You have no new notifications.
        </Typography>
      );
    }
    return items;
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ sx: { py: 0 } }}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: '350px',
          },
        }}
      >
        {renderMenuItems()}
      </Menu>
    </>
  );
};

export default NotificationBell;