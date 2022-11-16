const tempCanvas = document.createElement("canvas");
const tempCtx = tempCanvas.getContext("2d");

function randIntBetween(min, max) // min - inclusive, max - inclusive
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(val, min, max)
{
	return min > val ? min : val > max ? max : val;
}

function indexOfMax(arr)
{
	let max = arr[0];
	let maxIdx = 0;

	for (let i = 1; i < arr.length; ++i)
	{
		if (arr[i] > max)
		{
			maxIndex = i;
			max = arr[i];
		}
	}

	return maxIdx;
}

function loadImage(src)
{
	return new Promise((res, rej) =>
	{
		const img = new Image();
		img.src = src;
		img.onload = () => res(img);
		img.onerror = rej;
	});
}