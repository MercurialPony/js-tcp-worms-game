/*------ Init ------*/

let assets;
let sceneRenderer;

let currentTurnUsername;
let entities;

window.onload = async () => // TODO: 3x/4x upscaling
{
	assets = await loadAssets();

	const terrainRenderer = new TerrainRenderer();
	terrainRenderer.prepare(pngToCanvas(parent.mainImg), assets.textures.map.ground, true);

	const levelRenderer = new LevelRenderer();
	levelRenderer.init(terrainRenderer);

	entities = entities.map(info =>
	{
		const player = new Player(12, 17, info.username, new Vec2(0.666, 0.617), sessionStorage.getItem("username") === info.username); // TODO different value for cyborg
		player.pos.set(info.pos.x, info.pos.y);
		const skinIdx = randIntBetween(0, assets.textures.characters.length - 1);
		player.renderer = new PlayerRenderer(player, new AnimatedSprite(assets.textures.characters[skinIdx].body, 4, 5), new AnimatedSprite(assets.textures.characters[skinIdx].hand, 4, 5));
		return player;
	});

	levelRenderer.entities = entities;

	const waterRenderer = new WaterRenderer();

	sceneRenderer = new SceneRenderer(document.getElementById("c"), assets.textures.map.background, levelRenderer, waterRenderer);

	render();
};

/*------ Message handling ------*/

var handler = parent.provideHandler();
handler.json(5, data => entities = data.spawns);
handler.json(6, data => currentTurnUsername = data.currentTurnUsername);

/*------ Render loop ------*/

let lastTimestamp;

function render(timestamp)
{
	const timestep = lastTimestamp ? timestamp - lastTimestamp : 0;

	for(const entity of entities)
	{
		entity.update(timestep);
	}

	sceneRenderer.render(timestep);
	requestAnimationFrame(render);
	lastTimestamp = timestamp;
}

//HIGHSCORE

function tabThis(event) {
  console.log(event.keyCode);
  if (event.keyCode == 9) {
    const dialog = document.querySelector(".dialog-high-score");
    dialog.show();
  } else if (event.keyCode == 192) {
    //для теста "диалога" окончания игры. Нажми на клавишу ~
    const dialog = document.querySelector(".dialog-end-game");
    dialog.show();
  }
}

//btn-to-home

const dialog = document.querySelector(".dialog-deny-close");
const openButton = dialog.nextElementSibling;
const homeButton = dialog.querySelector('sl-button[slot="footer"]');
const closeButton = dialog.querySelector('sl-button[slot="footer"]');

openButton.addEventListener("click", () => dialog.show());
closeButton.addEventListener("click", () => dialog.hide());

dialog.addEventListener("sl-request-close", (event) => {
  if (event.detail.source === "overlay") {
    event.preventDefault();
  }
});
