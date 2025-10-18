document.addEventListener('DOMContentLoaded', function() {
  const savedName = localStorage.getItem('playerName');
  if (savedName) {
    document.getElementById('nameInput').style.display = 'none';
    document.getElementById('mainButtons').style.display = 'block';
  }

  document.getElementById('saveNameBtn').addEventListener('click', function() {
    const name = document.getElementById('playerName').value;
    if (name) {
      localStorage.setItem('playerName', name);
      document.getElementById('nameInput').style.display = 'none';
      document.getElementById('mainButtons').style.display = 'block';
    } else {
      alert('Please enter a name');
    }
  });

  document.getElementById('startGameBtn').addEventListener('click', function() {
    window.location.href = 'bidding.html'; // Link to start_game.html
  });

  document.getElementById('myDataBtn').addEventListener('click', function() {
    window.location.href = 'my_data.html'; // Link to my_data.html
  });

  document.getElementById('playersDataBtn').addEventListener('click', function() {
    window.location.href = 'players_data.html'; // Link to players_data.html
  });
});