const express = require('express');
const router = express.Router();
const { addVehicle, getVehicles, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { driverMiddleware } = require('../middleware/authMiddleware');

// All vehicle routes require authentication and driver role
router.use(authMiddleware);
router.use(driverMiddleware);

router.post('/', addVehicle);
router.get('/', getVehicles);
router.put('/:vehicleId', updateVehicle);
router.delete('/:vehicleId', deleteVehicle);

module.exports = router;

