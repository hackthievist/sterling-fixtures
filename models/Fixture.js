const mongoose = require('mongoose');

const { Schema } = mongoose;

const fixtureSchema = new Schema({
  homeTeam: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  awayTeam: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  fixtureSlug: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: 'pending',
    enum: ['pending', 'ongoing', 'cancelled', 'completed'],
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  url: {
    type: String,
  },
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const Fixture = mongoose.model('Fixture', fixtureSchema);

module.exports = Fixture;
