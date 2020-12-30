const gCfg = require('../config/gamesConfig.json');
const gData = require('../config/gameSaveData.json');

function handleGameSystemCommand(command, args, message) {
    return;
}

function handleGameCommand() {
    return;
}
function addGameStatsToPlayer(id,stats) {
    addPlayer(id);
    gData.players[id].statsByGame = stats;
}
function addPlayer(id) {
    if (typeof gData.players[id] === "undefined") {
        gData.players[id] = {}
        updatePlayerUsername(id,username);
    }
}
function updatePlayerUsername(id,username) {
    gData.players[id].username = username;
}