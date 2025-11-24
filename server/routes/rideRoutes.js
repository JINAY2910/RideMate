const express = require('express');
const router = express.Router();
const {
  createRide,
  getRides,
  getRide,
  updateRide,
  deleteRide,
  addRequest,
  updateRequestStatus,
  findRideMatches,
} = require('../controllers/rideController');
const { authMiddleware, driverMiddleware } = require('../middleware/authMiddleware');

router.route('/').get(getRides).post(authMiddleware, driverMiddleware, createRide);
router.route('/match').post(findRideMatches);
router.route('/:id').get(getRide).put(authMiddleware, driverMiddleware, updateRide).patch(authMiddleware, driverMiddleware, updateRide).delete(authMiddleware, driverMiddleware, deleteRide);
router.route('/:id/requests').post(authMiddleware, addRequest);
router.route('/:id/requests/:requestId').patch(authMiddleware, driverMiddleware, updateRequestStatus);

module.exports = router;

