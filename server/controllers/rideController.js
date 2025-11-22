const Ride = require('../models/Ride');
const { validateRideInput } = require('../utils/validate');
const { geocode } = require('../utils/geocoding');

// Transform ride to match frontend format
const transformRide = (ride) => {
  if (!ride) return null;
  
  const rideObj = ride.toObject ? ride.toObject() : ride;
  
  // Handle driver - could be populated object or just ID
  const driverName = rideObj.driver?.name || (typeof rideObj.driver === 'string' ? 'Unknown' : 'Unknown');
  const driverRating = rideObj.driver?.rating || 4.5;
  
  return {
    _id: rideObj._id.toString(),
    id: rideObj._id.toString(),
    driver: {
      name: driverName,
      rating: driverRating,
    },
    start: {
      label: rideObj.from || '',
      coordinates: {
        // GeoJSON format: coordinates is [lng, lat]
        lat: rideObj.startCoordinates?.coordinates?.[1] || rideObj.startCoordinates?.lat || 0,
        lng: rideObj.startCoordinates?.coordinates?.[0] || rideObj.startCoordinates?.lng || 0,
      },
    },
    destination: {
      label: rideObj.to || '',
      coordinates: {
        // GeoJSON format: coordinates is [lng, lat]
        lat: rideObj.destCoordinates?.coordinates?.[1] || rideObj.destCoordinates?.lat || 0,
        lng: rideObj.destCoordinates?.coordinates?.[0] || rideObj.destCoordinates?.lng || 0,
      },
    },
    date: rideObj.date || '',
    time: rideObj.time || '',
    status: rideObj.isActive !== false ? 'Active' : 'Completed',
    seats: {
      total: rideObj.seatsAvailable || 0,
      available: rideObj.seatsAvailable || 0,
    },
    notes: rideObj.notes || '',
    requests: rideObj.requests || [],
    participants: rideObj.participants || [],
    createdAt: rideObj.createdAt ? rideObj.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: rideObj.updatedAt ? rideObj.updatedAt.toISOString() : new Date().toISOString(),
  };
};

// @desc    Create a new ride
// @route   POST /api/rides
// @access  Private (Driver only)
const createRide = async (req, res, next) => {
  try {
    let from, to, startCoordsGeoJSON, destCoordsGeoJSON;
    
    // Handle location input - can be place name (string) or object with coordinates
    if (req.body.start && req.body.destination) {
      // New format from frontend
      from = req.body.start.label || req.body.start.name || req.body.start;
      to = req.body.destination.label || req.body.destination.name || req.body.destination;
      
      // Check if coordinates are provided
      const startLat = req.body.start.lat || req.body.start.coordinates?.lat;
      const startLng = req.body.start.lng || req.body.start.coordinates?.lng;
      const destLat = req.body.destination.lat || req.body.destination.coordinates?.lat;
      const destLng = req.body.destination.lng || req.body.destination.coordinates?.lng;
      
      // If coordinates provided, use them; otherwise geocode the place name
      if (startLat && startLng) {
        startCoordsGeoJSON = {
          type: 'Point',
          coordinates: [parseFloat(startLng), parseFloat(startLat)], // GeoJSON: [lng, lat]
        };
      } else if (typeof from === 'string' && from.trim()) {
        // Geocode the location name
        try {
          const geocoded = await geocode(from);
          if (geocoded) {
            startCoordsGeoJSON = {
              type: 'Point',
              coordinates: [geocoded.lng, geocoded.lat],
            };
            from = geocoded.name; // Use the geocoded name
          } else {
            return res.status(400).json({
              success: false,
              message: `Could not find location: ${from}`,
            });
          }
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: `Geocoding failed for start location: ${error.message}`,
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Start location is required (provide name or coordinates)',
        });
      }
      
      if (destLat && destLng) {
        destCoordsGeoJSON = {
          type: 'Point',
          coordinates: [parseFloat(destLng), parseFloat(destLat)],
        };
      } else if (typeof to === 'string' && to.trim()) {
        // Geocode the location name
        try {
          const geocoded = await geocode(to);
          if (geocoded) {
            destCoordsGeoJSON = {
              type: 'Point',
              coordinates: [geocoded.lng, geocoded.lat],
            };
            to = geocoded.name; // Use the geocoded name
          } else {
            return res.status(400).json({
              success: false,
              message: `Could not find location: ${to}`,
            });
          }
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: `Geocoding failed for destination: ${error.message}`,
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Destination location is required (provide name or coordinates)',
        });
      }
    } else if (req.body.from && req.body.to) {
      // Old format - geocode place names
      from = req.body.from.trim();
      to = req.body.to.trim();
      
      try {
        const [startGeocoded, destGeocoded] = await Promise.all([
          geocode(from),
          geocode(to),
        ]);
        
        if (!startGeocoded) {
          return res.status(400).json({
            success: false,
            message: `Could not find start location: ${from}`,
          });
        }
        if (!destGeocoded) {
          return res.status(400).json({
            success: false,
            message: `Could not find destination: ${to}`,
          });
        }
        
        startCoordsGeoJSON = {
          type: 'Point',
          coordinates: [startGeocoded.lng, startGeocoded.lat],
        };
        destCoordsGeoJSON = {
          type: 'Point',
          coordinates: [destGeocoded.lng, destGeocoded.lat],
        };
        from = startGeocoded.name;
        to = destGeocoded.name;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: `Geocoding failed: ${error.message}`,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: start/from and destination/to locations',
      });
    }

    // Validate other required fields
    if (!req.body.date || !req.body.time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: date, time',
      });
    }

    const seats = req.body.seats || req.body.seatsAvailable || 1;
    const price = req.body.price || 0;

    const ride = await Ride.create({
      driver: req.user.id,
      from: from.trim(),
      to: to.trim(),
      startCoordinates: startCoordsGeoJSON,
      destCoordinates: destCoordsGeoJSON,
      date: req.body.date,
      time: req.body.time,
      price: parseFloat(price),
      seatsAvailable: parseInt(seats),
      notes: req.body.notes || '',
      requests: [],
      participants: [],
      isActive: true,
    });

    const populatedRide = await Ride.findById(ride._id).populate({
      path: 'driver',
      select: 'name email phone role',
    });

    res.status(201).json(transformRide(populatedRide));
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rides
// @route   GET /api/rides
// @access  Public
const getRides = async (req, res, next) => {
  try {
    const { from, to, date, isActive, nearStart, nearDest, radius } = req.query;

    // Build query
    const query = {};

    // Text-based search (for backward compatibility)
    if (from && !nearStart) {
      query.from = { $regex: from, $options: 'i' };
    }

    if (to && !nearDest) {
      query.to = { $regex: to, $options: 'i' };
    }

    // Geo-based search for start location
    if (nearStart) {
      try {
        const geocoded = await geocode(nearStart);
        if (geocoded) {
          const searchRadius = parseFloat(radius) || 50000; // Default 50km in meters
          query.startCoordinates = {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [geocoded.lng, geocoded.lat],
              },
              $maxDistance: searchRadius,
            },
          };
        }
      } catch (error) {
        console.error('Geocoding error for start location:', error.message);
        // Fallback to text search
        query.from = { $regex: nearStart, $options: 'i' };
      }
    }

    // Geo-based search for destination location
    if (nearDest) {
      try {
        const geocoded = await geocode(nearDest);
        if (geocoded) {
          const searchRadius = parseFloat(radius) || 50000; // Default 50km in meters
          query.destCoordinates = {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [geocoded.lng, geocoded.lat],
              },
              $maxDistance: searchRadius,
            },
          };
        }
      } catch (error) {
        console.error('Geocoding error for destination:', error.message);
        // Fallback to text search
        query.to = { $regex: nearDest, $options: 'i' };
      }
    }

    if (date) {
      query.date = date;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const rides = await Ride.find(query)
      .populate({
        path: 'driver',
        select: 'name email phone role',
      })
      .sort({ date: 1, time: 1 })
      .limit(100);

    // Transform rides to match frontend format
    const transformedRides = rides.map(transformRide);

    res.json(transformedRides);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ride
// @route   GET /api/rides/:id
// @access  Public
const getRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id).populate({
      path: 'driver',
      select: 'name email phone role',
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    res.json(transformRide(ride));
  } catch (error) {
    next(error);
  }
};

// @desc    Update ride
// @route   PUT /api/rides/:id
// @access  Private (Driver only)
const updateRide = async (req, res, next) => {
  try {
    let ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    // Make sure user is the driver
    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this ride',
      });
    }

    // Validate input if provided
    if (Object.keys(req.body).length > 0) {
      const validation = validateRideInput({ ...ride.toObject(), ...req.body });
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.errors.join(', '),
        });
      }
    }

    // Update ride
    ride = await Ride.findByIdAndUpdate(
      req.params.id,
      {
        from: req.body.from || ride.from,
        to: req.body.to || ride.to,
        date: req.body.date || ride.date,
        time: req.body.time || ride.time,
        price: req.body.price !== undefined ? parseFloat(req.body.price) : ride.price,
        seatsAvailable: req.body.seatsAvailable !== undefined ? parseInt(req.body.seatsAvailable) : ride.seatsAvailable,
        isActive: req.body.isActive !== undefined ? req.body.isActive : ride.isActive,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: 'driver',
      select: 'name email phone role',
    });

    res.json(transformRide(ride));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete ride
// @route   DELETE /api/rides/:id
// @access  Private (Driver only)
const deleteRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    // Make sure user is the driver
    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this ride',
      });
    }

    await ride.deleteOne();

    res.json({
      success: true,
      message: 'Ride deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRide,
  getRides,
  getRide,
  updateRide,
  deleteRide,
};

