// /Users/jayeshdantha/Desktop/NovelVerse/server/models/Notification.js

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "follow", "reply", "like_comment", "schedule_reminder", "schedule_follow_up"],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    // Optional field to store extra context, like an event title
    title: {
      type: String,
      trim: true,
    },
    // ID of the entity related to the notification (e.g., Post, Comment)
    // This allows us to link to the content from the notification.
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
