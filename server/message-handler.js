const messageHandlers = [];

function handler(id, parser, msgHandler)
{
	messageHandlers[id] = (user, data) => msgHandler(user, parser(data));
}

function json(id, msgHandler)
{
	handler(id, data => JSON.parse(data.toString()), msgHandler);
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