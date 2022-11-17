"use strict";
const { net, Socket } = require("net");
const { app, BrowserWindow, globalShortcut } = require("electron");
const { PNG: png } = require("pngjs");
const Util = require("util");
const fs = require("fs");

const reboot = globalShortcut;
const socket = new Socket();

function start() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // socket.connect({ port: 457, host: "10.102.9.246" });

  // const buff = Buffer.alloc(1);
  // buff[0] = 0;
  // const buff2 = Buffer.concat([
  //   buff,
  //   Buffer.from(JSON.stringify({ username: "Bruh" }), "utf-8"),
  // ]);

  // console.log(buff2);
  // socket.write(buff2);

  // socket.on("data", async (msg) => {
  //   const messageID = msg.subarray(0, 1)[0];
  //   const data = msg.subarray(1, msg.length);
  //   console.log(messageID, data.toString());
  //   const newPng = new png();
  //   const image = await Util.promisify(newPng.parse).bind(newPng)(data);
  //   const imgData = png.sync.write(image);
  //   fs.writeFileSync("./public/textures/rand_1.png", imgData);
  // });

  // socket.connect({ host: "10.102.9.246", port: 457 }, () => {
  //   console.log("Hello Artur");
  // });

  //   client.on("data", (data) => {
  //     console.log(data.toString().toUpperCase());
  //     client.end();
  //   });

  mainWindow.loadFile("public/src/home/home.html");

  reboot.register("Control+4", () => {
    console.log("Page is reloaded");
    mainWindow.reload();
  });

  //   mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  start();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      start();
    }
  });
});
