/* eslint-disable linebreak-style */
import mongoose from 'mongoose';

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

export default mongoose.model('Regions', RegionSchema);
