// /Users/jayeshdantha/Desktop/NovelVerse/server/socketManager.js

let onlineUsers = [];

const addNewUser = (userId, socketId) => {
  !onlineUsers.some((user) => user.userId === userId) &&
    onlineUsers.push({ userId, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

const getOnlineUsers = () => {
    return onlineUsers;
}

module.exports = {
  addNewUser,
  removeUser,
  getUser,
  getOnlineUsers,
};
