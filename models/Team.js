const mongoose = require('mongoose');

const { Schema } = mongoose;

const teamSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  slug: { type: String, required: true },
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
