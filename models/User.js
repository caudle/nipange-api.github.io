const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,

    min: 2,
    max: 255,
  },
  lastName: {
    type: String,

    min: 2,
    max: 255,
  },
  phone: {
    type: String,

    min: 10,
    max: 13,
  },
  email: {
    type: String,

    min: 2,
    max: 255,
  },
  username: {
    type: String,

    min: 6,
    max: 1024,
  },
  dp: {
    type: String,
  },
  type: {
    type: String,
    default: 'customer',
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024,
  },
  device: {
    type: String,

    min: 2,
    max: 255,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
    min: 2,
    max: 255,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
    min: 2,
    max: 255,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  listings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
  }],
  favourites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
  }],
  package: {
    key: {
      type: Number,
      default: 2,
    },
    name: {
      type: String,
      default: 'free',
    },
    description: {
      type: String,
      default: 'upgrade to premium to enjoy exclusive features',
    },
    amount: {
      type: Number,
      default: 0,
    },
    createdAt: { type: Date, default: Date.now },
    expireAt: {
      type: Date,
      required: false,
    },
  },
});

module.exports = mongoose.model('User', userSchema);
