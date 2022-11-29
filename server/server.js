const Net = require("net");
const MessageParser = require("./message-parser");
const MessageHandler = require("./message-handler");
const Game = require("./game-manager");
const Config = require("./config.json");
const Datagram = require('dgram');



const game = new Game();
game.init();

const server = Net.createServer(socket => {
	const ip = socket.remoteAddress.replace(/^.*:/, '');
	const user = { ip, socket };
	console.log(`${ip} connected`);

	const parser = new MessageParser();
	parser.on("message", (id, data) => MessageHandler.handle(user, id, data));

	socket.on("data", parser.pipe.bind(parser));
	socket.on("error", error => console.error("Error:", ip, error.code));
	socket.on("close", () => game.playerLeft(user));
});

server.listen(Config.gamePort, () => console.log("Server is running on PORT", Config.gamePort));


const broadcastSocket = Datagram.createSocket('udp4');

broadcastSocket.on('listening', () => {
	console.log('Broadcast socket listening on PORT: ' + broadcastSocket.address().port);
});

broadcastSocket.on('message', (message, remote) => {
	console.log('SERVER RECEIVED:', remote.address + ' : ' + remote.port + ' - ' + message);
	const response = Buffer.from(JSON.stringify(Config.info));
	broadcastSocket.send(response, 0, response.length, remote.port, remote.address);
});

broadcastSocket.bind(Config.broadcastPort);