const MessageHandler = require("./message-handler");

const players = [];

MessageHandler.json(0, (user, data) =>
{
	players.push({ user, username: data.username })
});