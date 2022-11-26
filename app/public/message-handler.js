module.exports = class MessageHandler
{
	constructor(cache)
	{
		this.cache = cache;

		this.handlers = {};
	}

	add(id, parser, handler)
	{
		const newHandler = data => handler(parser(data));
		this.handlers[id] = newHandler;

		const cachedById = this.cache[id];

		if(!cachedById)
		{
			return;
		}

		for(let cachedData of cachedById)
		{
			newHandler(cachedData);
		}

		cachedById.length = 0;
	}

	none(id, handler)
	{
		this.add(id, data => data, handler);
	}

	json(id, handler)
	{
		this.add(id, data => JSON.parse(data.toString()), handler);
	}

	handle(id, data)
	{
		const handler = this.handlers[id];
		
		if(!handler)
		{
			return false;
		}

		handler(data);

		return true;
	}
}