const EventEmitter = require("events");

module.exports = class MessageReader extends EventEmitter
{
	constructor()
	{
		super();

		this._accumulatedData = Buffer.alloc(0);
	}

	_read()
	{
		const totalLength = this._accumulatedData.length;

		if(totalLength < 3)
		{
			return;
		}

		const id = this._accumulatedData[0];
		const length = this._accumulatedData.subarray(1, 3).readInt16BE();

		if(totalLength - 3 >= length)
		{
			this.emit("message", id, this._accumulatedData.subarray(3, 3 + length));
			this._accumulatedData = this._accumulatedData.subarray(3 + length);
			this._read();
		}
	}

	pipe(dataChunk)
	{
		this._accumulatedData = Buffer.concat([ this._accumulatedData, dataChunk ]);
		this._read();
	}
}