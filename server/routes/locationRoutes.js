const express = require('express');
const router = express.Router();
const { searchLocations, geocodeLocation } = require('../controllers/locationController');

router.get('/search', searchLocations);
router.get('/geocode', geocodeLocation);

module.exports = router;


