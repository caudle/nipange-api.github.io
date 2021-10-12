import mongoose from 'mongoose';

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
    ward: String,
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
  likes: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  terms: {
    per: String, // per month
    duration: Number, // 6 months
  },
  complete: {
    type: Number,
    default: 0,
  },
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
  createdAt: {
    type: Date,
    default: Date.now,
  },

});
export default mongoose.model('Listing', listingSchema);
