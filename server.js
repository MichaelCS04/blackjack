const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Game = require('./models/Game');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

// Start game route
app.post('/api/start-game', (req, res) => {
  const { playerName } = req.body;
  res.json({ message: `Game started for ${playerName}` });
});

// === Game CRUD API ===

// Create new game
app.post('/api/games', async (req, res) => {
  try {
    const game = await Game.create(req.body);
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all games
app.get('/api/games', async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete game by ID
app.delete('/api/games/:id', async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: 'Game deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Connect to MongoDB ===
// Add your database name: /blackjack
mongoose.connect('mongodb+srv://Cluster25678:9DrDtb0ribSUqtCV@cluster25678.tpecgwl.mongodb.net/blackjack?retryWrites=true&w=majority&appName=Cluster25678')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
