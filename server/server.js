const Net = require("net");
const MessageHandler = require("./message-handler");
const GameManager = require("./game-manager");



const port = process.argv[2] || 1457;

const connectedUsers = {};

const server = Net.createServer(socket => {
	const ip = socket.remoteAddress.replace(/^.*:/, '');
	const user = { ip, socket };
	connectedUsers[ip] = user;
	console.log(`${ip} connected`);

	let id = 0;
	let contentLength = 0;
	let accumulatedContent = Buffer.alloc(0);
	socket.on("data", data => {
		console.log("Received data chunk: ", data.length); // TEST
		if (accumulatedContent.length === 0) {
			id = data.subarray(0, 1)[0];
			contentLength = data.subarray(1, 3).readInt16BE();
			accumulatedContent = Buffer.concat([accumulatedContent, data.subarray(3)]);
		} else if (accumulatedContent.length < contentLength) {
			accumulatedContent = Buffer.concat([accumulatedContent, data]);
		}
		if (accumulatedContent.length === contentLength) {
			socket.emit("message", id, accumulatedContent);
			accumulatedContent = Buffer.alloc(0);
		}
	});


	socket.on("message", (id, content) => {
		console.log(
			"Received message with id:", id,
			"\nLength:",content.length,
			"\nContent:", content.toString());
		MessageHandler.handle(user, id, content);
	});

	socket.on("close", () => {
		connectedUsers[ip] = undefined;
	});

	socket.on("error", error => {
		console.error("Error:", ip, error.code);
	});
});

server.listen(port, () => {
	console.log("Server is running on PORT", port)
});