const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.route('/').get(authMiddleware, getNotifications);
router.route('/read-all').patch(authMiddleware, markAllAsRead);
router.route('/:id/read').patch(authMiddleware, markAsRead);

module.exports = router;

