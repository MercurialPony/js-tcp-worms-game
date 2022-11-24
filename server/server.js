const Net = require("net");
const MessageParser = require("./message-parser");
const MessageHandler = require("./message-handler");
const Game = require("./game-manager");



const port = process.argv[2] || 1457;

const connectedUsers = {};

const server = Net.createServer(socket =>
{
	const ip = socket.remoteAddress.replace(/^.*:/, '');
	const user = { ip, socket };
	connectedUsers[ip] = user;
	console.log(`${ip} connected`);

	const parser = new MessageParser();
	parser.on("message", (id, data) => MessageHandler.handle(user, id, data));

	socket.on("data", data => parser.pipe(data));
	socket.on("close", () => connectedUsers[ip] = undefined);
	socket.on("error", error => console.error("Error:", ip, error.code));
});

server.listen(port, () => console.log("Server is running on PORT", port));

const game = new Game();
game.init();