const PNG = require("pngjs").PNG;
const ZLib = require("zlib");



function data(sockets, id, data)
{
	if(sockets.constructor !== Array)
	{
		sockets = [ sockets ];
	}

	for(let socket of sockets)
	{
		const idBuffer = Buffer.alloc(1);
		idBuffer[0] = id;

		const dataLength = Buffer.alloc(2);
		dataLength.writeInt16BE(data.length);

		const finalData = Buffer.concat([idBuffer, dataLength, data]);
		socket.write(finalData);
	}
}

function json(sockets, id, obj)
{
	//TODO check valid message ID
	data(sockets, id, Buffer.from(JSON.stringify(obj)));
}

function png(sockets, id, img)
{
	data(sockets, id, ZLib.gzipSync(PNG.sync.write(img)));
}

module.exports = {
	data,
	json,
	png
};