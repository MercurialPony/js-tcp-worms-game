"use strict";

const { app, BrowserWindow, globalShortcut } = require("electron");




const reboot = globalShortcut;

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

	mainWindow.loadFile("public/index.html");

	reboot.register("Control+4", () =>
	{
		console.log("Page is reloaded");
		mainWindow.reload();
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
