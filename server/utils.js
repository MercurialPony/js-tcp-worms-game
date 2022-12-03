function randIntBetween(min, max) // min - inclusive, max - inclusive
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(num, min, max)
{
	return Math.min(Math.max(num, min), max);
}

function remap(v, minOld, maxOld, minNew, maxNew)
{
	return minNew + (v - minOld) * (maxNew - minNew) / (maxOld - minOld);
}

module.exports = {
	randIntBetween,
	clamp,
	remap
};