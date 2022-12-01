const mouse = {
	leftDown: false,
	pos: new Vec2(0, 0)
};

window.onmousedown = () => mouse.leftDown = true;

window.onmouseup = () => mouse.leftDown = false;

window.onmousemove = (e) =>
{
	mouse.pos.set(e.pageX, e.pageY);

	if (mouse.leftDown)
	{
		sceneRenderer.changeDrag(e.movementX, e.movementY);
	}
};