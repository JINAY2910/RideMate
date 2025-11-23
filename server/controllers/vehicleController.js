const Vehicle = require('../models/Vehicle');

// @desc    Add a new vehicle
// @route   POST /api/vehicles
// @access  Private (Driver only)
const addVehicle = async (req, res, next) => {
  try {
    const { registrationNumber, seatingLimit, vehicleType, make, model, color } = req.body;

    if (!registrationNumber || !seatingLimit || !vehicleType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide registration number, seating limit, and vehicle type',
      });
    }

    const vehicle = await Vehicle.create({
      driver: req.user.id,
      registrationNumber,
      seatingLimit: parseInt(seatingLimit),
      vehicleType,
      make: make || '',
      model: model || '',
      color: color || '',
    });

    res.status(201).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all vehicles for current driver
// @route   GET /api/vehicles
// @access  Private (Driver only)
const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ driver: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Driver only)
const updateVehicle = async (req, res, next) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    // Make sure user owns the vehicle
    if (vehicle.driver.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this vehicle',
      });
    }

    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Driver only)
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    // Make sure user owns the vehicle
    if (vehicle.driver.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this vehicle',
      });
    }

    await vehicle.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Vehicle removed',
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
