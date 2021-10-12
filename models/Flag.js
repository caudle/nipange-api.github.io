import mongoose from 'mongoose';

const flagSchema = mongoose.Schema({
  value: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Flag', flagSchema);
