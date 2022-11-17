const {PNG: png} = require("pngjs");

const sendData = (socket, type, data) => {
    const typeOfData = Buffer.alloc(1);
    typeOfData[0] = type;
    const finalData = Buffer.concat([typeOfData, data]);

    socket.write(finalData);
}

const sendString = (socket, messageID, stringData) => {
    //TODO check valid messageID
    sendData(socket, messageID, Buffer.from(stringData));
}

const sendImage = (socket, messageID, image) => {
    //TODO check valid messageID
    sendData(socket, messageID, image)
}

const DataSending = {
    sendData,
    sendString,
    sendImage
}

module.exports = DataSending;