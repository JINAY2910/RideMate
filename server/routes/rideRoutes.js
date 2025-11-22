const express = require('express');
const router = express.Router();
const {
  createRide,
  getRides,
  getRide,
  updateRide,
  deleteRide,
} = require('../controllers/rideController');
const { authMiddleware, driverMiddleware } = require('../middleware/authMiddleware');

router.route('/').get(getRides).post(authMiddleware, driverMiddleware, createRide);
router.route('/:id').get(getRide).put(authMiddleware, driverMiddleware, updateRide).delete(authMiddleware, driverMiddleware, deleteRide);

module.exports = router;

