"use strict";

const FS = require("fs");
const Noise = require("noisejs").Noise;
const PNG = require("pngjs").PNG;



function clamp(num, min, max)
{
	return Math.min(Math.max(num, min), max);
}

function extend(obj)
{
	obj.writeToDisk = function(path)
	{
		const data = PNG.sync.write(this);
		FS.writeFileSync(path, data);
	};

	obj.constrain = function(x, y)
	{
		return { x: clamp(x, 0, this.width), y: clamp(y, 0, this.height) };
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
		this.data[i] = color.r;
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

function readFromDisk(path)
{
	const data = FS.readFileSync(path);
	return extend(PNG.sync.read(data));
}



function getBorderPoints(img)
{
	const threshold = 100;
	const points = { terrain: [], image: [] };

	img.scan((x, y) =>
	{
		const color = img.getColor(x, y);
		if(color.r >= threshold)
		{
			return;
		}

		if((x === 0 || y === 0 || x === img.width - 1 || y === img.height - 1) && color.b < threshold)
		{
			points.image.push({ x: x, y: y });
		}
		else if(img.getColor(x - 1, y).r > threshold || img.getColor(x + 1, y).r > threshold || img.getColor(x, y - 1).r > threshold || img.getColor(x, y + 1).r > threshold)
		{
			points.terrain.push({ x: x, y: y });
		}
	});

	return points;
}

function applyNoise(img, seed, options)
{
	const noise = new Noise(seed);
	
	img.scan((x, y) =>
	{
		const color = img.getColor(x, y);

		// Do not touch red pixels
		if(color.r >= 200)
		{
			return;
		}

		let value = Math.abs(noise.perlin2(x / options.noiseResolution, y / options.noiseResolution));
		value = Math.max(0, (25 - value * 256) * 8);

		// A second value with different noise is calculated for black terrain pixels
		if (color.r === 0 && color.b === 0)
		{
			let value2 = Math.abs(noise.perlin2((img.width - x - 1) / options.noiseResolutionBlack, y / options.noiseResolutionBlack))
			value2 = Math.max(0, (25 - value2 * 256) * 8)
			value = (value + value2) / 2.0
		}

		let rg = value > options.noiseThreshold ? 255 : 0;

		return { r: rg, g: rg, b: 0, a: 255 };
	});
}

function floodFill(img, stack, color)
{
	const threshold = 255;
	
	while (stack.length > 0)
	{
		const pixel = stack.pop();
		
		let x1 = pixel.x;
		let y = pixel.y;
		while (x1 >= 0 && img.getColor(x1, y).r < threshold)
		{
			x1--;
		}
		x1++

		let spanAbove = 0
		let spanBelow = 0
		while (x1 < img.width && img.getColor(x1, y).r < threshold)
		{
			img.setColor(x1, y, color);
			
			const redBelow = img.getColor(x1, y - 1).r;
			if (!spanAbove && y > 0 && redBelow < threshold)
			{
				stack.push( { x: x1, y: y - 1 });
				spanAbove = 1;
			}
			else if (spanAbove && y > 0 && redBelow >= threshold)
			{
				spanAbove = 0;
			}

			const redAbove = img.getColor(x1, y + 1).r;
			if (!spanBelow && y < img.height - 1 && redAbove < threshold)
			{
				stack.push({ x: x1, y: y + 1 });
				spanBelow = 1
			}
			else if (spanBelow && y < img.height - 1 && redAbove >= threshold)
			{
				spanBelow = 0
			}

			x1++
		}
	}
}

function cleanNoise(img)
{
	img.scan((x, y) =>
	{
		const color = img.getColor(x, y);
		if(color.r === 255 && color.g === 255)
		{
			return { r: color.b === 255 ? 255 : 0, b: 0, g: 0, a: 255 };
		}
	});
}

// WARNING: Kernel must be odd and square
// TODO: generalize, this only works on the red channel
// TODO: a shitton of repeated lookups
// Edge handling is extension (as opposed to wrapping, mirroring, cropping, etc.)
function convolve(img, kernel, divisor, inverse = false)
{
	const newData = Buffer.alloc(img.width * img.height * 4); // could just create new png here, would be easier
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
		newData[idx] = inverse ? 255 - accum : accum;
		newData[idx + 3] = 255;
		// img.setColor(x, y, { r: accum / divisor, g: 0, b: 0, a: 0 }); 
	});

	img.data = newData;
}

function removeHoles(img) //FIXME replace all setColor with return color
{
	img.scan((x, y) =>
	{
		const color = img.getColor(x, y);
		const isYellow = color.r === 255 && color.g === 255;
		img.setColor(x, y, { r: isYellow ? 0 : 255, g: 0, b: 0, a: 255 });
	});
}

const KERNEL = [ [0, 1, 1, 1, 0 ], [ 1, 1, 1, 1, 1 ], [ 1, 1, 1, 1, 1 ], [ 1, 1, 1, 1, 1 ], [ 0, 1, 1, 1, 0 ] ];

const DEFAULT_OPTIONS = { noiseResolution: 35, noiseResolutionBlack: 18, noiseThreshold: 20 };

function generate(baseImgPath, seed, options)
{
	options = Object.assign(DEFAULT_OPTIONS, options);
	
	const baseImg = readFromDisk(baseImgPath);
	
	const scaledX = 700;
	const scaledY = 450;

	// 1
	const resImg = baseImg.scale(scaledX / baseImg.width, scaledY / baseImg.height);

	const borderPoints = getBorderPoints(resImg);

	// 2
	applyNoise(resImg, seed, options);

	// 3
	floodFill(resImg, borderPoints.terrain, { r: 255, g: 0, b: 0, a: 255 });

	// 4
	cleanNoise(resImg);

	// 5
	convolve(resImg, KERNEL, 1);
	convolve(resImg, KERNEL, 1);
	convolve(resImg, KERNEL, 1);
	convolve(resImg, KERNEL, 1);
	convolve(resImg, KERNEL, 1);

	// 6
	floodFill(resImg, borderPoints.image, { r: 255, g: 255, b: 0, a: 255 });

	// 7
	removeHoles(resImg);

	// 8
	convolve(resImg, KERNEL, 1, true);
	convolve(resImg, KERNEL, 1, true);
	convolve(resImg, KERNEL, 1, true);
	convolve(resImg, KERNEL, 1, true);

	return PNG.sync.write(resImg);
}

module.exports.generate = generate;