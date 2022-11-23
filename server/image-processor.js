const FS = require("fs");
const PNG = require("pngjs").PNG;
const { clamp } = require("./utils");

function extend(obj)
{
	obj.writeToDisk = function(path)
	{
		const data = PNG.sync.write(this);
		FS.writeFileSync(path, data);
	};

	obj.copy = function()
	{
		return extend({ width: this.width, height: this.height, data: this.data = Buffer.concat([ this.data ]) }); // TODO: gamma?
	}

	obj.constrain = function(x, y)
	{
		return { x: clamp(x, 0, this.width - 1), y: clamp(y, 0, this.height - 1) };
	}

	obj.getIndex = function(x, y)
	{
		return (x + y * this.width) * 4;
	};

	obj.getColor = function(x, y)
	{
		const i = this.getIndex(x, y);
		return { r: this.data[i], g: this.data[i + 1], b: this.data[i + 2], a: this.data[i + 3] };
	};

	obj.setColor = function(x, y, color)
	{
		const i = this.getIndex(x, y);
		this.data[i + 0] = color.r;
		this.data[i + 1] = color.g;
		this.data[i + 2] = color.b;
		this.data[i + 3] = color.a;
	};

	obj.scan = function(action, startX = 0, startY = 0, endX = this.width, endY = this.height)
	{
		for(let y = startY; y < endY; ++y)
		{
			for(let x = startX; x < endX; ++x)
			{
				const newColor = action(x, y, this);
				
				if(newColor)
				{
					this.setColor(x, y, newColor);
				}
			}
		}
	};

	// nearest neighbor
	// TODO: this shifts the image down right by 1 pix for some reason
	obj.scale = function(xs, ys)
	{
		const scaledImg = extend(new PNG({ width: Math.round(this.width * xs), height: Math.round(this.height * ys) }));
		scaledImg.scan((x, y) => this.getColor(Math.round(x / xs), Math.round(y / ys)));
		return scaledImg;
	};

	return obj;
}

// WARNING: Kernel must be odd and square
// TODO: generalize, this only works on the red channel
// Edge handling is extension (as opposed to wrapping, mirroring, cropping, etc.)
function convolve(img, kernel, divisor, inverse = false)
{
	const newData = Buffer.alloc(img.width * img.height * 4);
	const kr = (kernel.length - 1) / 2;
	
	img.scan((x, y) =>
	{
		let accum = 0;

		for(let ky = 0; ky < kernel.length; ++ky)
		{
			for(let kx = 0; kx < kernel.length; ++kx)
			{
				const constrainedCoord = img.constrain(x + kx - kr, y + ky - kr);
				const color = img.getColor(constrainedCoord.x, constrainedCoord.y);
				const k = kernel[kx][ky];
				// const add = reducer(accum, color.r, k, constrainedCoord.x, constrainedCoord.y, x, y, kx, ky);
				accum += (inverse ? 255 - color.r : color.r) * k;
			}
		}

		accum = clamp(accum, 0, 255);
		accum /= divisor; // TODO: round?

		const idx = img.getIndex(x, y);
		newData[idx + 0] = inverse ? 255 - accum : accum;
		newData[idx + 3] = 255;
		// img.setColor(x, y, { r: accum / divisor, g: 0, b: 0, a: 0 }); 
	});

	img.data = newData;
}

module.exports = {
	extend,
	convolve
};