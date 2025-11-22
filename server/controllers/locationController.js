const { search, geocode } = require('../utils/geocoding');

// @desc    Search locations (autocomplete)
// @route   GET /api/locations/search
// @access  Public
const searchLocations = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.json([]);
    }

    if (q.trim().length < 2) {
      return res.json([]);
    }

    const results = await search(q.trim());

    res.json(results);
  } catch (error) {
    console.error('Location search error:', error);
    // Return empty array on error instead of failing
    res.json([]);
  }
};

// @desc    Geocode a location (get coordinates from place name)
// @route   GET /api/locations/geocode
// @access  Public
const geocodeLocation = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Location query (q) is required',
      });
    }

    const result = await geocode(q.trim());

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Location not found',
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchLocations,
  geocodeLocation,
};


