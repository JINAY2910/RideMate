const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const { validateRideInput } = require('../utils/validate');
const { geocode } = require('../utils/geocoding');

// Transform ride to match frontend format
const transformRide = (ride) => {
  if (!ride) return null;

  const rideObj = ride.toObject ? ride.toObject() : ride;

  // Handle driver - could be populated object or just ID
  const driverName = rideObj.driver?.name || (typeof rideObj.driver === 'string' ? 'Unknown' : 'Unknown');
  const driverRating = rideObj.driver?.rating || 4.5;

  // Handle vehicle details (populated)
  let vehicleDetails = null;
  if (rideObj.vehicle) {
    vehicleDetails = {
      _id: rideObj.vehicle._id.toString(),
      registrationNumber: rideObj.vehicle.registrationNumber,
      model: rideObj.vehicle.model,
      make: rideObj.vehicle.make,
      color: rideObj.vehicle.color,
      type: rideObj.vehicle.vehicleType,
      seatingLimit: rideObj.vehicle.seatingLimit
    };
  }

  return {
    _id: rideObj._id.toString(),
    id: rideObj._id.toString(),
    driver: {
      name: driverName,
      rating: driverRating,
      id: rideObj.driver?._id?.toString()
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
      total: (rideObj.seatsAvailable || 0) + (rideObj.participants?.reduce((sum, p) => sum + (p.seatsBooked || 1), 0) || 0),
      available: rideObj.seatsAvailable || 0,
    },
    notes: rideObj.notes || '',
    requests: (rideObj.requests || []).map(req => ({
      _id: req._id?.toString() || '',
      rider: req.rider?._id ? {
        id: req.rider._id.toString(),
        name: req.rider.name || req.name || 'Unknown',
        email: req.rider.email || '',
        phone: req.rider.phone || '',
      } : null,
      name: req.rider?.name || req.name || 'Unknown',
      rating: req.rating || 5,
      status: req.status || 'Pending',
      seatsRequested: req.seatsRequested || 1,
      createdAt: req.createdAt ? req.createdAt.toISOString() : new Date().toISOString(),
    })),
    participants: (rideObj.participants || []).map(part => ({
      rider: part.rider?._id ? {
        id: part.rider._id.toString(),
        name: part.rider.name || part.name || 'Unknown',
        email: part.rider.email || '',
        phone: part.rider.phone || '',
      } : null,
      name: part.rider?.name || part.name || 'Unknown',
      status: part.status || 'Confirmed',
      seatsBooked: part.seatsBooked || 1,
    })),
    vehicle: vehicleDetails,
    driverLocation: rideObj.driverLocation?.coordinates ? {
      lat: rideObj.driverLocation.coordinates[1],
      lng: rideObj.driverLocation.coordinates[0],
    } : null,
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

    // Handle vehicle ID
    const vehicleId = req.body.vehicleId || null;
    if (vehicleId) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }
      if (vehicle.driver.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to use this vehicle',
        });
      }
    }

    // Handle driver location (lat/lng from request body)
    let driverLocationGeoJSON = null;
    if (req.body.driverLocation) {
      const driverLat = req.body.driverLocation.lat || req.body.driverLocation.latitude;
      const driverLng = req.body.driverLocation.lng || req.body.driverLocation.longitude;
      if (driverLat && driverLng) {
        driverLocationGeoJSON = {
          type: 'Point',
          coordinates: [parseFloat(driverLng), parseFloat(driverLat)], // GeoJSON: [lng, lat]
        };
      }
    }

    // Update driver's location in User model if provided
    if (driverLocationGeoJSON) {
      await User.findByIdAndUpdate(req.user.id, {
        location: driverLocationGeoJSON,
      });
    }

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
      vehicle: vehicleId,
      driverLocation: driverLocationGeoJSON,
    });

    const populatedRide = await Ride.findById(ride._id).populate({
      path: 'driver',
      select: 'name email phone role',
    }).populate('vehicle');

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
    const { from, to, date, isActive, nearStart, nearDest, radius, driver, participant } = req.query;

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

    // Filter by driver name if provided (for "My Rides" view)
    if (driver) {
      // Find user by name and filter rides by driver ID
      const driverUser = await User.findOne({ name: driver, role: 'driver' });
      if (driverUser) {
        query.driver = driverUser._id;
      }
    }

    // Filter by participant if provided (for riders to see their booked rides)
    if (participant) {
      const participantUser = await User.findOne({ name: participant, role: 'rider' });
      if (participantUser) {
        query['participants.name'] = participant;
      }
    }

    const rides = await Ride.find(query)
      .populate({
        path: 'driver',
        select: 'name email phone role',
      })
      .populate('vehicle')
      .populate({
        path: 'requests.rider',
        select: 'name email phone',
      })
      .populate({
        path: 'participants.rider',
        select: 'name email phone',
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
    const ride = await Ride.findById(req.params.id)
      .populate({
        path: 'driver',
        select: 'name email phone role',
      })
      .populate('vehicle')
      .populate({
        path: 'requests.rider',
        select: 'name email phone',
      })
      .populate({
        path: 'participants.rider',
        select: 'name email phone',
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

    // Map 'status' field to 'isActive' if provided (for backward compatibility or PATCH requests)
    let isActive = req.body.isActive;
    if (req.body.status === 'Completed') {
      isActive = false;
    } else if (req.body.status === 'Active') {
      isActive = true;
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
        isActive: isActive !== undefined ? isActive : ride.isActive,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: 'driver',
      select: 'name email phone role',
    }).populate('vehicle');

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

// @desc    Add a ride request (rider wants to book)
// @route   POST /api/rides/:id/requests
// @access  Private (Rider only)
const addRequest = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    // Check if ride is active
    if (!ride.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Ride is not active',
      });
    }

    // Check if user is a rider (allow if role is not 'driver' or if role is 'rider')
    // This handles cases where role might be undefined or different
    if (req.user.role === 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Drivers cannot request to book their own rides. Only riders can request to book rides.',
      });
    }

    // Log for debugging if role is unexpected
    if (req.user.role && req.user.role !== 'rider') {
      console.warn(`Unexpected user role: ${req.user.role} for user ${req.user.id}`);
    }

    // Check if rider already has a pending or approved request
    const existingRequest = ride.requests.find(
      (r) => r.rider && r.rider.toString() === req.user.id.toString() && r.status !== 'Rejected'
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You have already requested to book this ride',
      });
    }

    // Get seats requested (default 1)
    const seatsRequested = parseInt(req.body.seatsRequested || req.body.seats || 1);

    // Check if enough seats available
    if (ride.seatsAvailable < seatsRequested) {
      return res.status(400).json({
        success: false,
        message: `Only ${ride.seatsAvailable} seat(s) available`,
      });
    }

    // Add request to ride
    const newRequest = {
      rider: req.user.id,
      name: req.user.name || req.body.name || 'Rider',
      rating: req.body.rating || 5,
      status: 'Pending',
      seatsRequested: seatsRequested,
    };

    ride.requests.push(newRequest);
    await ride.save();

    // Create a Booking record for the rider (status: Pending)
    await Booking.create({
      ride: ride._id,
      rider: req.user.id,
      seatsBooked: seatsRequested,
      totalPrice: ride.price * seatsRequested,
      status: 'Pending',
    });

    // Populate and return updated ride
    const populatedRide = await Ride.findById(ride._id).populate({
      path: 'driver',
      select: 'name email phone role',
    }).populate('vehicle').populate({
      path: 'requests.rider',
      select: 'name email phone',
    });

    res.status(201).json(transformRide(populatedRide));
  } catch (error) {
    next(error);
  }
};

// @desc    Update request status (approve/reject)
// @route   PATCH /api/rides/:id/requests/:requestId
// @access  Private (Driver only, owner only)
const updateRequestStatus = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    // Check if user is the driver
    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the driver can approve or reject requests',
      });
    }

    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Approved" or "Rejected"',
      });
    }

    // Find the request
    const request = ride.requests.id(req.params.requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Check if request is already processed
    if (request.status === 'Approved' && status === 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Request is already approved',
      });
    }

    // If changing from Approved to Rejected, restore seats and remove from participants
    if (request.status === 'Approved' && status === 'Rejected') {
      ride.seatsAvailable += request.seatsRequested;
      // Remove from participants
      ride.participants = ride.participants.filter(
        p => p.rider && p.rider.toString() !== request.rider.toString()
      );
    }

    // If approving, check seats and update
    if (status === 'Approved' && request.status !== 'Approved') {
      if (ride.seatsAvailable < request.seatsRequested) {
        return res.status(400).json({
          success: false,
          message: `Only ${ride.seatsAvailable} seat(s) available`,
        });
      }

      // Reduce available seats
      ride.seatsAvailable -= request.seatsRequested;

      // Check if rider is already a participant (shouldn't happen, but safety check)
      const existingParticipant = ride.participants.find(
        p => p.rider && p.rider.toString() === request.rider.toString()
      );

      if (!existingParticipant) {
        // Add to participants
        ride.participants.push({
          rider: request.rider,
          name: request.name,
          status: 'Confirmed',
          seatsBooked: request.seatsRequested,
        });
      }
    }

    // Update request status
    request.status = status;
    await ride.save();

    // Update the corresponding Booking record
    // We match by ride ID and rider ID since we don't store booking ID in the request object yet
    await Booking.findOneAndUpdate(
      { ride: ride._id, rider: request.rider },
      { status: status }
    );

    // Populate and return updated ride
    const populatedRide = await Ride.findById(ride._id).populate({
      path: 'driver',
      select: 'name email phone role',
    }).populate('vehicle').populate({
      path: 'requests.rider',
      select: 'name email phone',
    }).populate({
      path: 'participants.rider',
      select: 'name email phone',
    });

    res.json(transformRide(populatedRide));
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
  addRequest,
  updateRequestStatus,
};

