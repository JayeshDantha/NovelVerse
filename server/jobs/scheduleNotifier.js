// /Users/jayeshdantha/Desktop/NovelVerse/server/jobs/scheduleNotifier.js

const cron = require('node-cron');
const ScheduleEvent = require('../models/ScheduleEvent');
const Notification = require('../models/Notification');
const { getUser } = require('../socketManager');

const startScheduleNotifier = (io) => {
  // This cron job runs every minute
  cron.schedule('* * * * *', async () => {
    console.log('--- [CRON JOB] Checking for upcoming reading sessions... ---');

    // --- Logic for upcoming event reminders (15 mins before) ---
    const now = new Date();
    const notificationTimeStart = new Date(now.getTime() + 14 * 60 * 1000); // 14 minutes from now
    const notificationTimeEnd = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now

    try {
      const upcomingEvents = await ScheduleEvent.find({
        start: {
          $gte: notificationTimeStart,
          $lt: notificationTimeEnd,
        },
        completed: false, // Don't notify for completed events
      }).populate('user', 'username');

      if (upcomingEvents.length > 0) {
        console.log(`[CRON JOB] Found ${upcomingEvents.length} upcoming event(s).`);
      }

      for (const event of upcomingEvents) {
        // For schedule reminders, the recipient and sender are the same user.
        // The 'entityId' can be the event itself, though we don't use it on the frontend yet.
        const notification = new Notification({
          recipient: event.user._id,
          sender: event.user._id,
          type: 'schedule_reminder',
          entityId: event._id,
          title: event.title, // Save the title
        });
        await notification.save();

        const recipientSocket = getUser(event.user._id.toString());
        if (recipientSocket) {
          io.to(recipientSocket.socketId).emit('getNotification', {
            senderName: 'NovelVerse', // System notification
            type: 'schedule_reminder',
            title: event.title,
          });
        }
      }

      // --- More-robust logic for follow-up notifications ---
      const recentlyEndedEvents = await ScheduleEvent.find({
        end: { $lt: now }, // Find all events that should have ended by now
        completed: false,
        followUpSent: false, // Make sure we haven't sent a follow-up already
      }).populate('user', 'username'); // Populate user details for consistency

      if (recentlyEndedEvents.length > 0) {
        console.log(`[CRON JOB] Found ${recentlyEndedEvents.length} incomplete event(s) to follow up on.`);
      }

      for (const event of recentlyEndedEvents) {
        const notification = new Notification({
          recipient: event.user._id,
          sender: event.user._id,
          type: 'schedule_follow_up',
          entityId: event._id,
          title: event.title, // Save the title
        });
        await notification.save();

        const recipientSocket = getUser(event.user._id.toString()); // Correctly get user ID
        if (recipientSocket) {
          io.to(recipientSocket.socketId).emit('getNotification', {
            senderName: 'NovelVerse',
            type: 'schedule_follow_up',
            title: event.title,
          });
        }
        event.followUpSent = true;
        await event.save();
      }
    } catch (error) {
      console.error('[CRON JOB] Error checking for scheduled events:', error);
    }
  });
};

module.exports = { startScheduleNotifier };