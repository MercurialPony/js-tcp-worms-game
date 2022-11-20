module.exports.data = (socket, id, data) =>
{
	const typeOfData = Buffer.alloc(1);
	typeOfData[0] = id;
	const finalData = Buffer.concat([typeOfData, data]);

	socket.write(finalData);
}

module.exports.json = (socket, id, data) =>
{
	//TODO check valid message ID
	sendData(socket, id, Buffer.from(JSON.stringify(data)));
}