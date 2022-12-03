/*------ Init ------*/

let assets;
let sceneRenderer;

let currentTurnUsername;
let players;
let localPlayer;

// fIXME: don't keep the entire entity list in the levelRenderer
window.onload = async () => // TODO: 3x/4x upscaling
{
	assets = await loadAssets();

	const terrainRenderer = new TerrainRenderer();
	terrainRenderer.prepare(pngToCanvas(parent.mainImg), assets.textures.map.ground, true);

	const levelRenderer = new LevelRenderer();
	levelRenderer.init(terrainRenderer);

	const waterRenderer = new WaterRenderer();

	sceneRenderer = new SceneRenderer(document.getElementById("c"), assets.textures.map.background, levelRenderer, waterRenderer);

	initHandlers();

	players = {};
	levelRenderer.entities = levelRenderer.entities.map(info =>
	{
		const isLocal = sessionStorage.getItem("username") === info.username;
		const player = new Player(info.username, new Vec2(0.666, 0.617), isLocal); // TODO different value for cyborg
		player.pos.set(info.pos.x, info.pos.y);

		const skinIdx = randIntBetween(0, assets.textures.characters.length - 1);
		player.renderer = new PlayerRenderer(player,
			new AnimatedSprite(assets.textures.characters[skinIdx].body, 4, 5),
			new AnimatedSprite(assets.textures.characters[skinIdx].hand, 4, 5),
			new AnimatedSprite(assets.textures.guns[0], 4, 5),
			new AnimatedSprite(assets.textures.characters[skinIdx].death, 6, 5, false));

		if(isLocal)
		{
			localPlayer = player;
		}

		players[info.username] = player;
	
		return player;
	});

	render();
};

/*------ Message handling ------*/

var handler = parent.provideHandler();

function initHandlers()
{

handler.json(5, data => sceneRenderer.levelRenderer.entities = data.spawns);
handler.json(6, data =>
{
	currentTurnUsername = data.currentTurnUsername;

	if(!players)
	{
		return;
	}

	Object.values(players).forEach(p => p.didShotThisTurn = false);
});
handler.json(7, data =>
{
	if(!players)
	{
		return;
	}

	const player = players[data.username];

	player.mouseDelta.set(data.look.x, data.look.y);
});
handler.json(8, data =>
{
	const player = players[data.username];

	if(data.started)
	{
		player.startCharging(true);
		return;
	}

	player.stopCharging(true);
});
handler.json(9, data =>
{
	const entity = new Entity(1, 1);
	entity.id = data.id;
	entity.pos.set(data.pos.x, data.pos.y);
	entity.velocity = new Vec2(data.velocity.x, data.velocity.y);
	entity.renderer = new BulletRenderer(entity, new Sprite(assets.textures.bullets[0], 1));
	sceneRenderer.levelRenderer.entities.push(entity);
});
handler.json(10, data =>
{
	sceneRenderer.levelRenderer.entities.filter(e => e.id === data.id).forEach(e => e.dead = true);
});
handler.json(11, data =>
{
	const entity = sceneRenderer.levelRenderer.entities.find(e => e.id === data.id);
	entity.pos.set(data.pos.x, data.pos.y);
	entity.velocity.set(data.velocity.x, data.velocity.y);
});
handler.json(12, data => players[data.username].killed = true);
handler.json(13, data =>
{
	document.getElementsByClassName("end-game-title").innerText += ": " + data.username + " wins!";
	document.querySelector(".dialog-end-game").show();
});
handler.json(14, data =>
{
	const highscoreTable = document.getElementById("highscore-table");

	const createElement = (parent, text, type) =>
	{
		const element = document.createElement(type);
		element.innerText = text;
		parent.appendChild(element);
		return element;
	}

	for(const info of data.highscores)
	{
		const row = createElement(highscoreTable, "", "tr");
		createElement(row, info.username, "th");
		createElement(row, info.kills, "th");
		createElement(row, info.deaths, "th");
	}
});

}

/*------ Render loop ------*/

let lastTimestamp;

function render(timestamp)
{
	const timestep = lastTimestamp ? timestamp - lastTimestamp : 0;

	for(const entity of sceneRenderer.levelRenderer.entities)
	{
		entity.update(timestep);
	}

	sceneRenderer.render(timestep);
	requestAnimationFrame(render);
	lastTimestamp = timestamp;
}

//btn-to-home

const dialog = document.querySelector(".dialog-deny-close");
const openButton = dialog.nextElementSibling;
const homeButton = dialog.querySelector('sl-button[slot="footer"]');
const closeButton = dialog.querySelector('sl-button[slot="footer"]');

openButton.addEventListener("click", () => dialog.show());
closeButton.addEventListener("click", () => dialog.hide());

dialog.addEventListener("sl-request-close", e =>
{
	if (e.detail.source === "overlay")
	{
		e.preventDefault();
	}
});
