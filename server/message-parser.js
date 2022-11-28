const EventEmitter = require("events");

module.exports = class MessageParser extends EventEmitter
{
	constructor()
	{
		super();

		this._accumulatedData = Buffer.alloc(0);
	}

	_parse()
	{
		if(this._accumulatedData.length < 3)
		{
			return;
		}

		const id = this._accumulatedData[0];
		const length = this._accumulatedData.subarray(1, 3).readInt16BE();

		if(this._accumulatedData.length + 3 >= length)
		{
			this.emit("message", id, this._accumulatedData.subarray(3, 3 + length));
			this._accumulatedData = this._accumulatedData.subarray(3 + length);
			this._parse();
		}
	}

	pipe(dataChunk)
	{
		this._accumulatedData = Buffer.concat([ this._accumulatedData, dataChunk ]);
		this._parse();
	}
}