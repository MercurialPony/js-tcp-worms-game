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

  // socket.on("data", async (msg) => {
  //   const messageID = msg.subarray(0, 1)[0];
  //   const data = msg.subarray(1, msg.length);
  //   console.log(messageID, data.toString());
  //   const newPng = new png();
  //   const image = await Util.promisify(newPng.parse).bind(newPng)(data);
  //   const imgData = png.sync.write(image);
  //   fs.writeFileSync("./public/textures/rand_1.png", imgData);
  // });

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
