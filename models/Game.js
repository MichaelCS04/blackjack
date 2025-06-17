const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  player: String,
  status: String, // e.g., "in-progress", "won", "lost"
  playerHand: [String], // e.g., ["5H", "7D"]
  dealerHand: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Game', gameSchema);
