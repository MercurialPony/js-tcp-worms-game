const GameLoop = require("./game-loop");
const MessageSender = require("./message-sender");
const MessageHandler = require("./message-handler");
const TerrainGenerator = require("./terrain-generator");
const PositionGenerator = require("./position-generator");



const players = [];

// lobby stuff
const minPlayersToStart = 1;
const timeToStart = 1 * 1000; // 10 seconds

let startTimer = null;

// game stuff
let terrain;


function initLevel()
{
	const randomType = Math.floor(Math.random() * 3) + 1;
	console.log("chose terrain type", randomType);
	terrain = TerrainGenerator.generate(`./terrain_bases/base_${randomType}.png`);
	console.log("generated terrain");
}

function update(delta)
{
	//console.log(delta);
}

const gameLoop = new GameLoop(20, update).start();

function startMatch()
{
	console.log("game started");
	const spawnPoints = PositionGenerator.pickPoints(terrain, players.length);
	console.log("picked spawn points for", players.length, "players");
	//terrain.writeToDisk("./test.png");
}

function playersChanged()
{
	if(players.length < minPlayersToStart)
	{
		if(startTimer)
		{
			console.log("player left. Stopped countdown");
			clearTimeout(startTimer);
			startTimer = null;
		}
	
		return;
	}

	if(!startTimer)
	{
		console.log("players connected. Started countdown");
		startTimer = setTimeout(startMatch, timeToStart)
	}
}


MessageHandler.json(0, (user, data) =>
{
	user.player = { username: data.username };
	players.push(user);
	playersChanged();
});



module.exports = {
	initLevel
};