import React from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

function MemberListModal({ open, onClose, members }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Club Members</DialogTitle>
      <DialogContent>
        <List>
          {members.map((member) => (
            <ListItem key={member._id} component={Link} to={`/profile/${member.username}`} button="true">
              <ListItemAvatar>
                <Avatar src={member.profilePicture} />
              </ListItemAvatar>
              <ListItemText primary={member.username} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}

export default MemberListModal;
