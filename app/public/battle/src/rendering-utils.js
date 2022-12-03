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

	length()
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
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

	normalize()
	{
		return this.scale1(1 / this.length());
	}

	angle()
	{
		return Math.atan2(this.y, this.x);
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

const tempCanvas = document.createElement("canvas");
const tempCtx = tempCanvas.getContext("2d");

function getImageData(img)
{
	tempCanvas.width = img.width;
	tempCanvas.height = img.height;
	tempCtx.drawImage(img, 0, 0);
	return getCanvasData(tempCanvas);
}

function pngToCanvas(png)
{
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	canvas.width = png.width;
	canvas.height = png.height;

	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	for(let i = 0; i < png.data.length; ++i)
	{
		imageData.data[i] = png.data[i];
	}

	ctx.putImageData(imageData, 0, 0);

	return canvas;
}

function clearCanvas(canvas) // TODO: pass ctx everywhere instead of canvas
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

function renderCenteredTextBox(ctx, x, y, text, boxStyle, textStyle, borderSizeX = 10, borderSizeY = 5)
{
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	const metrics = ctx.measureText(text);
	const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

	ctx.fillStyle = boxStyle;
	ctx.fillRect(x - metrics.width / 2 - borderSizeX, y - textHeight / 2 - borderSizeY, metrics.width + borderSizeX * 2, textHeight + borderSizeY * 2);

	ctx.fillStyle = textStyle;
	ctx.fillText(text, x, y);
}