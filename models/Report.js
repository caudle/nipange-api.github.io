const mongoose = require('mongoose');

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

module.exports = mongoose.model('Report', reportSchema);
