let Sockets = [];
const MessageHandlers = [];

MessageHandlers[0] = (data, socket) => {
    const parsedData = JSON.parse(data.toString());
    Sockets.push({
        socket: socket,
        username: parsedData.username
    });
}
MessageHandlers[1] = data => {
    //
}

const HandleMessage = (socket, messageID, data) => {
    //TODO valid messageID
    MessageHandlers[messageID](data, socket);
}

const MsgHandling = {
    Sockets,
    MessageHandlers,
    HandleMessage
}

module.exports = MsgHandling;