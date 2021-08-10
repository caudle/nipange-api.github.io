const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  user: {
    id: String,
    firstName: String,
    lastName: String,
    dp: String,
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Review', reviewSchema);
