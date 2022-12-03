async function loadCharacter(path)
{
	const body = loadImage(path + "/idle_body.png");
	const hand = loadImage(path + "/idle_hand.png");
	const death = loadImage(path + "/death_full.png");

	return {
		body: await body,
		hand: await hand,
		death: await death
	};
}

async function loadAssets()
{
	const bg = loadImage("./assets/textures/map/background.svg");
	const grnd = loadImage("./assets/textures/map/ground.png");

	const chars = Promise.all([ 0, 1, 2 ].map(n => loadCharacter("./assets/textures/characters/" + n)));

	const guns = Promise.all([ 0 ].map(n => loadImage("./assets/textures/guns/gun_" + n + ".png")));
	const bullets = Promise.all([ 0 ].map(n => loadImage("./assets/textures/guns/bullet_" + n + ".png")));

	return {
		textures: {
			map: {
				background: await bg,
				ground: await grnd
			},
			characters: await chars,
			guns: await guns,
			bullets: await bullets
		}
	};
}