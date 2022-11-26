const IPC = require("electron").ipcRenderer;

const userList = document.getElementById("user-list");

function addPlayer(name)
{
	const li = document.createElement("li");
	li.innerText = name;
	userList.appendChild(li);
}

function removePlayer(name)
{
	userList.getElementsByTagName("li").filter(el => el.innerText === name).forEach(el => userList.removeChild(el));
}

IPC.on("message-0", (e, data) =>
{
	data.players.forEach(name => addPlayer(name));
});

IPC.on("message-1", (e, data) =>
{
	console.log(data);

	if(data.joined)
	{
		addPlayer(data.username);
	}
	else
	{
		removePlayer(data.username);
	}
});

// const btn_back = document.getElementById("btn_back");
// if (btn_back) {
//   btn_back.addEventListener("submit", removePlayer(connData.userInput.value));
// }
