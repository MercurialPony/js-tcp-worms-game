let sockets = [];
const messageHandlers = [];

messageHandlers[0] = (data, socket) => {
    const parsedData = JSON.parse(data.toString());
    sockets.push({
        socket: socket,
        username: parsedData.username
    });
	console.log(data.toString());
}
messageHandlers[1] = data => {
    //
}

const handleMessage = (socket, messageID, data) => {
    //TODO valid messageID
    messageHandlers[messageID](data, socket);
}

const MsgHandling = {
    sockets,
    handleMessage
}

module.exports = MsgHandling;