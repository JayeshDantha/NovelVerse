const router = require("express").Router();
const User = require("../models/User");
const ScheduleEvent = require("../models/ScheduleEvent");
const BookshelfItem = require("../models/BookshelfItem");
const Novel = require("../models/Novel");
const { v4: uuidv4 } = require("uuid"); // We'll use this for unique group IDs

// Middleware to verify user is authenticated (you should already have this)
const authMiddleware = require("../middleware/authMiddleware");

// GET ALL EVENTS FOR A USER
router.get("/", authMiddleware, async (req, res) => {
  try {
    const events = await ScheduleEvent.find({ user: req.user.id });
    res.status(200).json(events);
  } catch (err) {
    console.error("Failed to fetch schedule events:", err);
    res.status(500).json({ message: "Failed to fetch schedule events", error: err.message });
  }
});

// GET USER'S "READING" SHELF
router.get("/reading-shelf", authMiddleware, async (req, res) => {
  try {
    const readingShelf = await BookshelfItem.find({
      user: req.user.id,
      status: /reading|currently reading/i // Check for "reading" OR "currently reading", case-insensitively
    }).populate('novel'); // Populate the full novel details

    // Filter out any items where the associated novel might have been deleted
    const validItems = readingShelf.filter(item => item.novel);

    // Format the valid data for the frontend
    const books = validItems.map(item => ({
        googleBooksId: item.novel.googleBooksId,
        title: item.novel.title,
    }));

    res.status(200).json(books);
  } catch (err) {
    console.error("Failed to fetch reading shelf:", err);
    res.status(500).json({ message: "Failed to fetch reading shelf", error: err.message });
  }
});

// CREATE A NEW READING GOAL SCHEDULE
router.post("/reading-goal", authMiddleware, async (req, res) => {
  const { bookId, startDate, startTime, durationMinutes, pagesPerDay } =
    req.body; // bookId is the googleBooksId

  try {
    // Find the novel in our DB first
    const novel = await Novel.findOne({ googleBooksId: bookId });
    if (!novel) {
        return res.status(404).json({ message: "Book not found in database." });
    }

    // Find the book on the user's bookshelf to get progress
    const bookToSchedule = await BookshelfItem.findOne({
        user: req.user.id,
        novel: novel._id,
        status: /reading|currently reading/i // Also make this query flexible
    }).populate('novel');

    if (!bookToSchedule) {
      return res
        .status(404)
        .json({ message: "Book not found on your 'Reading' shelf." });
    }

    const { totalPages, pagesRead } = bookToSchedule;
    const { title } = bookToSchedule.novel;

    // --- FIX: Add validation for totalPages ---
    if (!totalPages || totalPages <= 0) {
      return res.status(400).json({
        message: `Please set the total number of pages for "${title}" on your bookshelf before creating a goal.`,
      });
    }

    const remainingPages = totalPages - pagesRead;

    if (remainingPages <= 0) {
        return res.status(400).json({ message: "You've already finished this book!" });
    }

    const daysNeeded = Math.ceil(remainingPages / pagesPerDay);
    const groupId = uuidv4(); // A unique ID for this series of events
    const eventsToCreate = [];

    const bookObjectForEvent = {
        googleBooksId: bookToSchedule.novel.googleBooksId,
        title: bookToSchedule.novel.title,
        thumbnail: bookToSchedule.novel.thumbnail,
    };

    let pagesAccountedFor = 0;

    for (let i = 0; i < daysNeeded; i++) {
      const eventDate = new Date(startDate);
      eventDate.setDate(eventDate.getDate() + i);

      const [hour, minute] = startTime.split(":");
      eventDate.setHours(hour, minute, 0, 0);

      const start = new Date(eventDate);
      const end = new Date(start.getTime() + durationMinutes * 60000);
      
      // Determine pages for this specific day
      let dailyGoal = pagesPerDay;
      if (pagesAccountedFor + pagesPerDay > remainingPages) {
        dailyGoal = remainingPages - pagesAccountedFor;
      }
      pagesAccountedFor += dailyGoal;

      eventsToCreate.push({
        user: req.user.id,
        book: bookObjectForEvent,
        groupId,
        title: `Read: ${title}`,
        start,
        end,
        pagesToRead: dailyGoal,
        completed: false,
      });
    }

    const createdEvents = await ScheduleEvent.insertMany(eventsToCreate);
    res.status(201).json(createdEvents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create reading goal", error: err.message });
  }
});

// MARK A SCHEDULE EVENT AS COMPLETE
router.put("/event/:eventId/complete", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const event = await ScheduleEvent.findById(eventId);

    // Security and validation checks
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }
    if (event.user.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to update this event." });
    }
    if (event.completed) {
      return res.status(400).json({ message: "This event has already been completed." });
    }

    // 1. Mark the event as complete
    event.completed = true;
    await event.save();

    // 2. Find the novel associated with the event
    const novel = await Novel.findOne({ googleBooksId: event.book.googleBooksId });
    if (!novel) {
        console.warn(`Could not find novel with googleBooksId ${event.book.googleBooksId} to update progress.`);
        return res.status(200).json({ message: "Event marked as complete, but book progress could not be updated.", event });
    }

    // 2. Update the user's bookshelf progress
    const bookshelfItem = await BookshelfItem.findOne({
      user: userId,
      novel: novel._id,
    });

    if (bookshelfItem) {
      bookshelfItem.pagesRead += event.pagesToRead;
      // Ensure we don't go over the total page count
      if (bookshelfItem.totalPages > 0 && bookshelfItem.pagesRead > bookshelfItem.totalPages) {
        bookshelfItem.pagesRead = bookshelfItem.totalPages;
      }
      await bookshelfItem.save();
    }

    res.status(200).json({ message: "Event marked as complete and progress updated.", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to complete event", error: err.message });
  }
});

// DELETE AN ENTIRE READING GOAL (ALL EVENTS IN A GROUP)
router.delete("/group/:groupId", authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // We can delete based on the groupId and userId for security
    const result = await ScheduleEvent.deleteMany({ groupId, user: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No events found for this goal or you are not authorized." });
    }

    res.status(200).json({ message: `${result.deletedCount} event(s) deleted successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete goal", error: err.message });
  }
});

module.exports = router;
