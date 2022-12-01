function getSurface(img)
{
	const newData = Buffer.alloc(img.width * img.height * 4);

	img.scan((x, y) =>
	{
		if(img.getColor(x, y).r === 255 && img.getColor(x, y - 1).r === 0)
		{
			const idx = img.getIndex(x, y);
			newData[idx + 0] = newData[idx + 3] = 255;
		}
	});

	img.data = newData;
}

function erodeSurface(img)
{
	const newData = Buffer.alloc(img.width * img.height * 4);

	img.scan((x, y) =>
	{
		if(img.getColor(x, y).r === 0)
		{
			return;
		}

		const a = img.getColor(x - 1, y - 1).r;
		const b = img.getColor(x - 1, y + 0).r;
		const c = img.getColor(x - 1, y + 1).r;

		const d = img.getColor(x + 1, y - 1).r;
		const e = img.getColor(x + 1, y + 0).r;
		const f = img.getColor(x + 1, y + 1).r;

		if(!(a === 0 && b === 0 & c === 0) && !(d === 0 && e === 0 && f === 0))
		{
			const idx = img.getIndex(x, y);
			newData[idx] = newData[idx + 3] = 255;
		}
	});

	img.data = newData;
}

function collectPoints(img)
{
	const points = [];

	img.scan((x, y) =>
	{
		if(img.getColor(x, y).r === 255)
		{
			points.push([ x, y ]);
		}
	});

	return points;
}

function distSq (a, b)
{
	return Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2);
}

function sortPoints(points, height)
{
	let curr = [ 0, height - 1 ];

	const visited = [];
	while (points.length > 0)
	{
		if (distSq(curr, points[points.length - 1]) > 25)
		{
			points.sort((a, b) => distSq(curr, b) - distSq(curr, a))
		}

		curr = points.pop()
		visited.push(curr)
	}
	return visited;
}

function halton (index, base)
{
	let result = 0;
	let f = 1 / base;
	let i = index;

	while (i > 0)
	{
		result = result + f * (i % base);
		i = Math.floor(i / base);
		f = f / base;
	}

	return result
}

function pickPoints(terrain, amount, seed = Math.random())
{
	const surfaceImg = terrain.copy();
	
	// 1
	getSurface(surfaceImg);

	// 2
	erodeSurface(surfaceImg);
	erodeSurface(surfaceImg);
	erodeSurface(surfaceImg);

	// 3
	let surfacePoints = collectPoints(surfaceImg);
	surfacePoints = sortPoints(surfacePoints, surfaceImg.height);

	// 4
	const points = [];
	for(let i = 0; i < amount; ++i)
	{
		// randomize halton sequence by using the seed param as an offset(seed should be between [0,1))
		let nextRandomNb = (halton(i, 2) + seed) % 1.0;
		const point = surfacePoints[Math.floor(nextRandomNb * surfacePoints.length)];
		points.push(point);
	}

	return points;
}



module.exports = {
	pickPoints
};