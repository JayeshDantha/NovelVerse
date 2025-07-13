// /Users/jayeshdantha/Desktop/NovelVerse/server/routes/notificationRoutes.js

const router = require("express").Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

// GET ALL NOTIFICATIONS FOR THE LOGGED-IN USER
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate("sender", "username profilePicture") // Populate sender's info
      .sort({ createdAt: -1 }); // Show newest first

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications", error: err.message });
  }
});

// MARK ALL NOTIFICATIONS AS READ
router.put("/read", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.status(200).json({ message: "All notifications marked as read." });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark notifications as read", error: err.message });
  }
});

// DELETE A SINGLE NOTIFICATION
router.delete("/:notificationId", authMiddleware, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    // Security check: Ensure the user owns this notification
    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this notification." });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: "Notification deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete notification", error: err.message });
  }
});

module.exports = router;
