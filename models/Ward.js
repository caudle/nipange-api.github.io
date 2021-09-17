/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const WardSchema = mongoose.Schema({
  wardName: { type: String, required: true },
  streets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Streets',

  }],

  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Districts',
  },

});

module.exports = mongoose.model('Wards', WardSchema);
