const Socket = require("net").Socket;
const Datagram = require("dgram");
const MessageParser = require("./message-parser");
const MessageHandler = require("./message-handler");
const BroadcastAddresses = require("./broadcast-addresses");
const PNG = require("pngjs").PNG;



/*------ Frame handling ------*/

function getFrame()
{
	return document.getElementById("mainFrame").contentWindow;
}

function frameChanged(url)
{
	const s = url.toString();
	if(s.endsWith("home.html") || s.endsWith("connection.html"))
	{
		disconnect();
	}
}



/*------ TCP message handling ------*/

var mainImg;

var messageCache = {};

function provideHandler()
{
	return new MessageHandler(messageCache);
}

const parser = new MessageParser();
parser.on("message", (id, data) =>
{
	console.log("msg", id, data.length > 512 ? "Data too long" : data.toString());

	const frame = getFrame();

	// special case FIXME: bad
	if(id === 4)
	{
		mainImg = PNG.sync.read(data);
		frame.location.href = "battle/battle.html";
	}

	const handler = frame.handler;

	console.log(handler);

	if(!handler || !handler.handle(id, data))
	{
		if(!messageCache[id])
		{
			messageCache[id] = [];
		}

		messageCache[id].push(data);
	}
});



/*------ TCP connection ------*/

var socket;

function connect(host, port, username)
{
	if(!socket)
	{
		socket = new Socket();
		socket.on("data", parser.pipe.bind(parser));
	}
	
	socket.connect({ host, port }, () => sendJson(0, { username }));
}

function disconnect()
{
	if(socket)
	{
		socket.destroy();
	}
}



/*------ Broadcast connection ------*/

var broadcastMessage = Buffer.from('Server?');
var broadcastSocket = Datagram.createSocket('udp4');

broadcastSocket.on("listening", () => broadcastSocket.setBroadcast(true));

broadcastSocket.on("message", (message, remote) =>
{
	const handler = getFrame().broadcastResponse;

	if(handler)
	{
		handler(message, remote);
	}
});

broadcastSocket.bind(457);

function broadcastJson()
{
	broadcastSocket.send(broadcastMessage, 0, broadcastMessage.length, 2914, BroadcastAddresses.get()[0]); // TODO: port
}



/*------ TCP message sending ------*/

function send(id, data)
{
	if(!socket)
	{
		return;
	}

	const idBuffer = Buffer.alloc(1);
	idBuffer[0] = id;

	const dataLength = Buffer.alloc(2);
	dataLength.writeInt16BE(data.length);

	const finalData = Buffer.concat([idBuffer, dataLength, data]);
	socket.write(finalData);
}

function sendJson(id, obj)
{
	send(id, Buffer.from(JSON.stringify(obj)));
}