/* eslint-disable linebreak-style */
import mongoose from 'mongoose';

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

export default mongoose.model('Wards', WardSchema);
