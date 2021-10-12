import mongoose from 'mongoose';

const reportSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
  comment: {
    type: String,

  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Report', reportSchema);
