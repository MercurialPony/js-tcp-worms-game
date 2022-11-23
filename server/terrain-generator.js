"use strict";

const FS = require("fs");
const PNG = require("pngjs").PNG;
const Noise = require("noisejs").Noise;
const { extend, convolve } = require("./image-processor");



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

function removeHoles(img) //FIXME replace all setColor with return color
{
	img.scan((x, y) =>
	{
		const color = img.getColor(x, y);
		const isYellow = color.r === 255 && color.g === 255;
		img.setColor(x, y, { r: isYellow ? 0 : 255, g: 0, b: 0, a: 255 });
	});
}

const EROSION_DILATION_KERNEL = [ [0, 1, 1, 1, 0 ], [ 1, 1, 1, 1, 1 ], [ 1, 1, 1, 1, 1 ], [ 1, 1, 1, 1, 1 ], [ 0, 1, 1, 1, 0 ] ];

const DEFAULT_OPTIONS = { noiseResolution: 35, noiseResolutionBlack: 18, noiseThreshold: 20 };

// FIXME: async
function generate(baseImgPath, seed, options)
{
	seed = seed || Math.random();

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
	convolve(resImg, EROSION_DILATION_KERNEL, 1);
	convolve(resImg, EROSION_DILATION_KERNEL, 1);
	convolve(resImg, EROSION_DILATION_KERNEL, 1);
	convolve(resImg, EROSION_DILATION_KERNEL, 1);
	convolve(resImg, EROSION_DILATION_KERNEL, 1);

	// 6
	floodFill(resImg, borderPoints.image, { r: 255, g: 255, b: 0, a: 255 });

	// 7
	removeHoles(resImg);

	// 8
	convolve(resImg, EROSION_DILATION_KERNEL, 1, true);
	convolve(resImg, EROSION_DILATION_KERNEL, 1, true);
	convolve(resImg, EROSION_DILATION_KERNEL, 1, true);
	convolve(resImg, EROSION_DILATION_KERNEL, 1, true);

	return resImg;
}

module.exports = {
	generate
};