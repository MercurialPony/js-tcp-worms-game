const mouse = {
	leftDown: false,
	pos: new Vec2(0, 0)
};

window.onmousedown = () => mouse.leftDown = true;

window.onmouseup = () => mouse.leftDown = false;

window.onmousemove = e =>
{
	mouse.pos.set(e.pageX, e.pageY);

	if (mouse.leftDown)
	{
		sceneRenderer.changeDrag(e.movementX, e.movementY);
	}
};

window.onkeydown = e =>
{
	if(e.repeat)
	{
		return;
	}

	if(e.keyCode === 32)
	{
		localPlayer.startCharging();
	}
	else if (e.keyCode === 192)
	{
		document.querySelector(".dialog-high-score").show();
	}
};

window.onkeyup = e =>
{
	if(e.keyCode === 32)
	{
		localPlayer.stopCharging();
	}
	else if(e.keyCode === 192)
	{
		document.querySelector(".dialog-high-score").hide();
	}
};