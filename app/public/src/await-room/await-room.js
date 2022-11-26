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
	const elements = userList.getElementsByTagName("li");

	for(let i = elements.length - 1; i >= 0; ++i)
	{
		const element = elements[i];
		if(element.innerText === name)
		{
			userList.removeChild(element);
		}
	}
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

IPC.on("message-2", (e, data) =>
{
	console.log(data);
	timeLimit = timeLeft = data.timeToStart / 1000;
	timePassed = 0;
	console.log(timeLeft, timeLimit);
});

// const btn_back = document.getElementById("btn_back");
// if (btn_back) {
//   btn_back.addEventListener("submit", removePlayer(connData.userInput.value));
// }
