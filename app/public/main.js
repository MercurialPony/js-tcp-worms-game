const Socket = require("net").Socket;
const MessageParser = require("./message-parser");
const MessageHandler = require("./message-handler");
const PNG = require("pngjs").PNG;



/*------------*/

function getFrame()
{
	return document.getElementById("mainFrame").contentWindow;
}

function frameChanged(url)
{
	const s = url.toString();
	if(s.endsWith("home.html") || s.endsWith("connection.html"))
	{
		socket.destroy();
	}
}



/*------------*/

var messageCache = {};

function provideHandler()
{
	return new MessageHandler(messageCache);
}



/*------------*/

var mainImg;

const parser = new MessageParser();
parser.on("message", (id, data) =>
{
	const frame = getFrame();

	// special case FIXME: bad
	if(id === 3)
	{
		console.log("got img", data.length);
		mainImg = PNG.sync.read(data);
		frame.location.href = "battle/battle.html";
	}

	const handler = frame.handler;

	if(!handler || !handler.handle(id, data))
	{
		if(!messageCache[id])
		{
			messageCache[id] = [];
		}

		messageCache[id].push(data);
	}
});



/*------------*/

var socket = new Socket();
socket.on("data", dataChunk => parser.pipe(dataChunk));



/*------------*/

function send(id, data)
{
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