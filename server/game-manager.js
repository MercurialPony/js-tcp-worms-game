const GameLoop = require("./game-loop");
const MessageSender = require("./message-sender");
const MessageHandler = require("./message-handler");
const TerrainGenerator = require("./terrain-generator");

const players = [];

// lobby stuff
const minPlayersToStart = 2;
const timeToStart = 10 * 1000; // 10 seconds

let startTimer = null;

// game stuff
let terrain;

function update(delta)
{

}

const gameLoop = new GameLoop(20, update).start();

function startGame()
{
	console.log("game started");
	const randomType = Math.floor(Math.random() * 3) + 1;
	terrain = TerrainGenerator.generate(`./terrain_bases/base_${randomType}.png`);
	terrain.writeToDisk("./test.png");
}

function playersChanged()
{
	if(players.length < minPlayersToStart)
	{
		clearTimeout(startTimer);
		startTimer = null;
	
		return;
	}

	if(!startTimer)
	{
		console.log("players connected. Started countdown");
		startTimer = setTimeout(startGame, timeToStart)
	}
}


MessageHandler.json(0, (user, data) =>
{
	user.player = {  username: data.username };
	players.push(user);
	playersChanged();
});