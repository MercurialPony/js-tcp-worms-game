const FS = require("fs");



let playerData;



function getInfo(username)
{
	playerData = JSON.parse(FS.readFileSync("./player-data.json", { encoding: "utf-8" }));
	let playerInfo = playerData[username];

	if(!playerInfo)
	{
		playerInfo = playerData[username] = { kills: 0, deaths: 0 };
	}

	return playerInfo;
}

function save()
{
	FS.writeFileSync("./player-data.json", JSON.stringify(playerData));
}



module.exports = {
	getInfo,
	save
};