/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const StreetSchema = mongoose.Schema({
  streetsName: { type: String, required: true },

  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wards',
  },

});

module.exports = mongoose.model('Streets', StreetSchema);
