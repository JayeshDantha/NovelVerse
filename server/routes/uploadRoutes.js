/*
// server/routes/uploadRoutes.js

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// --- ADD THESE THREE LINES TO DEBUG ---
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', !!process.env.CLOUDINARY_API_SECRET); // We log `!!` for the secret so the actual secret isn't printed. This will just tell us if it exists (true) or not (false).

const router = express.Router();

// Configure Cloudinary with the credentials from your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'NovelVerse_Uploads', // This will create a folder in your Cloudinary account to keep things organized
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 1500, height: 1500, crop: 'limit' }] // Limits image size to prevent huge uploads
  },
});

const upload = multer({ storage: storage });

// @route   POST /api/upload
// @desc    Upload a single file and get its URL
// @access  This should be a private route, but for now we'll set it up
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  // If the code reaches here, the file has been successfully uploaded to Cloudinary.
  // The public URL of the file is available in req.file.path
  res.status(200).json({ imageUrl: req.file.path });
});

module.exports = router;
*/

// server/routes/uploadRoutes.js - MANUAL UPLOAD VERSION

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to store files in memory as a buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @route   POST /api/upload
// @desc    Upload a single file manually to Cloudinary
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Convert the file buffer to a Data URI, which Cloudinary can accept
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    // Manually call the Cloudinary uploader
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "NovelVerse_Uploads",
    });

    // Send back the secure URL from the result
    res.status(200).json({ imageUrl: result.secure_url });

  } catch (error) {
    // THIS IS THE IMPORTANT PART - WE WILL FINALLY SEE THE REAL ERROR
    console.error("--- CLOUDINARY MANUAL UPLOAD FAILED ---");
    console.error(error); // Log the full error object from Cloudinary
    res.status(500).json({ message: "Error uploading file.", error: error.message });
  }
});

module.exports = router;