const Socket = require("net").Socket;
const MessageParser = require("./message-parser");
const MessageSender = require("./message-sender");
const ReadLine = require("readline");

const socket = new Socket();
const prompter = ReadLine.createInterface({ input: process.stdin, output: process.stdout });

const ip = process.argv[2] || "localhost";
const username = process.argv[3] || "hewwo" + Math.floor(Math.random() * 1000);

const parser = new MessageParser();
parser.on("message", (id, data) =>
{
	console.log("msg", id, data.length > 512 ? "Data too long" : data.toString());

	if(id === 5)
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