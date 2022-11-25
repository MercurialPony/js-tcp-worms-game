const Socket = require("net").Socket;
const MessageParser = require("./message-parser");
const MessageSender = require("./message-sender");
const FS = require("fs");
const ZLib = require("zlib");

const socket = new Socket();

const ip = process.argv[2] || "localhost";
const username = process.argv[3] || "hewwo" + Math.floor(Math.random() * 1000);

const parser = new MessageParser();
parser.on("message", (id, data) =>
{
	console.log("msg", id, data.toString());

	if(id === 3 && username !== "nowrite")
	{
		FS.writeFileSync("./test.png", ZLib.gunzipSync(data));
	}
});

socket.on("data", data => parser.pipe(data));

socket.connect({ port: 1457, host: ip }, () =>
{
	console.log("Connected to server");
	
	MessageSender.json(socket, 0, { username });
});