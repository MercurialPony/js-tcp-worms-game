const ipInput = document.getElementById("ip");
const portInput = document.getElementById("port");
const userInput = document.getElementById("username");

const dialog = document.getElementById("dialog-id");
const openButton = document.getElementById("choose-ip");

const serverTable = document.getElementById("server-table");

function getIpPort() {}

/*------------*/

function startInterval(time, action) {
  action();
  return setInterval(action, time);
}

/*------------*/

function clearServers() {
  Array.from(serverTable.getElementsByTagName("li"))
    .slice(1)
    .forEach((e) => serverTable.removeChild(e));
}

function createRowElement(idx, text) {
  const element = document.createElement("div");
  element.className = "col col-" + idx;
  element.innerText = text;
  return element;
}

function addServer(serverInfo) {
  const li = document.createElement("li");
  li.className = "table-row";
  li.appendChild(createRowElement(1, 1));
  li.appendChild(createRowElement(2, serverInfo.title));
  li.appendChild(createRowElement(3, serverInfo.players));
  serverTable.appendChild(li);
}

/*------------*/

const broadcastTime = 10 * 1000;
let broadcastInterval = null;
let lastBroadcastTime;

function broadcast() {
  // clearServers();
  parent.broadcastJson();
  lastBroadcastTime = Date.now();
}

function broadcastResponse(message, remote) {
  const serverInfo = JSON.parse(message.toString());

  // TODO: change (temporary)
  serverInfo.players = Date.now() - lastBroadcastTime + " (ping)";
  serverInfo.title += " - " + serverInfo.description;

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

/*------------*/

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

  alert(`Name "${userInput.value}" is already occupied on this server`);
});
