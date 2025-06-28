import React, { useEffect, useState } from 'react';

function App() {
  const [games, setGames] = useState([]);
  const [playerName, setPlayerName] = useState('');

  // Fetch all games
  const fetchGames = () => {
    fetch('http://localhost:3001/api/games')
      .then(res => res.json())
      .then(data => setGames(data))
      .catch(err => console.error('Error fetching games:', err));
  };

  useEffect(() => {
    fetchGames();
  }, []);

  // Handle form submit
  const startGame = async (e) => {
    e.preventDefault();

    const newGame = {
      player: playerName,
      status: 'in-progress',
      playerHand: [],
      dealerHand: []
    };

    const res = await fetch('http://localhost:3001/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGame)
    });

    if (res.ok) {
      setPlayerName('');
      fetchGames(); // refresh game list
    }
  };
  const handleHit = async (gameId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/games/${gameId}/hit`, {
        method: 'PATCH',
      });
  
      if (res.ok) {
        fetchGames(); // Refresh the updated player hand
      } else {
        console.error('Failed to hit');
      }
    } catch (err) {
      console.error('Error hitting:', err);
    }
  };
  const handleStand = async (gameId) => {
    try {
      await fetch(`http://localhost:3001/api/games/${gameId}/stand`, {
        method: 'PATCH'
      });
      fetchGames(); // Refresh to show updated result
    } catch (err) {
      console.error('Error standing:', err);
    }
  };
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Blackjack Game Tracker</h1>

      <form onSubmit={startGame}>
        <input
          type="text"
          placeholder="Enter player name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          required
        />
        <button type="submit">Start Game</button>
      </form>

      <h2>Game History</h2>
      {games.length === 0 ? (
        <p>No games yet.</p>
      ) : (
<ul>
  {games
    .filter(game => game.player && game.status)
    .map(game => (
      <li key={game._id}>
        <strong>{game.player}</strong> - {game.status}
        <br />
        Player Hand: {game.playerHand.join(', ') || '[]'}<br />
        Dealer Hand: {game.dealerHand.join(', ') || '[]'}
        <br />
        {game.result && <p><strong>Result:</strong> {game.result}</p>}
        <button onClick={() => handleHit(game._id)}>Hit</button>
        <button onClick={() => handleStand(game._id)}>Stand</button>
        <hr />
      </li>
    ))}
</ul>
      )}
    </div>
  );
}

export default App;
