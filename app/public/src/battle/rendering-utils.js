class Vec2
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}

	copy()
	{
		return new Vec2(this.x, this.y);
	}

	set(x, y)
	{
		this.x = x;
		this.y = y;
		return this;
	}

	add(x, y)
	{
		return this.set(this.x + x, this.y + y);
	}

	addVec(v)
	{
		return this.add(v.x, v.y);
	}

	scale2(scaleX, scaleY)
	{
		return this.set(this.x * scaleX, this.y * scaleY);
	}

	scale1(scale)
	{
		return this.scale2(scale, scale);
	}

	scaleVec(scale)
	{
		return this.scale2(scale.x, scale.y);
	}

	clamp2(minX, maxX, minY, maxY)
	{
		return this.set(clamp(this.x, minX, maxX), clamp(this.y, minY, maxY));
	}

	clamp1(min, max)
	{
		return this.clamp2(min, max, min, max);
	}

	clampVec(rangeX, rangeY)
	{
		return this.clamp2(rangeX.x, rangeX.y, rangeY.x, rangeY.y);
	}
}

function getIndex(x, y, bitmap) // can be any object with a width parameter (eg. Canvas, ImageData, etc.)
{
	return (x + y * bitmap.width) * 4;
}

function getCanvasData(canvas)
{
	return canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
}

function getImageData(img)
{
	tempCanvas.width = img.width;
	tempCanvas.height = img.height;
	tempCtx.drawImage(img, 0, 0);
	return getCanvasData(tempCanvas);
}

function clearCanvas(canvas)
{
	canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

function resizeCanvas(canvas, width, height)
{
	if(canvas.width === width && canvas.height === height)
	{
		return false;
	}

	canvas.width = width;
	canvas.height = height;
	return true;
}