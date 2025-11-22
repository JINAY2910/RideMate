const User = require('../models/User');

// @desc    Add a vehicle to driver
// @route   POST /api/vehicles
// @access  Private (Driver only)
const addVehicle = async (req, res, next) => {
  try {
    const { registrationNumber, seatingLimit, vehicleType, make, model, color } = req.body;

    // Validation
    if (!registrationNumber || !seatingLimit || !vehicleType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide registration number, seating limit, and vehicle type',
      });
    }

    if (!['2-wheeler', '3-wheeler', '4-wheeler'].includes(vehicleType)) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle type must be 2-wheeler, 3-wheeler, or 4-wheeler',
      });
    }

    if (seatingLimit < 1) {
      return res.status(400).json({
        success: false,
        message: 'Seating limit must be at least 1',
      });
    }

    // Check if user is a driver
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can add vehicles',
      });
    }

    // Check if vehicle with same registration number already exists
    const existingVehicle = user.vehicles?.find(
      (v) => v.registrationNumber.toLowerCase() === registrationNumber.toLowerCase()
    );
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this registration number already exists',
      });
    }

    // Initialize vehicles array if it doesn't exist
    if (!user.vehicles) {
      user.vehicles = [];
    }

    // Add vehicle to user's vehicles array
    const newVehicle = {
      registrationNumber,
      seatingLimit: parseInt(seatingLimit),
      vehicleType,
      make: make || '',
      model: model || '',
      color: color || '',
    };

    user.vehicles.push(newVehicle);
    
    // Save user document
    const savedUser = await user.save();

    // Get the newly added vehicle (it will have an _id after save)
    const addedVehicle = savedUser.vehicles[savedUser.vehicles.length - 1];

    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully',
      vehicle: addedVehicle,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all vehicles for a driver
// @route   GET /api/vehicles
// @access  Private (Driver only)
const getVehicles = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can view vehicles',
      });
    }

    res.json({
      success: true,
      vehicles: user.vehicles || [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:vehicleId
// @access  Private (Driver only)
const updateVehicle = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const { registrationNumber, seatingLimit, vehicleType, make, model, color } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can update vehicles',
      });
    }

    const vehicle = user.vehicles?.id(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    // Update fields
    if (registrationNumber) vehicle.registrationNumber = registrationNumber;
    if (seatingLimit) vehicle.seatingLimit = parseInt(seatingLimit);
    if (vehicleType) {
      if (!['2-wheeler', '3-wheeler', '4-wheeler'].includes(vehicleType)) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle type must be 2-wheeler, 3-wheeler, or 4-wheeler',
        });
      }
      vehicle.vehicleType = vehicleType;
    }
    if (make !== undefined) vehicle.make = make;
    if (model !== undefined) vehicle.model = model;
    if (color !== undefined) vehicle.color = color;

    await user.save();

    res.json({
      success: true,
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:vehicleId
// @access  Private (Driver only)
const deleteVehicle = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only drivers can delete vehicles',
      });
    }

    const vehicle = user.vehicles?.id(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    vehicle.remove();
    await user.save();

    res.json({
      success: true,
      message: 'Vehicle deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
};

