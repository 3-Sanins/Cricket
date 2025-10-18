document.addEventListener('DOMContentLoaded', function() {
  const firebaseConfig = {
    apiKey: "AIzaSyDBhHt1wbY-gwlmUYkLSWblqgs8sptCWps",
    authDomain: "cricket-f3711.firebaseapp.com",
    databaseURL: "https://cricket-f3711-default-rtdb.firebaseio.com",
    projectId: "cricket-f3711",
    storageBucket: "cricket-f3711.firebasestorage.app",
    messagingSenderId: "84308127741",
    appId: "1:84308127741:web:9d7cc9843558d4d053b394"
  };

  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();


    // Get current user from localStorage (default to "Akshit" if not set)
const currentUser = localStorage.getItem('playerName') || "Akshit";

// Fetch team data from Firebase
let samplePlayers = [];
const teamRef = database.ref('users/' + currentUser + '/team');
teamRef.once('value', (snapshot) => {
  const teamData = snapshot.val() || {};
  samplePlayers = Object.values(teamData).map(player => ({
    name: player.name,
    type: player.type,
    battingSkills: player.battingSkills || 'N/A',
    battingRating: player.battingRating,
    bowlingRating: player.bowlingRating,
    abilities: player.battingSkills || 'N/A', // Assuming abilities = battingSkills
    history: {
      matches: player.matches || 0,
      runs: player.runs || 0,
      wickets: player.wickets || 0,
      fifties: player.fifties || 0,
      hundreds: player.hundreds || 0,
      fiveWickets: player['5 wicket hauls'] || 0,
      avg: player.avg || 0
    }
  }));
  // Now populate the table with samplePlayers (your existing forEach loop will work)
  populateTable();
});

// Function to populate table (move your forEach loop here)
function populateTable() {
  const tableBody = document.getElementById('playersTable').querySelector('tbody');
  samplePlayers.forEach(player => {
  const row = tableBody.insertRow();
  row.insertCell(0).textContent = player.name;
  row.insertCell(1).textContent = player.type;
  row.insertCell(2).textContent = player.battingSkills + ' (Rating: ' + player.battingRating + ')';
  row.insertCell(3).textContent = player.bowlingRating > 0 ? 'Rating: ' + player.bowlingRating : 'N/A';
  row.addEventListener('click', function() {
    document.getElementById('popupName').textContent = player.name;
    document.getElementById('popupBattingSkills').textContent = player.battingSkills + ' (Rating: ' + player.battingRating + ')';
    document.getElementById('popupBowlingSkills').textContent = player.bowlingRating > 0 ? 'Rating: ' + player.bowlingRating : 'N/A';
    document.getElementById('popupAbilities').textContent = player.abilities;
    document.getElementById('popupMatches').textContent = player.history.matches;
    document.getElementById('popupRuns').textContent = player.history.runs;
    document.getElementById('popupWickets').textContent = player.history.wickets;
    document.getElementById('popupFifties').textContent = player.history.fifties;
    document.getElementById('popupHundreds').textContent = player.history.hundreds;
    document.getElementById('popup5Wickets').textContent = player.history.fiveWickets;
    document.getElementById('popupAvg').textContent = player.history.avg;
    document.getElementById('playerPopup').style.display = 'block';
  });
});
}
    

    document.getElementById('closePopupBtn').addEventListener('click', function() {
      document.getElementById('playerPopup').style.display = 'none';
    });

    document.getElementById('makeCaptainBtn').addEventListener('click', function() {
      alert('Make Captain - update logic here');
      // Add your Firebase update logic
    });

    document.getElementById('removeCaptainBtn').addEventListener('click', function() {
      alert('Remove Captain - update logic here');
      // Add your Firebase update logic
    });

    document.getElementById('selectBtn').addEventListener('click', function() {
      alert('Select player - update logic here');
      // Add your Firebase update logic
    });

    document.getElementById('deselectBtn').addEventListener('click', function() {
      alert('Deselect player - update logic here');
      // Add your Firebase update logic
    });

    document.getElementById('backBtn').addEventListener('click', function() {
      window.location.href = 'index.html';
    });
  } else {
    console.error('Firebase not loaded - check scripts');
  }
});