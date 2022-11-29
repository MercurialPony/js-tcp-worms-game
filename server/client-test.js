const Socket = require("net").Socket;
const MessageParser = require("./message-parser");
const MessageSender = require("./message-sender");
const ReadLine = require("readline");
const Config = require("./config.json");
const Datagram = require('dgram');

const socket = new Socket();
const prompter = ReadLine.createInterface({ input: process.stdin, output: process.stdout });

const username = process.argv[2] || "hewwo" + Math.floor(Math.random() * 1000);
const ip = process.argv[3] || "localhost";

const parser = new MessageParser();
parser.on("message", (id, data) =>
{
	console.log("msg", id, data.length > 512 ? "Data too long" : data.toString());

	if(id === 6)
	{
		prompter.question("Enter anything to send shoot message\n", () =>
		{
			console.log("sent");
			MessageSender.json(socket, 1, { direction: { x: Math.random(), y: Math.random() }, power: Math.random() });
		});
	}
});

socket.on("data", data => parser.pipe(data));

socket.connect({ port: 1457, host: ip }, () =>
{
	console.log("Connected to server");
	
	MessageSender.json(socket, 0, { username });
});


const message = Buffer.from('Server?');
const broadcastSocket = Datagram.createSocket('udp4');

broadcastSocket.on('listening', () => {
	broadcastSocket.setBroadcast(true);
	setInterval(() => {
		broadcastSocket.send(
			message,
			0,
			message.length,
			parseInt(Config.broadcastPort),
			'10.102.255.255'
	)}, 5000);
});

broadcastSocket.on('message', (message, remote) => {
	console.log('CLIENT RECEIVED: ', remote.address + ' : ' + remote.port + ' - ' + message);
});

broadcastSocket.bind('457');