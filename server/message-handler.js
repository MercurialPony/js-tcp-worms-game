const messageHandlers = [];

module.exports.handler = (id, parser, handler) =>
{
	messageHandlers[id] = (user, data) => handler(user, parser(data));
}

module.exports.json = (id, handler) =>
{
	module.exports.handler(id, data => JSON.parse(data.toString()), handler);
}

module.exports.handle = (user, id, data) =>
{
	//TODO valid message ID
	messageHandlers[id](user, data);
}