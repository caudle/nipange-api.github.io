/* eslint-disable linebreak-style */
import mongoose from 'mongoose';

const StreetSchema = mongoose.Schema({
  streetsName: { type: String, required: true },

  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wards',
  },

});

export default mongoose.model('Streets', StreetSchema);
