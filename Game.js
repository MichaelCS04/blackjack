const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  player: String,
  status: String,
  playerHand: [String],
  dealerHand: [String],
  result: String, 
}, { timestamps: true });

module.exports = mongoose.model('Game', GameSchema);