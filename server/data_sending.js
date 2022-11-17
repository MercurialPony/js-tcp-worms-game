const {PNG: png} = require("pngjs");

const SendData = (socket, type, data) => {
    const typeOfData = Buffer.alloc(1);
    typeOfData[0] = type;
    const finalData = Buffer.concat([typeOfData, data]);

    socket.write(finalData);
}

const SendString = (socket, messageID, stringData) => {
    //TODO check valid messageID
    SendData(socket, messageID, Buffer.from(stringData));
}

const SendImage = (socket, messageID, image) => {
    //TODO check valid messageID
    SendData(socket, messageID, image)
}

const DataSending = {
    SendData,
    SendString,
    SendImage
}

module.exports = DataSending;