const ipInput = document.getElementById("ip");
const portInput = document.getElementById("port");
const userInput = document.getElementById("username");

const form = document.getElementById("form");
form.addEventListener("submit", e => e.preventDefault());
form.addEventListener("submit", () =>
{
	parent.socket.connect({ host: ipInput.value, port: portInput.value }, () =>
	{
		parent.sendJson(0, { username: userInput.value });
		window.location.href = "await-room/await-room.html";
	});
});