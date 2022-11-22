const PNG = require("pngjs").PNG;
const ZLib = require("zlib");



function data(socket, id, data)
{
	const idBuffer = Buffer.alloc(1);
	idBuffer[0] = id;

	const dataLength = Buffer.alloc(2);
	dataLength.writeInt16BE(data.length);

	const finalData = Buffer.concat([idBuffer, dataLength, data]);
	socket.write(finalData);
}

function json(socket, id, obj)
{
	//TODO check valid message ID
	data(socket, id, Buffer.from(JSON.stringify(obj)));
}

function png(socket, id, img)
{
	data(socket, id, ZLib.gzipSync(PNG.sync.write(img)));
}

module.exports = {
	data,
	json,
	png
};