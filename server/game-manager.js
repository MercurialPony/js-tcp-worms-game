const GameLoop = require("./game-loop");
const MessageHandler = require("./message-handler");

const players = [];

// lobby stuff
const minPlayersToStart = 2;
let startTimer = 0;

MessageHandler.json(0, (user, data) =>
{
	user.player = {  username: data.username };
	players.push(user);
});

function update(delta)
{
	
}

const gameLoop = new GameLoop(20, update).start();