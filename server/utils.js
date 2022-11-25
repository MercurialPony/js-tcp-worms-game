function randIntBetween(min, max) // min - inclusive, max - inclusive
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(num, min, max)
{
	return Math.min(Math.max(num, min), max);
}

module.exports = {
	randIntBetween,
	clamp
};