"use strict";
const { app, BrowserWindow, globalShortcut } = require("electron");
const IPC = require("electron").ipcMain;
const Socket = require("net").Socket;
const MessageParser = require("./message-parser");

const reboot = globalShortcut;

function send(socket, id, data)
{
	const idBuffer = Buffer.alloc(1);
	idBuffer[0] = id;
  
	const dataLength = Buffer.alloc(2);
	dataLength.writeInt16BE(data.length);
  
	const finalData = Buffer.concat([idBuffer, dataLength, data]);
	socket.write(finalData);
}

function sendJson(socket, id, obj)
{
	send(socket, id, Buffer.from(JSON.stringify(obj)));
}

function start()
{
	const mainWindow = new BrowserWindow({
		width: 1400,
		height: 800,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	mainWindow.loadFile("public/src/home/home.html");

	reboot.register("Control+4", () =>
	{
		console.log("Page is reloaded");
		mainWindow.reload();
	});



	/*-----------*/

	const socket = new Socket();

	const parser = new MessageParser();
	parser.on("message", (id, data) =>
	{
		console.log("msg", id);
		switch(id)
		{
		case 0:
			console.log("change page");
			mainWindow.loadFile("public/src/await-room/await-room.html");
			mainWindow.once("ready-to-show", () => mainWindow.webContents.send("message-0", JSON.parse(data.toString())));
			break;
		case 1:
			mainWindow.webContents.send("message-1", JSON.parse(data.toString()));
		}
	});

	socket.on("data", data => parser.pipe(data));



	/*-----------*/

	IPC.on("connect", (e, ip, port, name) =>
	{
		console.log("connect");
		socket.connect({ host: ip, port }, () =>
		{
			sendJson(socket, 0, { username: name });
		});
	});
}

app.whenReady().then(() =>
{
	start();

	app.on("activate", function ()
	{
		if (BrowserWindow.getAllWindows().length === 0)
		{
			start();
		}
	});
});
