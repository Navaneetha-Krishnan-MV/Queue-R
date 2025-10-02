const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: {
    type: Number,
    required: true,
    unique: true
  },
  questionText: {
    type: String,
    required: true
  },
  correctAnswer: {
    type: String,
    required: true,
    trim: true
  },
  points: {
    type: Number,
    required: true,
    default: 10
  },
  qrToken: {
    type: String,
    required: true,
    unique: true
  },
  isAnswered: {
    type: Boolean,
    default: false
  },
  answeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  answeredAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);