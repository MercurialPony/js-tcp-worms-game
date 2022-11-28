const ipInput = document.getElementById("ip");
const portInput = document.getElementById("port");
const userInput = document.getElementById("username");

const form = document.getElementById("form");
form.addEventListener("submit", e => e.preventDefault());
form.addEventListener("submit", () => parent.connect(ipInput.value, portInput.value, userInput.value));

var handler = parent.provideHandler();

handler.json(0, data =>
{
	if(data.accepted)
	{
		window.location.href = "await-room/await-room.html";
		return;
	}

	// highlight error
});