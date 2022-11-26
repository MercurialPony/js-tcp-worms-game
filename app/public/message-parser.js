const EventEmitter = require("events");

module.exports = class MessageParser extends EventEmitter
{
	constructor()
	{
		super();
		this.reset();
	}

	reset()
	{
		this._id = 0;
		this._contentLength = 0;
		this._accumulatedContent = Buffer.alloc(0);
	}

	pipe(dataChunk)
	{
		let subChunk = dataChunk;
		if (this._accumulatedContent.length === 0)
		{
			this._id = dataChunk.subarray(0, 1)[0];
			this._contentLength = dataChunk.subarray(1, 3).readInt16BE();
			subChunk = dataChunk.subarray(3);
		}
		// else if (this._accumulatedContent.length < this._contentLength)

		this._accumulatedContent = Buffer.concat([this._accumulatedContent, subChunk]);

		if (this._accumulatedContent.length >= this._contentLength)
		{
			this.emit("message", this._id, this._accumulatedContent);
			this.reset();
		}
	}
}