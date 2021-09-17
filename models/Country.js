/* eslint-disable linebreak-style */

const mongoose = require('mongoose');

const CountrySchema = mongoose.Schema({
  countryName: {
    type: String,
    required: true,
  },
  regions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Regions',
  }],

});

module.exports = mongoose.model('Countrys', CountrySchema);
