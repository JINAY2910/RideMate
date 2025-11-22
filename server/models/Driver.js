const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    phone: {
      type: String,
      trim: true,
    },
    vehicles: [{
      registrationNumber: {
        type: String,
        trim: true,
      },
      seatingLimit: {
        type: Number,
        min: 1,
      },
      vehicleType: {
        type: String,
        enum: ['2-wheeler', '3-wheeler', '4-wheeler'],
      },
      make: {
        type: String,
        trim: true,
      },
      model: {
        type: String,
        trim: true,
      },
      color: {
        type: String,
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
driverSchema.index({ email: 1 }, { unique: true });

// Hash password before saving
driverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
driverSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
driverSchema.methods.toJSON = function () {
  const driver = this.toObject();
  delete driver.password;
  return driver;
};

module.exports = mongoose.model('Driver', driverSchema, 'drivers');

