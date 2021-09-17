/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const RegionSchema = mongoose.Schema({
  regionName: { type: String, required: true },
  districts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Districts',

  }],

  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Countrys',
  },

});

module.exports = mongoose.model('Regions', RegionSchema);
