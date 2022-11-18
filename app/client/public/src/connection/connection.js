const { net, Socket } = require("net");
const { PNG: png } = require("pngjs");
const Util = require("util");
const fs = require("fs");

const socket = new Socket();

const ipInput = document.getElementById("ip");
const userInput = document.getElementById("username");

function loadAnima(event) {
  event.preventDefault();

  const playBtn = document.querySelector(".play-btn");
  playBtn.onclick = () => {
    this.innerHTML =
      '<sl-spinner style="font-size: 3rem; --indicator-color: deeppink; --track-color: pink;"></sl-spinner>';
  };
}

function strToBuff(data) {
  const buff = Buffer.alloc(1);
  buff[0] = 0;
  const resBuff = Buffer.concat([
    buff,
    Buffer.from(JSON.stringify({ username: data }), "utf-8"),
  ]);

  return socket.write(resBuff);
}

function getInputsValues(event) {
  event.preventDefault();

  socket.connect({ port: 1457, host: ipInput.value }, () => {
    console.log("Connected to server");
  });

  const userBuff = strToBuff(userInput.value);

  console.log("IP - ", ipInput.value);
  console.log("Username - ", userInput.value);
  console.log({ username: userBuff });

  socket.on("data", async (msg) => {
    const data = msg.subarray(1, msg.length);
    const newPng = new png();
    const image = await Util.promisify(newPng.parse).bind(newPng)(data);
    const imgData = png.sync.write(image);

    Promise.resolve(fs.writeFileSync("./main_img.png", imgData)).then(() => {
      window.location.href = "../../index.html";
    });
  });
}

form.addEventListener("submit", loadAnima);
form.addEventListener("submit", getInputsValues);
