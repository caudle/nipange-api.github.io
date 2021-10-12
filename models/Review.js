import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  user: {
    id: String,
    username: String,

    dp: String,
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Review', reviewSchema);
