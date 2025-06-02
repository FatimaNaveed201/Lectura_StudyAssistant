const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  timestamp: { type: Number, default: Date.now },
  content: {
    summary: String,
    flashcards: [{ question: String, answer: String }],
    quiz: [{
      question: String,
      options: [String],
      correctAnswer: String
    }]
  }
});

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
