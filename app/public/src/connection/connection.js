const PNG = require("pngjs").PNG;
const Util = require("util");
const FS = require("fs");
const IPC = require("electron").ipcRenderer;

const ipInput = document.getElementById("ip");
const portInput = document.getElementById("port");
const userInput = document.getElementById("username");

const form = document.getElementById("form");
form.addEventListener("submit", event => event.preventDefault());

function getInputsValues(event)
{
	IPC.send("connect", ipInput.value, portInput.value, userInput.value);

	//IPC.on("connect-success", (e) => );
	//window.location.href = "../await-room/await-room.html"
}

if (form)
{
	form.addEventListener("submit", getInputsValues);
}
// form.addEventListener("submit", loadAnima);

// const playBtn = document.querySelector(".play-btn");
// playBtn.onclick = () => {
//   this.innerHTML =
//     '<sl-spinner style="font-size: 3rem; --indicator-color: deeppink; --track-color: pink;"></sl-spinner>';
// };

// socket.on("data", async (msg) => {
//   const data = msg.subarray(1, msg.length);
//   const newPng = new png();
//   console.log("bruh");

//   const image = await Util.promisify(newPng.parse).bind(newPng)(data);
//   const imgData = png.sync.write(image);

//   Promise.resolve(fs.writeFileSync("./main_img.png", imgData)).then(() => {
//     window.location.href = "../../index.html";
//   });
// });
