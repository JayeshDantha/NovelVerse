// /Users/jayeshdantha/Desktop/NovelVerse/client/src/components/notifications/NotificationItem.jsx

import React from 'react';
import { MenuItem, Avatar, Typography, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import { format } from 'timeago.js';

// Helper to generate notification text and link
const getNotificationDetails = (notification) => {
  if (!notification || !notification.sender) {
    return { text: 'New notification', link: '/' };
  }
  const senderUsername = notification.sender.username;
  switch (notification.type) {
    case 'like':
      return {
        text: `${senderUsername} liked your post.`,
        link: `/post/${notification.entityId}`,
      };
    case 'like_comment':
      return {
        text: `${senderUsername} liked your comment.`,
        link: `/post/${notification.entityId}`,
      };
    case 'comment':
      return {
        text: `${senderUsername} commented on your post.`,
        link: `/post/${notification.entityId}`,
      };
    case 'reply':
      return {
        text: `${senderUsername} replied to your comment.`,
        link: `/post/${notification.entityId}`,
      };
    case 'schedule_follow_up':
      return {
        text: `Did you complete your reading session for "${notification.title || 'your book'}"?`,
        link: `/schedule?eventId=${notification.entityId}`,
      };
    case 'schedule_reminder':
      return {
        text: `Reminder: Your reading session for "${notification.title || 'your book'}" starts in about 15 minutes.`,
        link: '/schedule',
      };
    case 'follow':
      return {
        text: `${senderUsername} started following you.`,
        link: `/profile/${senderUsername}`,
      };
    default:
      return { text: 'New notification', link: '/' };
  }
};

const NotificationItem = ({ notification, onClick, onDelete }) => {
  const { text, link } = getNotificationDetails(notification);

  const handleDelete = (e) => {
    // Prevent the link navigation when clicking the delete button
    e.preventDefault();
    e.stopPropagation();
    // Call the delete handler passed from the parent
    if (onDelete) {
      onDelete(notification._id);
    }
  };

  return (
    <MenuItem
      onClick={onClick}
      component={Link}
      to={link}
      sx={{
        whiteSpace: 'normal',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: notification.read ? 'transparent' : 'action.hover',
        alignItems: 'flex-start', // Align items to the top for better layout
        py: 1.5,
      }}
    >
      <Avatar src={notification.sender?.profilePicture} sx={{ mr: 1.5, width: 40, height: 40, mt: 0.5 }} />
      <Box sx={{ flexGrow: 1, mr: 1 }}>
        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
          {text}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {format(notification.createdAt)}
        </Typography>
      </Box>
      {/* Conditionally render the delete button if the onDelete prop exists */}
      {onDelete && (
        <IconButton
          size="small"
          onClick={handleDelete}
          aria-label="delete notification"
          sx={{
            ml: 'auto',
            p: 0.5,
            '&:hover': {
              backgroundColor: 'action.selected'
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </MenuItem>
  );
};

export default NotificationItem;
