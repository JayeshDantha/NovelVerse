const express = require('express');
const router = express.Router();
const Novel = require('../models/Novel'); // Import our Novel model
const mongoose = require('mongoose');

// =========== NEW CODE ADDED HERE ===========
// @route   GET /api/novels
// @desc    Get all novels
// @access  Public
router.get('/', async (req, res) => {
  try {
    const novels = await Novel.find({});
    res.json(novels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// ===========================================
// @route   GET /api/novels/:id
// @desc    Get a single novel by its ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const novel = await Novel.findById(req.params.id);

    // If no novel is found with that ID
    if (!novel) {
      return res.status(404).json({ message: 'Cannot find novel' });
    }
    // If a novel is found
    res.json(novel);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// @route   PATCH /api/novels/:id
// @desc    Update a novel
// @access  Public
// @route   PATCH /api/novels/:id
// @desc    Update a novel
// @access  Public
router.patch('/:id', async (req, res) => {
  try {

    const updatedNovel = await Novel.findByIdAndUpdate(
      req.params.id, // The ID of the novel to find
      req.body,      // The new data to update with
      { new: true }   // This option returns the updated document
    );

    if (!updatedNovel) {
      return res.status(404).json({ message: 'Cannot find novel' });
    }

    res.json(updatedNovel);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// @route   DELETE /api/novels/:id
// @desc    Delete a novel
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const novel = await Novel.findByIdAndDelete(req.params.id);

    if (!novel) {
      return res.status(404).json({ message: 'Cannot find novel' });
    }

    res.json({ message: 'Novel deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/novels
// @desc    Create a new novel
router.post('/', async (req, res) => {
  try {
    // Create a new novel instance using data from the request body
    const newNovel = new Novel({
      title: req.body.title,
      author: req.body.author,
      publicationYear: req.body.publicationYear,
      summary: req.body.summary
    });

    // Save the new novel to the database
    const savedNovel = await newNovel.save();

    // Respond with the saved novel data and a 201 (Created) status
    res.status(201).json(savedNovel);

  } catch (error) {
    // If there's an error, respond with a 400 (Bad Request) status
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;