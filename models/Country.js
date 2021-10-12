/* eslint-disable linebreak-style */

import mongoose from 'mongoose';

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

export default mongoose.model('Countrys', CountrySchema);
