const mongoose = require('mongoose');

// create listing schema
const listingSchema = mongoose.Schema({
  name: String,
  propertyType: {
    type: String,
  },
  building: String,
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  bathroom: {
    type: Number,
  },
  bedroom: {
    type: Number,
  },
  size: {
    type: Number,

  },
  location: {
    country: String,
    region: String,
    district: String,
    street: String,
  },
  amenities: [String],
  photos: [String],
  videos: [String],
  price: Number,
  description: String,
  fee: Number,
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
  likes: Number,
  views: Number,
  terms: Number,
  complete: {
    type: Number,
    default: 0,
  },
  package: {
    key: Number,
    name: String,
    description: String,
    amount: Number,
    createdAt: { type: Date, default: Date.now },
    expireAt: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

});
module.exports = mongoose.model('Listing', listingSchema);
