// server/middleware/authMiddleware.js - FINAL CORRECTED VERSION

const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
  // Get token from the request header
  const token = req.header('x-auth-token');

  // Check if there is no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify the token if there is one
  try {
    // This decodes the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // This adds the user's information from the token to the request object
    req.user = decoded.user; 
    
    // This tells Express to move on to the next step (the actual route handler)
    next(); 
  } catch (err) {
    // This will catch invalid or expired tokens
    res.status(401).json({ msg: 'Token is not valid' });
  }
};