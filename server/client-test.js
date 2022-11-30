const Socket = require("net").Socket;
const MessageReader = require("./message-reader");
const MessageSender = require("./message-sender");
const ReadLine = require("readline");
const Config = require("./config.json");
const Datagram = require('dgram');
const OS = require("os");

const socket = new Socket();
const prompter = ReadLine.createInterface({ input: process.stdin, output: process.stdout });

const ip = process.argv[2] || "localhost";

function pickAndSend()
{
	prompter.question("Enter username or [ LONG, TRASH, SHOOT ] to send a message\n", ans =>
	{
		switch(ans)
		{
		case "LONG":
			MessageSender.data(socket, 1, Buffer.alloc(512));
			break;
		case "TRASH":
			const buf = Buffer.alloc(64);
			for(let i = 0; i < buf.length; ++i)
			{
				buf[i] = Math.floor(Math.random() * 256);
			}
			MessageSender.data(socket, 1, buf);
			break;
		case "SHOOT":
			MessageSender.json(socket, 1, { direction: { x: Math.random(), y: Math.random() }, power: Math.random() });
			break;
		default:
			MessageSender.json(socket, 0, { username: ans });
			break;
		}

		console.log("sent");

		pickAndSend();
	});
}


const reader = new MessageReader();
reader.on("message", (id, data) => console.log("msg", id, data.length > 512 ? "Data too long" : data.toString()));

socket.on("data", data => reader.pipe(data));
socket.on("error", error => console.log(error));
socket.on("close", () =>
{
	prompter.close();
	console.log("Socket closed");
	process.exit();
})

socket.connect({ port: Config.public.port, host: ip }, () =>
{
	console.log("Connected to server");
	pickAndSend();
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




const broadcastSocket = Datagram.createSocket('udp4');

const broadcastPort = 2914;
const broadcastAddress = getBroadcastAddresses()[0];
const broadcastMessage = Buffer.from('Server?');

function broadcast()
{
	console.log("Sent to", broadcastPort, "address:", broadcastAddress);
	broadcastSocket.send(broadcastMessage, 0, broadcastMessage.length, broadcastPort, broadcastAddress);
}

broadcastSocket.on("listening", () =>
{
	broadcastSocket.setBroadcast(true);
	broadcast();
	//setInterval(broadcast, 5000);
});

broadcastSocket.on("message", (message, remote) => console.log("Received from", remote.address + ":" + remote.port + ":", message.toString()));

broadcastSocket.bind("457");