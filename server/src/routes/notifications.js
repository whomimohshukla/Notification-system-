import express from 'express';
import Notification from '../models/Notification.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for current user
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(100);
  const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
  res.json({ notifications, unreadCount });
});

// Mark one notification as read
router.post('/read/:id', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  const notif = await Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: { isRead: true } },
    { new: true }
  );
  if (!notif) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json({ ok: true, notification: notif });
});

// Mark all as read
router.post('/read-all', authMiddleware, async (req, res) => {
  const userId = req.userId;
  await Notification.updateMany({ user: userId, isRead: false }, { $set: { isRead: true } });
  res.json({ ok: true });
});

// Create a new notification for a user
router.post('/', authMiddleware, async (req, res) => {
  // In a real app, you might restrict who can create notifications
  const { userId, title, body, link } = req.body;
  if (!userId || !title) {
    return res.status(400).json({ error: 'Missing userId or title' });
  }

  const notification = await Notification.create({ user: userId, title, body, link });

  // Emit real-time event to that user's room
  req.io.to(`user:${userId}`).emit('notification:new', notification);

  res.status(201).json({ notification });
});

export default router;
