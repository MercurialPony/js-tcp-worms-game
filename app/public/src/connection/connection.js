const { net, Socket } = require("net");
const { PNG: png } = require("pngjs");
const Util = require("util");
const fs = require("fs");

const socket = new Socket();

const ipInput = document.getElementById("ip");
const portInput = document.getElementById("port");
const userInput = document.getElementById("username");
var players = [];
let id = 0;
let contentLength = 0;
let accumulatedContent = Buffer.alloc(0);
const form = document.getElementById("form");

function saveData(data) {
  let arr = [];

  arr = sessionStorage.getItem("playerArr");

  if (!arr) {
    sessionStorage.setItem("playerArr", JSON.stringify([userInput.value]));
  } else {
    arr = JSON.parse(arr);
    arr.push(data);
    sessionStorage.setItem("playerArr", JSON.stringify(arr));
  }
}

function send(socket, type, data) {
  const id = Buffer.alloc(1);
  id[0] = type;

  const dataLength = Buffer.alloc(2);
  dataLength.writeInt16BE(data.length);

  const finalData = Buffer.concat([id, dataLength, data]);
  socket.write(finalData);
}

function getInputsValues(event) {
  form.addEventListener("submit", () => {
    event.preventDefault();
  });

  socket.connect({ port: portInput.value, host: ipInput.value }, () => {
    console.log("Connected to server");
    send(
      socket,
      0,
      Buffer.from(
        JSON.stringify({
          username: userInput.value + Math.floor(Math.random() * 1000),
        })
      )
    );

    // saveData(userInput.value);

    window.location.href = "../await-room/await-room.html";
  });

  socket.on("data", (data) => {
    if (accumulatedContent.length === 0) {
      id = data.subarray(0, 1)[0];
      contentLength = data.subarray(1, 3).readInt16BE();
      accumulatedContent = Buffer.concat([
        accumulatedContent,
        data.subarray(3),
      ]);
    } else if (accumulatedContent.length < contentLength) {
      accumulatedContent = Buffer.concat([accumulatedContent, data]);
    }
    if (accumulatedContent.length === contentLength) {
      socket.emit("message", 0, accumulatedContent); //FIXME test zero buffer
      accumulatedContent = Buffer.alloc(0);
    }
  });

  socket.on("message", (id, content) => {
    console.log(
      "Received message with id:",
      id,
      "\nLength:",
      content.length,
      "\nContent:",
      content.toString(),
      "\n"
    );

    if (id === 0 || 1) {
      sessionStorage.setItem("playerArr", content.toString());
    }

    if (id === 2) {
      sessionStorage.setItem("timerCount", content.toString());
    }

    if (id === 3) {
      sessionStorage.setItem("picture", content.toString());
    }
  });
}

if (form) {
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
