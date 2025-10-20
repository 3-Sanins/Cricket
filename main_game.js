// main_game.js (revised + fixed based on analysis and Firebase structure)
// Assumes firebase compat libs are loaded (as in your HTML)

///// CONFIG /////
const firebaseConfig = {
  apiKey: "AIzaSyDBhHt1wbY-gwlmUYkLSWblqgs8sptCWps",
  authDomain: "cricket-f3711.firebaseapp.com",
  databaseURL: "https://cricket-f3711-default-rtdb.firebaseio.com",
  projectId: "cricket-f3711",
  storageBucket: "cricket-f3711.firebasestorage.app",
  messagingSenderId: "84308127741",
  appId: "1:84308127741:web:9d7cc9843558d4d053b394"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

///// GLOBAL STATE /////
const playerName = localStorage.getItem('playerName');
if (!playerName) {
  alert('Player name missing in localStorage (playerName). Set it before playing.');
  throw new Error('Missing playerName in localStorage');
}

let currentUserKey = null;   // 'player1' or 'player2' for this client
let opponentKey = null;
const gameRef = database.ref('game');
const userRef = database.ref(`users/${playerName}`);
let gameData = null;         // latest snapshot value
let currentOverBalls = [];   // local for display, synced via Firebase

///// DOM SHORTCUTS /////
const scorecardEl = document.getElementById('scorecard');
const battingUIEl = document.getElementById('battingUI');
const bowlingUIEl = document.getElementById('bowlingUI');
const currentOverEl = document.getElementById('currentOver');
const popupEl = document.getElementById('popup');
const popupBody = document.getElementById('popupBody');
const popupClose = document.getElementById('popupClose');
const endGameUI = document.getElementById('endGameUI');
const gameContainer = document.getElementById('gameContainer');

popupClose.onclick = hidePopup;

///// Real-time game listener /////
gameRef.on('value', (snapshot) => {
  gameData = snapshot.val();
  if (!gameData) {
    gameRef.set({ play: 'None' });
    return;
  }

  if (gameData.player1 && gameData.player1.name === playerName) {
    currentUserKey = 'player1';
    opponentKey = 'player2';
  } else if (gameData.player2 && gameData.player2.name === playerName) {
    currentUserKey = 'player2';
    opponentKey = 'player1';
  }

  const playState = gameData.play;
  if (playState === 'None') handleNoneState();
  else if (playState === 'Yet') handleYetState();
  else if (playState === 'start') handleStartState();
  else if (playState === 'inning1' || playState === 'inning2') handleInningState();
});

///// STATE HANDLERS /////
async function handleNoneState() {
  if (!gameData.player1) {
    const playerTemplate = {
      name: playerName,
      wicket: 0,  // Fixed: Start at 0
      total_runs: 0,
      BALLS: 0,
      playing11: {},
      baller: '',
      batters: {},
      batting: {}
    };
    await gameRef.child('player1').set(playerTemplate);

    // Populate playing11 from selected_team, only if player exists
    try {
      const userSnap = await userRef.once('value');
      const userData = userSnap.val();
      if (userData && userData.selected_team) {
        const selectedTeam = userData.selected_team;
        const playing11 = {};
        Object.keys(selectedTeam).forEach(p => {
          if (p !== 'captain' && selectedTeam[p]) {  // Ensure player data exists
            playing11[p] = {
              ...selectedTeam[p],
              ball_faced: 0, ball_thrown: 0, runs_made: 0, runs_faced: 0,
              wicket_taken: 0, six: 0, four: 0, inning: 0
            };
          }
        });
        await gameRef.child('player1/playing11').update(playing11);
      }
    } catch (e) {
      console.warn('Error populating playing11:', e);
    }

    currentUserKey = 'player1';
    opponentKey = 'player2';
    await gameRef.update({ play: 'Yet' });
  }
}

async function handleYetState() {
  if (gameData.player1 && gameData.player1.name === playerName) {
    currentUserKey = 'player1';
    opponentKey = 'player2';
    return;
  }

  if (!gameData.player2) {
    const playerTemplate = {
      name: playerName,
      wicket: 0,
      total_runs: 0,
      BALLS: 0,
      playing11: {},
      baller: '',
      batters: {},
      batting: {}
    };
    await gameRef.child('player2').set(playerTemplate);

    try {
      const userSnap = await userRef.once('value');
      const userData = userSnap.val();
      if (userData && userData.selected_team) {
        const selectedTeam = userData.selected_team;
        const playing11 = {};
        Object.keys(selectedTeam).forEach(p => {
          if (p !== 'captain' && selectedTeam[p]) {
            playing11[p] = {
              ...selectedTeam[p],
              ball_faced: 0, ball_thrown: 0, runs_made: 0, runs_faced: 0,
              wicket_taken: 0, six: 0, four: 0, inning: 0
            };
          }
        });
        await gameRef.child('player2/playing11').update(playing11);
      }
    } catch (e) {
      console.warn('Error populating playing11:', e);
    }

    currentUserKey = 'player2';
    opponentKey = 'player1';
    await gameRef.update({ play: 'start' });
  }
}

function handleStartState() {
  if (!gameData.tossWinner) {
    const tossWinner = Math.random() < 0.5 ? 'player1' : 'player2';
    gameRef.update({ tossWinner });
    return;
  }

  if (gameData.tossWinner && currentUserKey === gameData.tossWinner) {
    showPopup('Toss won! Choose', `
      <div style="display:flex;gap:8px">
        <button onclick="setChoice('bat')">Bat</button>
        <button onclick="setChoice('ball')">Ball</button>
      </div>
    `);
  }

  if (gameData.chance && gameData.chance.player1 && gameData.chance.player2) {
    gameRef.update({ play: 'inning1' });
  }
}

window.setChoice = function(choice) {
  if (!currentUserKey || !opponentKey) return;
  const opponentChoice = choice === 'bat' ? 'ball' : 'bat';
  gameRef.update({
    [`chance/${currentUserKey}`]: choice,
    [`chance/${opponentKey}`]: opponentChoice
  });
  hidePopup();
};

function handleInningState() {
  // Add this check at the top to prevent UI updates after game ends
  if (gameData.play !== 'inning1' && gameData.play !== 'inning2') {
    // Game has ended, hide all UI and show end screen if not already
    gameContainer.style.display = 'none';
    endGameUI.style.display = 'block';
    return;
  }

  // Rest of the function remains the same...
  if (gameData.play === 'inning2' && !gameData.chance?.player1) {
    scorecardEl.innerHTML = "<div>Preparing second innings...</div>";
    return;
  }

  if (!currentUserKey) {
    scorecardEl.innerHTML = `<div>Waiting for players...</div>`;
    battingUIEl.style.display = 'none';
    bowlingUIEl.style.display = 'none';
    return;
  }

  const userNode = gameData[currentUserKey] || {};
  const opponentNode = gameData[opponentKey] || {};
  const userChance = gameData.chance ? gameData.chance[currentUserKey] : undefined;
  if (!userChance) {
    scorecardEl.innerHTML = `<div>Waiting for toss choice...</div>`;
    battingUIEl.style.display = 'none';
    bowlingUIEl.style.display = 'none';
    return;
  }

  if (userChance === 'bat') {
    battingUIEl.style.display = 'block';
    bowlingUIEl.style.display = 'none';
    const battingCount = Object.keys(userNode.batting || {}).length;
    if (battingCount < 2 && Object.keys(userNode.batters || {}).length < 10) {
      batsmanSelection(userNode);
    }
    handleBatting(userNode, opponentNode, gameData);
  } else {
    battingUIEl.style.display = 'none';
    bowlingUIEl.style.display = 'block';
    if (!userNode.baller || userNode.baller === '') {
      bowlerSelection(userNode);
    }
    handleBowling(userNode, opponentNode, gameData);
  }

  // Sync currentOverBalls from Firebase
  if (gameData.currentOver) {
    currentOverBalls = gameData.currentOver;
  }
}

///// BATTING LOGIC /////
function handleBatting(userData, opponentData, currentGameData) {
  displayScorecard(userData, opponentData, currentGameData.play);
  currentOverEl.innerHTML = `Current Over: ${currentOverBalls.join(' ')}`;
  document.getElementById('defenceBtn').onclick = () => playBall('def');
  document.getElementById('strikeBtn').onclick = () => playBall('strike');
  document.getElementById('strokeBtn').onclick = () => playBall('stroke');

  async function playBall(mood) {
    const latestGame = (await gameRef.once('value')).val();
    const userNode = latestGame[currentUserKey] || {};
    const opponentNode = latestGame[opponentKey] || {};
    const battingObj = userNode.batting || {};
    const strikerName = Object.keys(battingObj).find(b => battingObj[b].strike);
    const bowlerName = opponentNode.baller;
    if (!strikerName || !bowlerName) return;

    const batsmanP = userNode.playing11?.[strikerName] || {};
    const bowlerP = opponentNode.playing11?.[bowlerName] || {};
    const run = run_probability(userNode.BALLS || 0, batsmanP.battingRating, bowlerP.bowlingRating, batsmanP.battingSkills, bowlerP.bowlingSkills || bowlerP.battingSkills, mood);

    const updates = {};
    const userRoot = `/${currentUserKey}`;
    const oppRoot = `/${opponentKey}`;

    if (run === 9) {
      updates[`${userRoot}/total_runs`] = (userNode.total_runs || 0) + 1;
      updates[`${userRoot}/playing11/${strikerName}/runs_made`] = (batsmanP.runs_made || 0) + 1;
    } else if (run === 1) {
      updates[`${userRoot}/total_runs`] = (userNode.total_runs || 0) + 1;
      updates[`${userRoot}/playing11/${strikerName}/runs_made`] = (batsmanP.runs_made || 0) + 1;
      updates[`${userRoot}/batting/${strikerName}/strike`] = false;
      const other = Object.keys(battingObj).find(b => b !== strikerName);
      if (other) updates[`${userRoot}/batting/${other}/strike`] = true;
    } else if ([2, 3].includes(run)) {
      updates[`${userRoot}/total_runs`] = (userNode.total_runs || 0) + run;
      updates[`${userRoot}/playing11/${strikerName}/runs_made`] = (batsmanP.runs_made || 0) + run;
      if (run % 2 === 1) {
        updates[`${userRoot}/batting/${strikerName}/strike`] = false;
        const other = Object.keys(battingObj).find(b => b !== strikerName);
        if (other) updates[`${userRoot}/batting/${other}/strike`] = true;
      }
    } else if (run === 4) {
      updates[`${userRoot}/total_runs`] = (userNode.total_runs || 0) + 4;
      updates[`${userRoot}/playing11/${strikerName}/runs_made`] = (batsmanP.runs_made || 0) + 4;
      updates[`${userRoot}/playing11/${strikerName}/four`] = (batsmanP.four || 0) + 1;
    } else if (run === 6) {
      updates[`${userRoot}/total_runs`] = (userNode.total_runs || 0) + 6;
      updates[`${userRoot}/playing11/${strikerName}/runs_made`] = (batsmanP.runs_made || 0) + 6;
      updates[`${userRoot}/playing11/${strikerName}/six`] = (batsmanP.six || 0) + 1;
    } else if (run === 7 || run === 8) {
  updates[`${userRoot}/playing11/${strikerName}/inning`] = 1;
  updates[`${userRoot}/batters/${strikerName}`] = { ...(batsmanP || {}) };
  updates[`${userRoot}/wicket`] = (userNode.wicket || 0) + 1;
  updates[`${oppRoot}/playing11/${bowlerName}/wicket_taken`] = (bowlerP.wicket_taken || 0) + 1;

  // Add: Trigger batsman selection if wickets < 10
  const newWicketCount = (userNode.wicket || 0) + 1;
  if (newWicketCount < 10) {
    // Switch striker to the other batsman if available
    const battingObj = userNode.batting || {};
    const other = Object.keys(battingObj).find(b => b !== strikerName);
    if (other) {
      updates[`${userRoot}/batting/${other}/strike`] = true;
    }
    // Note: batsmanSelection will be called after update via listener
  }
    }

    if (run !== 9) {
      updates[`${userRoot}/BALLS`] = (userNode.BALLS || 0) + 1;
      updates[`${userRoot}/playing11/${strikerName}/ball_faced`] = (batsmanP.ball_faced || 0) + 1;
      updates[`${oppRoot}/playing11/${bowlerName}/ball_thrown`] = (bowlerP.ball_thrown || 0) + 1;
      currentOverBalls.push(run);
      updates['currentOver'] = currentOverBalls;
    }

    await gameRef.update(updates);

    const newBalls = (userNode.BALLS || 0) + (run !== 9 ? 1 : 0);
    if (newBalls % 6 === 0 && run !== 9) {
      currentOverBalls = [];
      await gameRef.update({ currentOver: [], [`${opponentKey}/baller`]: '' });
    }

    const post = (await gameRef.once('value')).val();
    const updatedUser = post[currentUserKey] || {};
    const updatedOpp = post[opponentKey] || {};

    if (post.play === 'inning2' && (updatedUser.total_runs || 0) > (updatedOpp.total_runs || 0)) {
      endGame(currentUserKey);
      return;
    }

    if ((updatedUser.wicket || 0) >= 10) {
      if (post.play === 'inning1') {
        const temp = post.chance[currentUserKey];
        await gameRef.update({
          [`chance/${currentUserKey}`]: post.chance[opponentKey],
          [`chance/${opponentKey}`]: temp,
          play: 'inning2'
        });
      } else {
        endGame(opponentKey);
      }
    }

    if ((updatedUser.BALLS || 0) >= 12) {
      if (post.play === 'inning1') {
        const newChance = {
          [currentUserKey]: post.chance[opponentKey],
          [opponentKey]: post.chance[currentUserKey]
        };
        await gameRef.update({ play: 'inning2', chance: newChance });
      } else {
        const winner = (updatedUser.total_runs || 0) > (updatedOpp.total_runs || 0) ? currentUserKey : (updatedUser.total_runs || 0) < (updatedOpp.total_runs || 0) ? opponentKey : 'tie';
        endGame(winner);
      }
    }
  }
}

///// BOWLING LOGIC /////
function handleBowling(userData, opponentData, currentGameData) {
  displayScorecard(opponentData, userData, currentGameData.play);
  currentOverEl.innerHTML = `Current Over: ${currentOverBalls.join(' ')}`;
  document.getElementById('defenceBtn').onclick = () => playBallBowling('def');
  document.getElementById('strikeBtn').onclick = () => playBallBowling('strike');
  document.getElementById('strokeBtn').onclick = () => playBallBowling('stroke');

  async function playBallBowling(mood) {
    const latestSnap = await gameRef.once('value');
    const game = latestSnap.val() || {};
    const userNode = game[currentUserKey] || {};
    const opponentNode = game[opponentKey] || {};
    const batsman = Object.keys(opponentNode.batting || {}).find(b => opponentNode.batting[b].strike);
    const bowler = userNode.baller;
    if (!batsman || !bowler) return;

    const batsmanP = opponentNode.playing11?.[batsman] || {};
    const bowlerP = userNode.playing11?.[bowler] || {};
    const run = run_probability(
      opponentNode.BALLS || 0,
      batsmanP.battingRating,
      bowlerP.bowlingRating,
      batsmanP.battingSkills,
      bowlerP.bowlingSkills || bowlerP.battingSkills, // Fixed: Use bowlingSkills
      mood
    );

    const updates = {};
    const oppRoot = `/${opponentKey}`;
    const userRoot = `/${currentUserKey}`;

    if (run === 9) {
      updates[`${oppRoot}/total_runs`] = (opponentNode.total_runs || 0) + 1;
      updates[`${oppRoot}/playing11/${batsman}/runs_made`] = (batsmanP.runs_made || 0) + 1;
    } else if (run === 1) {
      updates[`${oppRoot}/total_runs`] = (opponentNode.total_runs || 0) + 1;
      updates[`${oppRoot}/playing11/${batsman}/runs_made`] = (batsmanP.runs_made || 0) + 1;
      updates[`${oppRoot}/batting/${batsman}/strike`] = false;
      const other = Object.keys(opponentNode.batting || {}).find(b => b !== batsman);
      if (other) updates[`${oppRoot}/batting/${other}/strike`] = true;
    } else if ([2, 3].includes(run)) {
      updates[`${oppRoot}/total_runs`] = (opponentNode.total_runs || 0) + run;
      updates[`${oppRoot}/playing11/${batsman}/runs_made`] = (batsmanP.runs_made || 0) + run;
      if (run % 2 === 1) {
        updates[`${oppRoot}/batting/${batsman}/strike`] = false;
        const other = Object.keys(opponentNode.batting || {}).find(b => b !== batsman);
        if (other) updates[`${oppRoot}/batting/${other}/strike`] = true;
      }
    } else if (run === 4) {
      updates[`${oppRoot}/total_runs`] = (opponentNode.total_runs || 0) + 4;
      updates[`${oppRoot}/playing11/${batsman}/runs_made`] = (batsmanP.runs_made || 0) + 4;
      updates[`${oppRoot}/playing11/${batsman}/four`] = (batsmanP.four || 0) + 1;
    } else if (run === 6) {
      updates[`${oppRoot}/total_runs`] = (opponentNode.total_runs || 0) + 6;
      updates[`${oppRoot}/playing11/${batsman}/runs_made`] = (batsmanP.runs_made || 0) + 6;
      updates[`${oppRoot}/playing11/${batsman}/six`] = (batsmanP.six || 0) + 1;
    } else if (run === 7 || run === 8) {
      updates[`${oppRoot}/playing11/${batsman}/inning`] = 1;
      updates[`${oppRoot}/batters/${batsman}`] = { ...(batsmanP || {}) };
      updates[`${oppRoot}/wicket`] = (opponentNode.wicket || 0) + 1;
      updates[`${userRoot}/playing11/${bowler}/wicket_taken`] = (bowlerP.wicket_taken || 0) + 1;
    }

    if (run !== 9) {
      updates[`${oppRoot}/BALLS`] = (opponentNode.BALLS || 0) + 1;
      updates[`${oppRoot}/playing11/${batsman}/ball_faced`] = (batsmanP.ball_faced || 0) + 1;
      updates[`${userRoot}/playing11/${bowler}/ball_thrown`] = (bowlerP.ball_thrown || 0) + 1;
      currentOverBalls.push(run);
      updates['currentOver'] = currentOverBalls;
    }

    await gameRef.update(updates);

    const postSnap = await gameRef.once('value');
    const postGame = postSnap.val() || {};
    const oppNow = postGame[opponentKey] || {};
    const userNow = postGame[currentUserKey] || {};

    const ballsNow = oppNow.BALLS || 0;
    if (ballsNow % 6 === 0 && run !== 9) {
      currentOverBalls = [];
      await gameRef.update({ currentOver: [], [`${currentUserKey}/baller`]: '' });
      bowlerSelection(userNow);
    }

    if ((oppNow.BALLS || 0) >= 12) {
      if (postGame.play === 'inning1') {
        const newChance = {
          [currentUserKey]: postGame.chance[opponentKey],
          [opponentKey]: postGame.chance[currentUserKey]
        };
        await gameRef.update({ play: 'inning2', chance: newChance });
        return;
      } else {
        const winner =
          (oppNow.total_runs || 0) > (userNow.total_runs || 0) ?
          opponentKey :
          currentUserKey;
        endGame(winner);
        return;
      }
    }

    if (postGame.play === 'inning2' && (oppNow.total_runs || 0) > (userNow.total_runs || 0)) {
      endGame(opponentKey);
      return;
    }

    displayScorecard(oppNow, userNow, postGame.play);
    currentOverEl.innerHTML = `Current Over: ${currentOverBalls.join(' ')}`;
  }
}

///// SELECTION POPUPS /////
function batsmanSelection(userNode) {
  if (!gameData || !currentUserKey || !gameData.chance || gameData.chance[currentUserKey] !== 'bat') return;

  if (Object.keys(gameData[currentUserKey].batting || {}).length >= 2) return;

  const playing11 = gameData[currentUserKey].playing11 || {};
  const outList = gameData[currentUserKey].batters || {};
  let html = `<h3>Select Batsman</h3><table><tr><th>Name</th><th>Batting Rating</th><th>Skill</th><th>Select</th></tr>`;
  Object.keys(playing11).forEach(player => {
    if (outList[player]) return;
    if (gameData[currentUserKey].batting && gameData[currentUserKey].batting[player]) return;
    const p = playing11[player];
    html += `<tr><td>${player}</td><td>${p.battingRating || '-'}</td><td>${p.battingSkills || '-'}</td><td><input type="radio" name="batsman" value="${player}"></td></tr>`;
  });
  html += `</table><div style="text-align:right"><button onclick="selectBatsman()">Play</button></div>`;
  showPopup('', html);

  window.selectBatsman = function() {
    const selectedRadio = document.querySelector('input[name="batsman"]:checked');
    if (!selectedRadio) return alert('Select a batsman');
    const selected = selectedRadio.value;
    const battingPath = `${currentUserKey}/batting/${selected}`;
    const battingCount = Object.keys(gameData[currentUserKey].batting || {}).length;
    const isStriker = battingCount === 0;
    gameRef.child(battingPath).set({ strike: isStriker });
    hidePopup();
  };
}
function bowlerSelection(userNode) {
  // Add check to prevent popup if game has ended
  if (!gameData || gameData.play !== 'inning1' && gameData.play !== 'inning2') return;

  if (!gameData || !currentUserKey || !gameData.chance || gameData.chance[currentUserKey] !== 'ball') return;

  // ... (rest of the function remains the same)
  if (!gameData || !currentUserKey || !gameData.chance || gameData.chance[currentUserKey] !== 'ball') return;

  const playing11 = gameData[currentUserKey].playing11 || {};
  let html = `<h3>Select Bowler</h3><table><tr><th>Name</th><th>Bowling Rating</th><th>Skill</th><th>Select</th></tr>`;
  Object.keys(playing11).forEach(player => {
    const p = playing11[player];
    if (p.type && p.type.toLowerCase() === 'batter') return; // Exclude pure batsmen
    html += `<tr><td>${player}</td><td>${p.bowlingRating || '-'}</td><td>${p.bowlingSkills || p.battingSkills || '-'}</td><td><input type="radio" name="bowler" value="${player}"></td></tr>`;
  });
  html += `</table><div style="text-align:right"><button onclick="selectBowler()">Play</button></div>`;
  showPopup('', html);

  window.selectBowler = function() {
    const sel = document.querySelector('input[name="bowler"]:checked');
    if (!sel) return alert('Select a bowler');
    const selected = sel.value;
    gameRef.child(`${currentUserKey}/baller`).set(selected);
    hidePopup();
    bowlingUIEl.style.display = 'block';
  };
}

///// OUT / END-GAME /////
async function endGame(winnerKey) {
  gameContainer.style.display = 'none';
  endGameUI.style.display = 'block';
  document.getElementById('winnerText').innerHTML = `${winnerKey} WON the game!`;

  const snapshot = (await gameRef.once('value')).val() || {};
  let scoreboardHTML = '<h3>Scoreboard</h3>';
  ['player1', 'player2'].forEach(player => {
    const data = snapshot[player] || {};
    scoreboardHTML += `<h4>${data.name || player}</h4><table><tr><th>Batsman</th><th>Runs</th><th>Balls</th><th>SR</th></tr>`;
    const p11 = data.playing11 || {};
    Object.keys(p11).forEach(b => {
      const runs = p11[b].runs_made || 0;
      const balls = p11[b].ball_faced || 0;
      const sr = balls > 0 ? ((runs / balls) * 100).toFixed(2) : '0.00';
      scoreboardHTML += `<tr><td>${b}</td><td>${runs}</td><td>${balls}</td><td>${sr}</td></tr>`;
    });
    scoreboardHTML += '</table>';
  });
  document.getElementById('scoreboard').innerHTML = scoreboardHTML;

  try {
    const playersToUpdate = [snapshot.player1, snapshot.player2];
    for (const p of playersToUpdate) {
      if (!p || !p.name) continue;
      const userSnapshot = await database.ref(`users/${p.name}`).once('value');
      const userObj = userSnapshot.val() || {};
      await database.ref(`users/${p.name}`).update({
        matchesPlayed: (userObj.matchesPlayed || 0) + 1,
        wins: ((winnerKey === (p === snapshot.player1 ? 'player1' : 'player2')) ? ((userObj.wins || 0) + 1) : (userObj.wins || 0))
      });
      const teamObj = userObj.team || {};
      const p11 = p.playing11 || {};
      for (const plName of Object.keys(p11)) {
        if (teamObj[plName]) {
          const p11Stats = p11[plName];
          await database.ref(`users/${p.name}/team/${plName}`).update({
            runs: (teamObj[plName].runs || 0) + (p11Stats.runs_made || 0),
            wickets: (teamObj[plName].wickets || 0) + (p11Stats.wicket_taken || 0),
            matches: (teamObj[plName].matches || 0) + 1,
            fifties: (teamObj[plName].fifties || 0) + ((p11Stats.runs_made >= 50 && p11Stats.runs_made < 100) ? 1 : 0),
            hundreds: (teamObj[plName].hundreds || 0) + ((p11Stats.runs_made >= 100) ? 1 : 0),
            '5 wicket hauls': (teamObj[plName]['5 wicket hauls'] || 0) + ((p11Stats.wicket_taken >= 5) ? 1 : 0)
          });
        }
      }
    }
  } catch (e) {
    console.warn('Error updating user stats:', e);
  }

  document.getElementById('okBtn').onclick = () => {
    window.location.href = 'index.html';
  };
}

///// UI HELPERS /////
function displayScorecard(userData, opponentData, play) {
  userData = userData || {};
  opponentData = opponentData || {};
  const overs = Math.floor((userData.BALLS || 0) / 6);
  const runRate = (userData.BALLS || 0) > 0 ? ((userData.total_runs || 0) / (userData.BALLS || 0) * 6).toFixed(2) : '0.00';
  let html = `<div>Total Runs: ${(userData.total_runs || 0)} (${overs} overs, RR: ${runRate})`;
  if (play === 'inning2') {
    const chasing = (opponentData.total_runs || 0);
    const ballsLeft = Math.max(12 - (userData.BALLS || 0), 0);
    const runsRequired = Math.max(chasing - (userData.total_runs || 0), 0);
    const rrr = ballsLeft > 0 ? ((runsRequired / ballsLeft) * 6).toFixed(2) : '0.00';
    html += ` Chasing: ${chasing} (RRR: ${rrr})`;
  }
  const wickets = (userData.wicket || 0);
  html += `<br>Wickets: ${wickets}`;
  Object.keys(userData.batting || {}).forEach(batsman => {
    const strike = userData.batting[batsman].strike ? '● ' : '';
    const p = userData.playing11 && userData.playing11[batsman] ? userData.playing11[batsman] : {};
    const runs = p.runs_made || 0;
    const balls = p.ball_faced || 0;
    const sr = balls > 0 ? ((runs / balls) * 100).toFixed(2) : '0.00';
    html += `<br>${strike}${batsman}: ${runs} (${balls}, SR: ${sr})`;
  });
  html += `</div>`;
  scorecardEl.innerHTML = html;
}

function showPopup(title, body) {
  popupBody.innerHTML = `<h2>${title}</h2>${body}`;
  popupEl.style.display = 'flex';
}

function hidePopup() {
  popupEl.style.display = 'none';
}

///// Random run probability placeholder /////
function run_probability(BALLS, battingRating, bowlingRating, battingSkills, bowlingSkills, mood) {
  // Placeholder: Implement real logic using ratings, skills, mood, BALLS for probability distribution
  // e.g., weighted random based on (battingRating - bowlingRating) + skill bonuses
  const r = Math.floor(Math.random() * 10);
  return r; // 0-9 as per spec
}

///// END OF FILE /////
