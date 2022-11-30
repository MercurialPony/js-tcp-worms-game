const ipInput = document.getElementById("ip");
const portInput = document.getElementById("port");
const userInput = document.getElementById("username");

const dialog = document.getElementById("dialog-id");
const openButton = document.getElementById("choose-ip");
// const closeButton = dialog;
const serverTable = document.getElementById("server-table");

/*------ Misc ------*/

function startInterval(time, action) {
  action();
  return setInterval(action, time);
}

/*------ Table ------*/

function selectServer(ip, port) {
  ipInput.setAttribute("value", ip);
  portInput.setAttribute("value", port);
  dialog.hide();
}

function clearServers() {
  Array.from(serverTable.getElementsByTagName("li"))
    .slice(2)
    .forEach((e) => serverTable.removeChild(e));
}

function addServer(serverInfo) {
  const li = document.createElement("li").classList.add("server-list");
  li.className = "server-list";
  li.onclick = () => selectServer(serverInfo.ip, serverInfo.port);
  serverTable.appendChild(li);

  const textDiv = document.createElement("div");
  textDiv.className = "col col-1";
  textDiv.style.cssText = "margin: auto; text-align: left"; // TODO: Bad
  li.appendChild(textDiv);

  const titleElement = document.createElement("h3");
  titleElement.innerText = serverInfo.title;
  titleElement.style.cssText = "style='margin: auto'"; // TODO: Bad
  textDiv.appendChild(titleElement);

  const descElemenet = document.createElement("h5");
  descElemenet.innerText = serverInfo.description;
  descElemenet.style.cssText =
    "margin: auto; font-size: 14px; color: rgb(57, 57, 57);"; // TODO: Bad
  textDiv.appendChild(descElemenet);

  const playersDiv = document.createElement("div");
  playersDiv.className = "col col-2";
  playersDiv.innerText = serverInfo.players;
  li.appendChild(playersDiv);

  const pingDiv = document.createElement("div");
  pingDiv.className = "col col-3";
  pingDiv.innerText = serverInfo.ping;
  li.appendChild(pingDiv);
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

  alert(`Name "${userInput.value}" is already occupied on this server`);
});
