const Socket = require("net").Socket;

const socket = new Socket();

const ip = process.argv[2] || "localhost";

function send(socket, type, data) {
	const id = Buffer.alloc(1);
	id[0] = type;

	const dataLength = Buffer.alloc(2);
	dataLength.writeInt16BE(data.length);

	const finalData = Buffer.concat([id, dataLength, data]);
	socket.write(finalData);
}

socket.connect({ port: 1457, host: ip }, () => {
	console.log("Connected to server");
	send(socket, 0, Buffer.from(JSON.stringify({ username: "hewwo" + Math.floor(Math.random() * 1000) })));
});

let id = 0;
let contentLength = 0;
let accumulatedContent = Buffer.alloc(0);
socket.on("data", data => {
	if (accumulatedContent.length === 0) {
		id = data.subarray(0, 1)[0];
		contentLength = data.subarray(1, 3).readInt16BE();
		accumulatedContent = Buffer.concat([accumulatedContent, data.subarray(3)]);
	} else if (accumulatedContent.length < contentLength) {
		accumulatedContent = Buffer.concat([accumulatedContent, data]);
	}
	if (accumulatedContent.length === contentLength) {
		socket.emit("message", id, accumulatedContent); //FIXME test zero buffer
		accumulatedContent = Buffer.alloc(0);
	}
});

socket.on("message", (id, content) => {
	console.log(
		"Received message with id:", id,
		"\nLength:",content.length,
		"\nContent:", content.toString(), "\n");
});
