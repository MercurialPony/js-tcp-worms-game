const net = require('net');
let {Sockets: sockets} = require('./msg_handling');
const {
    SendData: sendData,
    SendString: sendString,
    SendImage: sendImage
} = require("./data_sending");
const {
    MessageHandlers: messageHandlers,
    HandleMessage: handleMessage
} = require('./msg_handling');


const server = net.createServer(socket => {
    console.log(`Player "${socket.localAddress}" connected`);

    socket.on("data",clientData => {
        const messageID = clientData.subarray(0, 1)[0];
        const data = clientData.subarray(1, clientData.length);

        handleMessage(socket, messageID, data);
        console.log(messageID, data);

        sendData(socket, 0, data);
    });

    socket.on("close", () => {
        sockets = sockets.filter(player => player.localAddress !== socket.localAddress);
    });
});

const port = 457;
server.listen(port);