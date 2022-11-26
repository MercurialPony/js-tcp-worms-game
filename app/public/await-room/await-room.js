const userList = document.getElementById("user-list");

function addPlayer(name)
{
	const li = document.createElement("li");
	li.innerText = name;
	userList.appendChild(li);
}

function removePlayer(name)
{
	Array.from(userList.getElementsByTagName("li"))
	.filter(e => e.innerText === name)
	.forEach(e => userList.removeChild(e));
}

var handler = parent.provideHandler();

handler.json(0, data =>
{
	data.players.forEach(name => addPlayer(name));
});

handler.json(1, data =>
{
	const func = data.joined ? addPlayer : removePlayer;
	func(data.username);
});

handler.json(2, data =>
{
	timeLimit = timeLeft = data.timeToStart / 1000;
	timePassed = 0;
});