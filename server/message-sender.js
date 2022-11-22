module.exports.data = (socket, id, data) =>
{
	const idBuffer = Buffer.alloc(1);
	idBuffer[0] = id;

	const dataLength = Buffer.alloc(2);
	dataLength.writeInt16BE(data.length);

	const finalData = Buffer.concat([idBuffer, dataLength, data]);
	socket.write(finalData);
}

module.exports.json = (socket, id, data) =>
{
	//TODO check valid message ID
	module.exports.data(socket, id, Buffer.from(JSON.stringify(data)));
}