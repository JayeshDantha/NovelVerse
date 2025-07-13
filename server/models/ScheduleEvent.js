const mongoose = require("mongoose");

const scheduleEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // This is the book from the user's bookshelf
    book: {
      type: Object,
      required: true,
    },
    // This ID links a series of recurring events together
    groupId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true, // e.g., "Read 'The Hobbit'"
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    // The page goal for this specific time slot
    pagesToRead: {
      type: Number,
      required: true,
    },
    // To track if the user completed this specific day's goal
    completed: {
      type: Boolean,
      default: false,
    },
    // To track if we've sent a follow-up notification
    followUpSent: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScheduleEvent", scheduleEventSchema);
