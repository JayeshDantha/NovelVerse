// /Users/jayeshdantha/Desktop/NovelVerse/server/socketManager.js

let onlineUsers = [];

const addNewUser = (userId, socketId) => {
  // A user can have multiple connections (e.g. multiple tabs).
  // We add a new entry for each connection, after ensuring it's not a duplicate socket ID.
  if (!onlineUsers.some((user) => user.socketId === socketId)) {
    onlineUsers.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getSocketsForUser = (userId) => {
  return onlineUsers.filter((user) => user.userId === userId);
};

const getOnlineUsers = () => {
    return onlineUsers;
}

module.exports = {
  addNewUser,
  removeUser,
  getSocketsForUser,
  getOnlineUsers,
};
