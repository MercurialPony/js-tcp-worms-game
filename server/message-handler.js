const messageHandlers = [];

function handler(id, parser, handler)
{
	messageHandlers[id] = (user, data) => handler(user, parser(data));
}

function json(id, handler)
{
	handler(id, data => JSON.parse(data.toString()), handler);
}

function handle(user, id, data)
{
	//TODO valid message ID
	messageHandlers[id](user, data);
}

module.exports = {
	handler,
	json,
	handle
};