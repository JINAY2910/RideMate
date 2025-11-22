const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBooking } = require('../controllers/bookingController');
const { authMiddleware, riderMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, riderMiddleware, createBooking);
router.get('/me', authMiddleware, getMyBookings);
router.get('/:id', authMiddleware, getBooking);

module.exports = router;

