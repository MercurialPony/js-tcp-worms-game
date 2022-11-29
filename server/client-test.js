const Socket = require("net").Socket;
const MessageParser = require("./message-parser");
const MessageSender = require("./message-sender");
const ReadLine = require("readline");
const Config = require("./config.json");
const Datagram = require('dgram');
const OS = require("os");

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
socket.on("error", error => console.log(error));

socket.connect({ port: Config.gamePort, host: ip }, () =>
{
	console.log("Connected to server");
	
	MessageSender.json(socket, 0, { username });
});





function getBroadcastAddresses()
{
	return Object.values(OS.networkInterfaces())
	.flatMap(e => e)
	// Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
	// 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
	.filter(net => !net.internal && net.family === (typeof net.family === 'string' ? 'IPv4' : 4))
	.map(net =>
	{
		const address = net.address.split(".");
		const netmask = net.netmask.split(".");
		// bitwise OR over the splitted NAND netmask, then glue them back together with a dot character to form an ip
		// we have to do a NAND operation because of the 2-complements; getting rid of all the 'prepended' 1's with & 0xFF
		return address.map( (e, i) => ((~netmask[i] & 0xFF) | e) ).join(".");
	});
}




const broadcastMessage = Buffer.from('Server?');
const broadcastSocket = Datagram.createSocket('udp4');

broadcastSocket.on('listening', () => {
	broadcastSocket.setBroadcast(true);
	setInterval(() => {
		const port = Config.broadcastPort;
		const broadcastAddress = getBroadcastAddresses()[0];
		console.log("Sent to", Config.broadcastPort, "address:", broadcastAddress);
		broadcastSocket.send(
			broadcastMessage,
			0,
			broadcastMessage.length,
			port,
			getBroadcastAddresses()[0]
	)}, 5000);
});

broadcastSocket.on('message', (message, remote) => {
	console.log('CLIENT RECEIVED: ', remote.address + ' : ' + remote.port + ' - ' + message);
});

broadcastSocket.bind('457');