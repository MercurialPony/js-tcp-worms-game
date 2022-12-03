const Net = require("net");
const MessageReader = require("./message-reader");
const MessageHandler = require("./message-handler");
const Game = require("./game-manager");
const Config = require("./config.json");
const Datagram = require('dgram');



/*=========== Game init ===========*/

const game = new Game();
game.init();



/*=========== TCP game connection ===========*/

class User
{
	constructor(socket)
	{
		this.socket = socket;
		this.ip = socket.remoteAddress.replace(/^.*:/, "");
	}

	logIn(player)
	{
		this.player = player;
	}

	logOut()
	{
		this.player = undefined;
	}

	loggedIn()
	{
		return !!this.player;
	}

	info()
	{
		return this.ip + (this.player ? " (" + this.player.username + ")" : "");
	}

	kick(reason)
	{
		console.log("Kicked", this.info(), reason);
		this.socket.destroy();
	}
}

const server = Net.createServer(socket =>
{
	const user = new User(socket);
	console.log(user.info(), "connected");

	socket.setTimeout(Config.internal.maxSocketIdleMillis);

	const reader = new MessageReader();
	reader.on("message", (id, data) =>
	{
		if(data.length > Config.internal.maxMsgLengthBytes)
		{
			user.kick("for sending a message that is too long:", data.length + "/" + Config.internal.maxMsgLengthBytes, "bytes");
			return;
		}

		try
		{
			MessageHandler.handle(user, id, data);
		}
		catch(error)
		{
			console.log(user.info(), "sent a malformed message:", data.toString());
			console.log(error);
		}
	});

	socket.on("data", reader.pipe.bind(reader));
	socket.on("error", error => console.error("Error:", user.info(), error.code));
	socket.on("close", () => game.playerLeft(user));
	socket.on("timeout", () => user.kick("for idling"));
});

server.listen(Config.public.port, () => console.log("Server is running on PORT", Config.public.port));



/*=========== UDP broadcast connection ===========*/

const broadcastPort = 2914;
const broadcastSocket = Datagram.createSocket("udp4");

broadcastSocket.on("listening", () =>
{
	console.log("Broadcast socket listening on PORT", broadcastPort);
});

broadcastSocket.on("message", (message, remote) =>
{
	//console.log('SERVER RECEIVED:', remote.address + ' : ' + remote.port + ' - ' + message);
	const response = Object.assign({ players: game.playerCount() }, Config.public);
	const resBuf = Buffer.from(JSON.stringify(response));
	broadcastSocket.send(resBuf, 0, resBuf.length, remote.port, remote.address);
});

broadcastSocket.bind(broadcastPort);