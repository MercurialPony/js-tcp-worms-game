const PNG = require("pngjs").PNG;
const ZLib = require("zlib");



function data(sockets, id, data)
{
	if(typeof sockets[Symbol.iterator] !== "function") // sockets is not an iterable
	{
		sockets = [ sockets ];
	}

	const idBuffer = Buffer.alloc(1);
	idBuffer[0] = id;

	const dataLength = Buffer.alloc(2);
	dataLength.writeInt16BE(data.length);

	const finalData = Buffer.concat([idBuffer, dataLength, data]);

	for(let socket of sockets)
	{
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
	let d = PNG.sync.write(img);
	console.log("sent img", d.length);
	data(sockets, id, d); //ZLib.gzipSync());
}

module.exports = {
	data,
	json,
	png
};