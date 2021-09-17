/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const DistrictSchema = mongoose.Schema({
  districtName: { type: String, required: true },
  wards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wards',

  }],

  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Regions',
  },

});

module.exports = mongoose.model('Districts', DistrictSchema);
