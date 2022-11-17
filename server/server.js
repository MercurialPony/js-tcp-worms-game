const FS = require("fs");
const Net = require('net');
const SendingUtil = require("./data_sending");
const HandlingUtil = require('./msg_handling');
const TerrainGenerator = require("./terrain-generator");



const server = Net.createServer(socket => {
	
	console.log(`Player "${socket.localAddress}" connected`);
	
	let randomType = Math.floor(Math.random() * 3) + 1;
	TerrainGenerator.generate(`./terrain_bases/base_${randomType}.png`, Math.random());
	SendingUtil.sendImage(socket, 0, FS.readFileSync("./out.png"));


    socket.on("data", clientData => {
        const messageID = clientData.subarray(0, 1)[0];
        const data = clientData.subarray(1, clientData.length);

        HandlingUtil.handleMessage(socket, messageID, data);
        console.log("Received message: ", messageID, data);
    });

    socket.on("close", () => {
        HandlingUtil.sockets = sockets.filter(player => player.localAddress !== socket.localAddress);
    });
});

const port = 457;
server.listen(port);