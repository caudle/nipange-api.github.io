const mongoose = require('mongoose');

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

module.exports = mongoose.model('Flag', flagSchema);
