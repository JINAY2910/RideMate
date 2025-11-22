const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Driver is required'],
    },
    from: {
      type: String,
      required: [true, 'From location is required'],
      trim: true,
    },
    to: {
      type: String,
      required: [true, 'To location is required'],
      trim: true,
    },
    startCoordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude] for GeoJSON
        required: true,
      },
    },
    destCoordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude] for GeoJSON
        required: true,
      },
    },
    notes: {
      type: String,
      default: '',
    },
    requests: [{
      name: String,
      rating: { type: Number, default: 5 },
      status: { type: String, enum: ['Approved', 'Pending'], default: 'Pending' },
    }],
    participants: [{
      name: String,
      status: String,
    }],
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    seatsAvailable: {
      type: Number,
      required: [true, 'Seats available is required'],
      min: [1, 'At least 1 seat must be available'],
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster searches
rideSchema.index({ from: 1 });
rideSchema.index({ to: 1 });
rideSchema.index({ date: 1 });
rideSchema.index({ driver: 1 });
rideSchema.index({ isActive: 1 });
rideSchema.index({ from: 1, to: 1, date: 1 });

// GeoJSON 2dsphere indexes for location-based queries
rideSchema.index({ startCoordinates: '2dsphere' });
rideSchema.index({ destCoordinates: '2dsphere' });

module.exports = mongoose.model('Ride', rideSchema);

