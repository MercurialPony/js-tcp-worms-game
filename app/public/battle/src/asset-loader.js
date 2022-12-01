async function loadCharacter(path)
{
	const body = loadImage(path + "/idle_body.png");
	const hand = loadImage(path + "/idle_hand.png");

	return {
		body: await body,
		hand: await hand
	};
}

async function loadAssets()
{
	const bg = loadImage("./assets/textures/map/background.svg");
	const grnd = loadImage("./assets/textures/map/ground.png");

	const chars = Promise.all([ 0, 1, 2 ].map(n => loadCharacter("./assets/textures/characters/" + n)));

	return {
		textures: {
			map: {
				background: await bg,
				ground: await grnd
			},
			characters: await chars
		}
	};
}