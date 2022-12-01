let sceneRenderer;

// TODO: 3x/4x upscaling
// TODO: add interpolation parameter https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame

window.onload = async () => {
  const bgPromise = loadImage("./textures/background.svg");
  const groundPromise = loadImage("./textures/ground.png");
  const maskPromise = pngToCanvas(parent.mainImg); // loadImage("../main_img.png");

  const terrainRenderer = new TerrainRenderer();
  terrainRenderer.prepare(await maskPromise, await groundPromise, true);

  const levelRenderer = new LevelRenderer();
  levelRenderer.init(terrainRenderer);

  const waterRenderer = new WaterRenderer();

  sceneRenderer = new SceneRenderer(
    document.getElementById("c"),
    await bgPromise,
    levelRenderer,
    waterRenderer
  );

  render();
};

var handler = parent.provideHandler();

handler.json(5, (data) => {});

handler.json(6, (data) => {});

window.onmousemove = (event) => {
  if (leftMouseDown) {
    sceneRenderer.changeDrag(event.movementX, event.movementY);
  }
};

function render() {
  sceneRenderer.render();
  requestAnimationFrame(render);
}

//HIGHSCORE

function tabThis(event) {
  console.log(event.keyCode);
  if (event.keyCode == 9) {
    const dialog = document.querySelector(".dialog-high-score");
    dialog.show();
  }
}
