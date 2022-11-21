const Socket = require("net").Socket;

const socket = new Socket();

const ip = process.argv[2] || "localhost";

socket.connect({ port: 1457, host: ip }, () =>
{
	console.log("Connected to server");
	
	send(socket, 0, Buffer.from(JSON.stringify({ username: "hewwo" })));
});

function send(socket, type, data)
{
	const typeOfData = Buffer.alloc(1);
	typeOfData[0] = type;
	const finalData = Buffer.concat([typeOfData, data]);
	socket.write(finalData);
}