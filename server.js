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


// PATCH: Add a card to the player's hand
app.patch('/api/games/:id/hit', async (req, res) => {
  try {
    const card = drawCard();
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    game.playerHand.push(card);
    await game.save();

    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function drawCard() {
  const suits = ['H', 'D', 'C', 'S'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const suit = suits[Math.floor(Math.random() * suits.length)];
  const value = values[Math.floor(Math.random() * values.length)];
  return value + suit;
}
function calculateHandTotal(hand) {
  let total = 0;
  let aces = 0;

  hand.forEach(card => {
    let value = card.slice(0, -1); // remove suit
    if (['J', 'Q', 'K'].includes(value)) {
      total += 10;
    } else if (value === 'A') {
      total += 11;
      aces += 1;
    } else {
      total += parseInt(value);
    }
  });

  // Adjust for Aces if over 21
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}



app.patch('/api/games/:id/stand', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    let dealerTotal = calculateHandTotal(game.dealerHand);

    while (dealerTotal < 17) {
      const card = drawCard();
      game.dealerHand.push(card);
      dealerTotal = calculateHandTotal(game.dealerHand);
    }

    game.status = 'stand';

    const playerTotal = calculateHandTotal(game.playerHand);

    if (playerTotal > 21) {
      game.result = 'Player busts! Dealer wins.';
    } else if (dealerTotal > 21) {
      game.result = 'Dealer busts! Player wins!';
    } else if (playerTotal > dealerTotal) {
      game.result = 'Player wins!';
    } else if (playerTotal < dealerTotal) {
      game.result = 'Dealer wins!';
    } else {
      game.result = "It's a tie!";
    }

    await game.save();
    res.json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});