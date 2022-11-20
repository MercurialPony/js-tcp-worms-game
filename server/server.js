const Net = require("net");
const MessageSender = require("./message-sender");
const MessageHandler = require("./message-handler");
const TerrainGenerator = require("./terrain-generator");
const GameManager = require("./game-manager");



function sendTestTerrain(socket)
{
	let randomType = Math.floor(Math.random() * 3) + 1;
	MessageSender.data(
		socket,
		0,
		TerrainGenerator.generate(`./terrain_bases/base_${randomType}.png`, Math.random())
	);
}

const port = process.argv[2] || 1457;

const connectedUsers = {};

const server = Net.createServer((socket) =>
{
	const ip = socket.remoteAddress;
	const user = { ip, socket };
	connectedUsers[ip] = user;
	console.log(`"${ip}" connected`);

	sendTestTerrain(socket); // TEST

	socket.on("data", (data) =>
	{
		const id = data.subarray(0, 1)[0];
		//const contentLength = clientData.subarray(1, 5)[0];
		const content = data.subarray(1, data.length);
		MessageHandler.handle(user, id, content); // FIXME
		console.log("Received message with id ", id);
	});

	socket.on("close", () =>
	{
		connectedUsers[ip] = undefined;
	});

	socket.on("error", error =>
	{
		console.error("Error:", ip, error.code);
	});
});

server.listen(port, () => console.log("Server is running on PORT", port));