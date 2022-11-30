const ipInput = document.getElementById("ip");
const portInput = document.getElementById("port");
const userInput = document.getElementById("username");

const dialog = document.getElementById("dialog-id");
const openButton = document.getElementById("choose-ip");
const serverTable = document.getElementById("server-table");

/*------ Misc ------*/

function startInterval(time, action) {
  action();
  return setInterval(action, time);
}

/*------ Table ------*/

function fillServer(ip, port) {
  ipInput.setAttribute("value", ip);
  portInput.setAttribute("value", port);
  dialog.hide();
}

function clearServers() {
  Array.from(serverTable.getElementsByTagName("li"))
    .slice(2)
    .forEach((e) => serverTable.removeChild(e));
}

function addServer(serverInfo)
{
	const addElement = (parent, type, text) =>
	{
		const element = document.createElement(type);
		element.innerText = text;
		parent.appendChild(element);
		return element;
	}

	let idx = 0;

	const addColumn = (text) =>
	{
		const element = addElement(row, "div", text);
		element.className = "col col-" + ++idx;
		return element;
	}

	const row = addElement(serverTable, "li", "");
	row.className = "server-list";
	row.onclick = () => fillServer(serverInfo.ip, serverInfo.port);
	
	const textElement = addColumn("");
	addElement(textElement, "h3", serverInfo.title);
	addElement(textElement, "h5", serverInfo.description);
	addColumn(serverInfo.players);
	addColumn(serverInfo.ping);
}

/*------ Broadcast ------*/

const broadcastTime = 10 * 1000;
let broadcastInterval = null;
let lastBroadcastTime;

function broadcast() {
  clearServers();
  parent.broadcastJson();
  lastBroadcastTime = Date.now();
}

function broadcastResponse(message, remote) {
  const serverInfo = JSON.parse(message.toString());

  serverInfo.ping = Date.now() - lastBroadcastTime;
  serverInfo.ip = remote.address;

  addServer(serverInfo);
}

openButton.addEventListener("click", () => {
  broadcastInterval = startInterval(broadcastTime, broadcast);

  dialog.show();
});

dialog.addEventListener("sl-request-close", (e) => {
  broadcastInterval = clearInterval(broadcastInterval);

  if (e.detail.source === "overlay") {
    e.preventDefault();
  }
});

/*------ Connection ------*/

if (sessionStorage.getItem("username")) {
  userInput.setAttribute("value", sessionStorage.getItem("username"));
}

const form = document.getElementById("form");
form.addEventListener("submit", (e) => e.preventDefault());
form.addEventListener("submit", () => {
  parent.connect(ipInput.value, portInput.value, userInput.value);

  sessionStorage.setItem("username", userInput.value);
});

var handler = parent.provideHandler();

handler.json(0, (data) => {
  if (data.accepted) {
    window.location.href = "await-room/await-room.html";
    return;
  }

  alert(`Name "${userInput.value}" is invalid or already occupied on this server`);
});
