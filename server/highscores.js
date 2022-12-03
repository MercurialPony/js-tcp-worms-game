const FS = require("fs");
const PlayerData = require("./player_data.json");



function getInfo(player)
{
	let playerInfo = PlayerData[player.username];

	if(!playerInfo)
	{
		playerInfo = PlayerData[player.username] = { kills: 0, deaths: 0 };
	}

	return playerInfo;
}

function save()
{
	FS.writeFileSync("./player-data.json", JSON.stringify(PlayerData));
}



module.exports = {
	getInfo,
	save
};