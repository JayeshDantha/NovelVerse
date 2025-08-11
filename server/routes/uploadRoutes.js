const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @route   GET /api/upload/signature
// @desc    Get a signature for direct Cloudinary upload
// @access  Private (should be protected by auth middleware)
router.get('/signature', (req, res) => {
  const timestamp = Math.round((new Date).getTime()/1000);
  const signature = cloudinary.utils.api_sign_request({
    timestamp: timestamp,
    folder: 'NovelVerse_Uploads'
  }, process.env.CLOUDINARY_API_SECRET);

  res.json({
    signature: signature,
    timestamp: timestamp,
    cloudname: process.env.CLOUDINARY_CLOUD_NAME,
    apikey: process.env.CLOUDINARY_API_KEY,
  });
});

module.exports = router;
