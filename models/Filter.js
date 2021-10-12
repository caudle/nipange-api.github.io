import mongoose from 'mongoose';

const filterSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  values: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Filter', filterSchema);
