/* eslint-disable linebreak-style */
import mongoose from 'mongoose';

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

export default mongoose.model('Districts', DistrictSchema);
