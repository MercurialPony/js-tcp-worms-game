const GameLoop = require("./game-loop");
const MessageHandler = require("./message-handler");

const players = [];

MessageHandler.json(0, (user, data) =>
{
	user.username = data.username;
	players.push(user);
});

function update(delta)
{

}

const gameLoop = new GameLoop(20, delta => console.log(delta)).start();
console.log(gameLoop);