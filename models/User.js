const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
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
});

module.exports = mongoose.model('User', userSchema);
