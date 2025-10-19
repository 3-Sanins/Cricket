// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue, set, update, runTransaction, get, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Firebase config (replace with your real config)
const firebaseConfig = {
  apiKey: "AIzaSyDBhHt1wbY-gwlmUYkLSWblqgs8sptCWps",
  authDomain: "cricket-f3711.firebaseapp.com",
  databaseURL: "https://cricket-f3711-default-rtdb.firebaseio.com",
  projectId: "cricket-f3711",
  storageBucket: "cricket-f3711.firebasestorage.app",
  messagingSenderId: "84308127741",
  appId: "1:84308127741:web:9d7cc9843558d4d053b394"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Constants
const MAX_BALLS = 120;
const DB_PATH_GAMES = "/games";
const DB_PATH_USERS = "/users";
const DB_PATH_MATCHES = "/matches";

// DOM Elements
const gameIdInput = document.getElementById('game-id');
const joinGameBtn = document.getElementById('join-game-btn');
const scoreboard = document.getElementById('scoreboard');
const playersSection = document.getElementById('players-section');
const ballLogSection = document.getElementById('ball-log-section');
const gameStatus = document.getElementById('game-status');
const actionButtons = document.getElementById('action-buttons');
const selections = document.getElementById('selections');
const tossSection = document.getElementById('toss-section');
const batsmanSelection = document.getElementById('batsman-selection');
const bowlerSelection = document.getElementById('bowler-selection');
const defenceBtn = document.getElementById('defence-btn');
const strikeBtn = document.getElementById('strike-btn');
const strokeBtn = document.getElementById('stroke-btn');
const headsBtn = document.getElementById('heads-btn');
const tailsBtn = document.getElementById('tails-btn');
const batsmanSelect = document.getElementById('batsman-select');
const selectBatsmanBtn = document.getElementById('select-batsman-btn');
const bowlerSelect = document.getElementById('bowler-select');
const selectBowlerBtn = document.getElementById('select-bowler-btn');
const slotNumber = document.getElementById('slot-number');

// Team displays
const team1Name = document.getElementById('team1-name');
const team1Score = document.getElementById('team1-score');
const team1Overs = document.getElementById('team1-overs');
const team1Runrate = document.getElementById('team1-runrate');
const team1Target = document.getElementById('team1-target');
const team2Name = document.getElementById('team2-name');
const team2Score = document.getElementById('team2-score');
const team2Overs = document.getElementById('team2-overs');
const team2Runrate = document.getElementById('team2-runrate');
const team2Target = document.getElementById('team2-target');
const batsman1Name = document.getElementById('batsman1-name');
const batsman1Stats = document.getElementById('batsman1-stats');
const striker1Dot = document.getElementById('striker1-dot');
const batsman2Name = document.getElementById('batsman2-name');
const batsman2Stats = document.getElementById('batsman2-stats');
const striker2Dot = document.getElementById('striker2-dot');
const bowlerName = document.getElementById('bowler-name');
const bowlerStats = document.getElementById('bowler-stats');
const ballLog = document.getElementById('ball-log');

// Global variables
let playerName = localStorage.getItem('playerName') || prompt('Enter your name:');
localStorage.setItem('playerName', playerName);
let gameId = null;
let isPlayer1 = false;
let currentPlayerPath = null; // 'player1' or 'player2'
let gameState = {};
let selectedSlot = 1; // For batsman selection

// Utilities
function nowISO() {
    return new Date().toISOString();
}

function oversDisplay(BALLS) {
    const overs = Math.floor(BALLS / 6);
    const balls = BALLS % 6;
    return `${overs}.${balls}`;
}

function runRate(total_runs, BALLS) {
    return BALLS === 0 ? 0 : (total_runs * 6) / BALLS;
}

function remainingBalls(BALLS) {
    return MAX_BALLS - BALLS;
}

function run_probability(MAX_BALLS, battingRating, bowlingRating, batsmanSkill, bowlerSkill, mood) {
    // Simple probabilistic function: returns 0-9
    // Weights based on mood and ratings (higher battingRating increases runs; higher bowlingRating increases wickets)
    let weights = [];
    if (mood === 'defence') {
        // High chance of 0 or wicket
        weights = [30, 10, 5, 5, 5, 0, 0, 20, 20, 5]; // 0:30%, 7:20%, 8:20%, 9:5%
    } else if (mood === 'strike') {
        // Guaranteed 1 run (low risk)
        weights = [0, 80, 0, 0, 0, 0, 0, 10, 10, 0]; // 1:80%, 7:10%, 8:10%
    } else if (mood === 'stroke') {
        // High runs but risk wicket
        weights = [10, 10, 15, 10, 15, 0, 15, 10, 10, 5]; // 2:15%, 4:15%, 6:15%, 7:10%, 8:10%, 9:5%
    }
    // Adjust by ratings (simple multiplier)
    const battingFactor = (battingRating + batsmanSkill) / 200; // Normalize
    const bowlingFactor = (bowlingRating + bowlerSkill) / 200;
    weights[0] *= (1 - battingFactor); // Reduce dots if good batting
    for (let i = 1; i <= 6; i++) weights[i] *= battingFactor; // Increase runs
    weights[7] *= bowlingFactor; // Increase wickets
    weights[8] *= bowlingFactor;
    // Normalize weights
    const total = weights.reduce((a, b) => a + b, 0);
    const normalized = weights.map(w => w / total);
    // Pick outcome
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < normalized.length; i++) {
        cumulative += normalized[i];
        if (rand <= cumulative) return i;
    }
    return 0; // Fallback
}

// Init
function init() {
    // Populate default players in /users (for demo)
    const defaultPlayers = {
        PlayerA: { name: 'PlayerA', battingRating: 80, bowlingRating: 70, battingSkill: 75, bowlingSkill: 65 },
        PlayerB: { name: 'PlayerB', battingRating: 85, bowlingRating: 75, battingSkill: 80, bowlingSkill: 70 }
    };
    set(ref(db, `${DB_PATH_USERS}/${playerName}/selected_team`), defaultPlayers);
    addFirebaseListeners();
}

// Firebase Listeners
function addFirebaseListeners() {
    // Will be set after gameId is known
}

function updateUI(snapshot) {
    gameState = snapshot.val() || {};
    if (!gameState.play) return;

    // Trigger toss if both players joined and no tossWinner yet
    if (gameState.play === "start" && !gameState.tossWinner && gameState.player1 && gameState.player2) {
        doToss();
        return; // UI will update again after toss
    }

    // Update scoreboard
    const p1 = gameState.player1 || {};
    const p2 = gameState.player2 || {};
    team1Name.textContent = `Name: ${p1.name || 'Waiting...'}`;
    team1Score.textContent = `Score: ${p1.total_runs || 0}/${p1.wicketCount || 0}`;
    team1Overs.textContent = `Overs: ${oversDisplay(p1.BALLS || 0)}`;
    team1Runrate.textContent = `Run Rate: ${runRate(p1.total_runs || 0, p1.BALLS || 0).toFixed(2)}`;
    team2Name.textContent = `Name: ${p2.name || 'Waiting...'}`;
    team2Score.textContent = `Score: ${p2.total_runs || 0}/${p2.wicketCount || 0}`;
    team2Overs.textContent = `Overs: ${oversDisplay(p2.BALLS || 0)}`;
    team2Runrate.textContent = `Run Rate: ${runRate(p2.total_runs || 0, p2.BALLS || 0).toFixed(2)}`;

    if (gameState.currentInnings === 2) {
        const target = gameState.target || 0;
        const rrr = remainingBalls(p2.BALLS || 0) > 0 ? ((target - (p2.total_runs || 0)) * 6) / remainingBalls(p2.BALLS || 0) : 0;
        team2Target.textContent = `Target: ${target} (RRR: ${rrr.toFixed(2)})`;
        team2Target.style.display = 'block';
    }

    // Update batsmen and bowler
    const battingPlayer = gameState.currentInnings === 1 ? (p1.chance === 'bat' ? 'player1' : 'player2') : (p2.chance === 'bat' ? 'player2' : 'player1');
    const battingData = gameState[battingPlayer]?.batting || {};
    batsman1Name.textContent = `Slot 1: ${battingData.slot1?.name || 'None'}`;
    batsman1Stats.textContent = `Runs: ${battingData.slot1?.runs || 0} (${battingData.slot1?.balls || 0} balls)`;
    striker1Dot.style.display = battingData.slot1?.strike ? 'inline' : 'none';
    batsman2Name.textContent = `Slot 2: ${battingData.slot2?.name || 'None'}`;
    batsman2Stats.textContent = `Runs: ${battingData.slot2?.runs || 0} (${battingData.slot2?.balls || 0} balls)`;
    striker2Dot.style.display = battingData.slot2?.strike ? 'inline' : 'none';

    const bowlingPlayer = battingPlayer === 'player1' ? 'player2' : 'player1';
    bowlerName.textContent = `Bowler: ${gameState[bowlingPlayer]?.bowler || 'None'}`;
    bowlerStats.textContent = `Wickets: ${gameState[bowlingPlayer]?.bowlerStats?.wickets || 0} (${gameState[bowlingPlayer]?.bowlerStats?.balls || 0} balls)`;

    // Update ball log
    const log = gameState.currentBallLog?.[gameState.currentInnings] || [];
    ballLog.textContent = log.slice(-6).join(' ') || 'No balls yet';

    // Show/hide sections
    scoreboard.style.display = gameState.play !== 'None' ? 'block' : 'none';
    playersSection.style.display = gameState.play === 'inning1' || gameState.play === 'inning2' ? 'block' : 'none';
    ballLogSection.style.display = gameState.play === 'inning1' || gameState.play === 'inning2' ? 'block' : 'none';
    actionButtons.style.display = (gameState.play === 'inning1' || gameState.play === 'inning2') && battingPlayer === currentPlayerPath ? 'block' : 'none';
    selections.style.display = gameState.play === 'start' || gameState.play === 'inning1' || gameState.play === 'inning2' ? 'block' : 'none';
    tossSection.style.display = gameState.play === 'start' && gameState.tossWinner === playerName ? 'block' : 'none';
    batsmanSelection.style.display = (gameState.play === 'inning1' || gameState.play === 'inning2') && battingPlayer === currentPlayerPath && (!battingData.slot1 || !battingData.slot2) ? 'block' : 'none';
    bowlerSelection.style.display = (gameState.play === 'inning1' || gameState.play === 'inning2') && bowlingPlayer === currentPlayerPath && !gameState[bowlingPlayer]?.bowler ? 'block' : 'none';

    gameStatus.textContent = gameState.play === 'finished' ? `Match Finished! Winner: ${gameState.winner}` : `Status: ${gameState.play}`;

    // Populate selects if needed
    if (batsmanSelection.style.display === 'block') promptSelectBatsman(selectedSlot);
    if (bowlerSelection.style.display === 'block') promptSelectBowler();
}

// Create or Join Game
function createOrJoinGame() {
    gameId = gameIdInput.value.trim();
    if (!gameId) return alert('Enter a Game ID');
    const gameRef = ref(db, `${DB_PATH_GAMES}/${gameId}`);
    get(gameRef).then(snapshot => {
        const game = snapshot.val();
        if (!game) {
            // Create game
            set(gameRef, {
                play: "None",
                currentInnings: 0,
                currentBallLog: { "1": [], "2": [] },
                maxBalls: MAX_BALLS,
                createdAt: nowISO()
            });
        }
        if (game?.play === "None") {
            set(ref(db, `${DB_PATH_GAMES}/${gameId}/player1`), createPlayerObject(playerName));
            update(ref(db, `${DB_PATH_GAMES}/${gameId}`), { play: "Yet" });
            isPlayer1 = true;
            currentPlayerPath = 'player1';
        } else if (game?.play === "Yet") {
            if (game.player1?.name === playerName) {
                isPlayer1 = true;
                currentPlayerPath = 'player1';
            } else if (!game.player2) {
                set(ref(db, `${DB_PATH_GAMES}/${gameId}/player2`), createPlayerObject(playerName));
                update(ref(db, `${DB_PATH_GAMES}/${gameId}`), { play: "start" });
                isPlayer1 = false;
                currentPlayerPath = 'player2';
            }
        } else {
            alert("Match in progress. Joining as observer.");
        }
        // Set listener
        onValue(gameRef, updateUI);
        document.getElementById('game-id-section').style.display = 'none';
    });
}

function createPlayerObject(name) {
    return {
        name: name,
        chance: "",
        wicketCount: 0,
        total_runs: 0,
        BALLS: 0,
        batters: [],
        bowler: "",
        batting: { slot1: null, slot2: null },
        bowlerStats: { wickets: 0, balls: 0 },
        lastSelectedBowlerAtOver: -1
    };
}

// Toss
function doToss() {
    const pick = Math.random() < 0.5 ? 'player1' : 'player2';
    update(ref(db, `${DB_PATH_GAMES}/${gameId}`), { tossWinner: gameState[pick].name });
}

function setTossChoice(choice) {
    const other = currentPlayerPath === 'player1' ? 'player2' : 'player1';
    update(ref(db, `${DB_PATH_GAMES}/${gameId}/${currentPlayerPath}`), { chance: choice });
    update(ref(db, `${DB_PATH_GAMES}/${gameId}/${other}`), { chance: choice === 'bat' ? 'bowl' : 'bat' });
    // Start innings 1
    startInnings(1);
}

// Selections
function batsman_selection(slotIndex, selectedPlayerName) {
    get(ref(db, `${DB_PATH_USERS}/${playerName}/selected_team/${selectedPlayerName}`)).then(snapshot => {
        const playerInfo = snapshot.val();
        if (!playerInfo) return alert('Player not in team');
        const battingNode = {
            name: playerInfo.name,
            runs: 0,
            fours: 0,
            sixes: 0,
            balls: 0,
            battingRating: playerInfo.battingRating,
            battingSkill: playerInfo.battingSkill,
            strike: slotIndex === 1
        };
        update(ref(db, `${DB_PATH_GAMES}/${gameId}/${currentPlayerPath}/batting/slot${slotIndex}`), battingNode);
    });
}

function bowler_selection(selectedBowlerName) {
    get(ref(db, `${DB_PATH_USERS}/${playerName}/selected_team/${selectedBowlerName}`)).then(snapshot => {
        if (!snapshot.val()) return alert('Bowler not in team');
        update(ref(db, `${DB_PATH_GAMES}/${gameId}/${currentPlayerPath}`), { bowler: selectedBowlerName });
    });
}

function promptSelectBatsman(slot) {
    selectedSlot = slot;
    slotNumber.textContent = slot;
    batsmanSelect.innerHTML = '';
    get(ref(db, `${DB_PATH_USERS}/${playerName}/selected_team`)).then(snapshot => {
        const team = snapshot.val() || {};
        Object.keys(team).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = team[key].name;
            batsmanSelect.appendChild(option);
        });
    });
}

function promptSelectBowler() {
    bowlerSelect.innerHTML = '';
    get(ref(db, `${DB_PATH_USERS}/${playerName}/selected_team`)).then(snapshot => {
        const team = snapshot.val() || {};
                Object.keys(team).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = team[key].name;
        bowlerSelect.appendChild(option);
        });
        });
        }

        // Start Innings
        function startInnings(inningNumber) {
          update(ref(db, `${DB_PATH_GAMES}/${gameId}`), { currentInnings: inningNumber, play: `inning${inningNumber}` });
          if (inningNumber === 2) {
            const first = gameState.player1.chance === 'bat' ? gameState.player1 : gameState.player2;
            const target = first.total_runs + 1;
            update(ref(db, `${DB_PATH_GAMES}/${gameId}`), { target });
          }
        }

        // Deliver Ball
        function deliverBall(mood) {
          const battingPlayerPath = gameState.currentInnings === 1 ? (gameState.player1.chance === 'bat' ? 'player1' : 'player2') : (gameState.player2.chance === 'bat' ? 'player2' : 'player1');
          const bowlingPlayerPath = battingPlayerPath === 'player1' ? 'player2' : 'player1';
          const strikerSlot = whichSlotHasStrikeTrue(battingPlayerPath);
          if (!strikerSlot) return alert('No striker selected');

          const striker = gameState[battingPlayerPath].batting[strikerSlot];
          if (!striker) return alert('Striker missing');

          const bowlerName = gameState[bowlingPlayerPath].bowler;
          if (!bowlerName) return alert('Bowler not selected');

          get(ref(db, `${DB_PATH_USERS}/${gameState[bowlingPlayerPath].name}/selected_team/${bowlerName}`)).then(snapshot => {
            const bowlerInfo = snapshot.val();
            if (!bowlerInfo) return alert('Bowler data missing');

            const outcome = run_probability(MAX_BALLS, striker.battingRating, bowlerInfo.bowlingRating, striker.battingSkill, bowlerInfo.bowlingSkill, mood);

            const gameRef = ref(db, `${DB_PATH_GAMES}/${gameId}`);
            runTransaction(gameRef, (currentData) => {
              if (!currentData) return currentData;
              const p = currentData[battingPlayerPath];
              const bp = currentData[bowlingPlayerPath];
              if (outcome === 9) {
                // Wide
                p.total_runs += 1;
                appendBallLog(currentData, battingPlayerPath, 'W');
              } else if (outcome === 0) {
                // Dot
                p.BALLS += 1;
                p.batting[strikerSlot].balls += 1;
                bp.bowlerStats.balls += 1;
                appendBallLog(currentData, battingPlayerPath, '0');
              } else if ([1, 2, 3, 4, 6].includes(outcome)) {
                const runs = outcome;
                p.total_runs += runs;
                p.BALLS += 1;
                p.batting[strikerSlot].runs += runs;
                p.batting[strikerSlot].balls += 1;
                bp.bowlerStats.balls += 1;
                if (runs === 4) p.batting[strikerSlot].fours += 1;
                if (runs === 6) p.batting[strikerSlot].sixes += 1;
                if (runs % 2 === 1) swapStrikeFlags(currentData, battingPlayerPath);
                appendBallLog(currentData, battingPlayerPath, runs.toString());
              } else if ([7, 8].includes(outcome)) {
                // Wicket
                p.BALLS += 1;
                p.batting[strikerSlot].balls += 1;
                bp.bowlerStats.wickets += 1;
                handleWicket(currentData, battingPlayerPath, bowlingPlayerPath, strikerSlot);
                appendBallLog(currentData, battingPlayerPath, 'W');
              }

              // Check over end
              if (p.BALLS % 6 === 0) swapStrikeFlags(currentData, battingPlayerPath);

              // Check innings end
              if (p.BALLS >= MAX_BALLS || p.wicketCount >= 10) endInnings(currentData, battingPlayerPath);

              return currentData;
            });
          });
        }

        // Helper functions
        function whichSlotHasStrikeTrue(playerPath) {
          const s1 = gameState[playerPath]?.batting?.slot1;
          const s2 = gameState[playerPath]?.batting?.slot2;
          if (s1?.strike) return 'slot1';
          if (s2?.strike) return 'slot2';
          return null;
        }

        function swapStrikeFlags(data, playerPath) {
          const s1 = data[playerPath].batting.slot1;
          const s2 = data[playerPath].batting.slot2;
          if (s1 && s2) {
            const temp = s1.strike;
            s1.strike = s2.strike;
            s2.strike = temp;
          }
        }

        function appendBallLog(data, battingPlayerPath, token) {
          const innings = data.currentInnings;
          data.currentBallLog[innings].push(token);
          if (data.currentBallLog[innings].length > 120) data.currentBallLog[innings].shift();
        }

        function handleWicket(data, battingPlayerPath, bowlingPlayerPath, strikerSlot) {
          const strikerObj = data[battingPlayerPath].batting[strikerSlot];
          data[battingPlayerPath].batters.push({
            name: strikerObj.name,
            runs: strikerObj.runs,
            balls: strikerObj.balls,
            fours: strikerObj.fours,
            sixes: strikerObj.sixes,
            outAt: nowISO()
          });
          data[battingPlayerPath].batting[strikerSlot] = null;
          data[battingPlayerPath].wicketCount += 1;
          // Prompt next batsman
          if (data[battingPlayerPath].wicketCount < 10) promptSelectNextBatsman(data[battingPlayerPath].name, strikerSlot);
        }

        function promptSelectNextBatsman(userName, emptySlot) {
          // UI: Show selection for next batsman (similar to promptSelectBatsman)
          selectedSlot = emptySlot === 'slot1' ? 1 : 2;
          batsmanSelection.style.display = 'block';
          promptSelectBatsman(selectedSlot);
        }

        function endInnings(data, endedBattingPlayerPath) {
          if (data.currentInnings === 1) {
            startInnings(2);
          } else {
            const p1runs = data.player1.total_runs;
            const p2runs = data.player2.total_runs;
            data.winner = p1runs > p2runs ? data.player1.name : p2runs > p1runs ? data.player2.name : 'tie';
            data.play = 'finished';
            data.finishedAt = nowISO();
            saveMatchResultToProfiles(data);
          }
        }

        function saveMatchResultToProfiles(data) {
          const matchId = 'match_' + Date.now();
          const matchObj = {
            createdAt: data.createdAt,
            finishedAt: data.finishedAt,
            player1: data.player1,
            player2: data.player2,
            currentBallLog: data.currentBallLog,
            winner: data.winner,
            target: data.target,
            maxBalls: data.maxBalls
          };
          set(ref(db, `${DB_PATH_MATCHES}/${matchId}`), matchObj);
          // Update user stats
          runTransaction(ref(db, `${DB_PATH_USERS}/${data.player1.name}/matchesPlayed`), v => (v || 0) + 1);
          runTransaction(ref(db, `${DB_PATH_USERS}/${data.player2.name}/matchesPlayed`), v => (v || 0) + 1);
          if (data.winner !== 'tie') {
            runTransaction(ref(db, `${DB_PATH_USERS}/${data.winner}/wins`), v => (v || 0) + 1);
          }
        }

        // Event Listeners
        joinGameBtn.addEventListener('click', createOrJoinGame);
        headsBtn.addEventListener('click', () => setTossChoice('bat'));
        tailsBtn.addEventListener('click', () => setTossChoice('bowl'));
        selectBatsmanBtn.addEventListener('click', () => batsman_selection(selectedSlot, batsmanSelect.value));
        selectBowlerBtn.addEventListener('click', () => bowler_selection(bowlerSelect.value));
        defenceBtn.addEventListener('click', () => deliverBall('defence'));
        strikeBtn.addEventListener('click', () => deliverBall('strike'));
        strokeBtn.addEventListener('click', () => deliverBall('stroke'));

        // Start
        init();
