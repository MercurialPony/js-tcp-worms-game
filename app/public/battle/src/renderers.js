
class CanvasRenderer
{
	constructor()
	{
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");
	}
}





class TerrainRenderer extends CanvasRenderer
{
	constructor(options)
	{
		super();
		this.options = Object.assign({}, { borderWidth: 8, borderColor: { r: 137, g: 197, b: 63 }, groundOffset: { x: 0, y: 0 } }, options);
	}

	_texturize(maskData, groundData, outData, borderWidth, borderColor, groundOffset)
	{
		const maskBitmap = maskData.data;
		const groundBitmap = groundData.data;
		const outBitmap = outData.data;

		for (let y = 0; y < maskData.height; y++)
		{
			for (let x = 0; x < maskData.width; x++)
			{
				const idx = getIndex(x, y, maskData);

				if (maskBitmap[idx + 3] === 0)
				{
					// Pixel is not terrain
					outBitmap[idx + 3] = 0;
					continue;
				}

				// Pixel is terrain
				outBitmap[idx + 3] = maskBitmap[idx + 3]; // Copy alpha

				let isBorder = false;
				if (borderWidth >= 1)
				{
					for (let yd = 1; yd <= borderWidth; ++yd)
					{
						if (maskBitmap[getIndex(x, y - yd, maskData)] === 0)
						{
							isBorder = true;
							break;
						}
					}
				}

				if (isBorder)
				{
					// Pixel is on terrain top border
					outBitmap[idx + 0] = borderColor.r;
					outBitmap[idx + 1] = borderColor.g;
					outBitmap[idx + 2] = borderColor.b;
					continue;
				}

				// Pixel is inside terrain
				const groundIdx = getIndex((groundOffset.x + x) % groundData.width, (groundOffset.y + y) % groundData.height, groundData);
				outBitmap[idx + 0] = groundBitmap[groundIdx + 0];
				outBitmap[idx + 1] = groundBitmap[groundIdx + 1];
				outBitmap[idx + 2] = groundBitmap[groundIdx + 2];

				if (maskBitmap[getIndex(x, y - borderWidth - 1, maskData)] === 0)
				{
					// Pixel is just below the terrain border
					// Use alpha from the shape border top pixel for blending this pixel too
					// This will antialiase the bottom edge of the terrain border
					const alpha = maskBitmap[getIndex(x, y - borderWidth, maskData) + 3] / 255.0;
					outBitmap[idx + 0] = outBitmap[idx + 0] * alpha + borderColor.r * (1.0 - alpha);
					outBitmap[idx + 1] = outBitmap[idx + 1] * alpha + borderColor.g * (1.0 - alpha);
					outBitmap[idx + 2] = outBitmap[idx + 2] * alpha + borderColor.b * (1.0 - alpha);
				}
			}
		}
	}

	prepare(terrainMaskImage, groundImage, randomizeOffset)
	{
		if(randomizeOffset)
		{
			this.options.groundOffset.x = randIntBetween(0, groundImage.width - 1);
			this.options.groundOffset.y = randIntBetween(0, groundImage.height - 1);
		}

		const upscaledMaskCanvas = hqx(terrainMaskImage, 2);

		this.canvas.width = upscaledMaskCanvas.width;
		this.canvas.height = upscaledMaskCanvas.height;

		const data = getCanvasData(this.canvas);

		this._texturize(
			getCanvasData(upscaledMaskCanvas),
			getImageData(groundImage),
			data,
			this.options.borderWidth,
			this.options.borderColor,
			this.options.groundOffset);

		this.ctx.putImageData(data, 0, 0);
	}
}





class PlayerRenderer // the renderer assumes the terrain has been upscaled by 2 and therefor multiplies xy by 2
{
	constructor(player, bodySprite, handSprite) // TODO: make renderer choose texture depending on player skin property
	{
		this.player = player;
		this.bodySprite = bodySprite;
		this.handSprite = handSprite;
	}

	render(ctx, timestep)
	{
		const pos = this.player.pos.copy().scale1(2); // because level is upscaled
		const handJointPos = this.player.handJointPos().scale1(2);

		let angle = this.player.aimAngle + Math.PI * 5 / 180; // add 5 degrees to account for slight offset of the hand texture

		ctx.save();

		if(Math.abs(angle) > Math.PI / 2)
		{
			ctx.translate(pos.x, 0);
			ctx.scale(-1, 1);
			ctx.translate(-pos.x, 0);
			angle = angle * -1 + Math.PI;
		}

		ctx.save();

		ctx.translate(handJointPos.x, handJointPos.y);
		ctx.rotate(angle);
		ctx.translate(-handJointPos.x, -handJointPos.y);

		this.handSprite.render(ctx, pos.x, pos.y, timestep);

		ctx.restore();

		this.bodySprite.render(ctx, pos.x, pos.y, timestep);

		ctx.restore();

		ctx.font = "14px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const text = ctx.measureText(this.player.username);
		const textHeight = text.actualBoundingBoxAscent + text.actualBoundingBoxDescent;
		const borderSize = 10;

		ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
		ctx.fillRect(pos.x - text.width / 2 - borderSize, pos.y - this.player.height * 2 * 1.5 - textHeight / 2 - borderSize / 2, text.width + borderSize * 2, textHeight + borderSize);

		ctx.fillStyle = "white";
		ctx.fillText(this.player.username, pos.x, pos.y - this.player.height * 2 * 1.5);
	}
}

class LevelRenderer extends CanvasRenderer
{
	constructor()
	{
		super();
		//this.options = Object.assign({}, {}, options);
		this.entities = null;
	}

	init(terrainCanvasSupplier) // usually expects a TerrainRenderer, but can be anything
	{
		this.terrainCanvasSupplier = terrainCanvasSupplier;

		const terrainCanvas = terrainCanvasSupplier.canvas;

		this.canvas.width = terrainCanvas.width;
		this.canvas.height = terrainCanvas.height;
	}

	render(timestep)
	{
		clearCanvas(this.canvas);

		this.ctx.drawImage(this.terrainCanvasSupplier.canvas, 0, 0);

		for(const entity of this.entities)
		{
			entity.renderer.render(this.ctx, timestep);
		}
	}
}





class WaterRenderer
{
	constructor(options)
	{
		this.options = Object.assign({}, { seaLevel: 0.2, numWaves: 4, waveColor: { r: 90, g: 153, b: 204 } }, options);
	}

	/*
	generateWave(width, seaLevel, resolution, offset)
	{
		const points = [];

		const seconds = new Date().getTime() / 1000;

		for(let i = 0; i <= resolution; ++i)
		{
			const x = width / resolution * i;
			const y = seaLevel + Math.sin(seconds * 3 + i - offset) * 15 + offset * 15;
			points.push([ x, y ]);
		}

		return points;
	}

	renderWave(ctx, topWave, bottomWave, color)
	{
		ctx.fillStyle = color;

		ctx.beginPath();

		for(let point of topWave)
		{
			ctx.lineTo(...point);
		}
		
		for(let point of bottomWave.slice().reverse())
		{
			ctx.lineTo(...point);
		}

		ctx.closePath();
		ctx.fill();
	}
	*/

	// https://codepen.io/manuelro/pen/RPyzrY
	renderWave(canvas, ctx, seaHeight, resolution, offset, color)
	{
		const seconds = new Date().getTime() / 1000;

		ctx.fillStyle = color;

		ctx.beginPath();

		ctx.lineTo(0, canvas.height);
		for(let i = 0; i <= resolution; ++i)
		{
			const x = canvas.width / resolution * i;
			const y = seaHeight + Math.sin(seconds * 3 + i - offset) * 15 + offset * 15;
			ctx.lineTo(x, y);
		}
		ctx.lineTo(canvas.width, canvas.height);

		ctx.closePath();
		ctx.fill();
	}

	render(canvas, ctx, offset, minWaveNum, maxWaveNum)
	{
		const numWaves = this.options.numWaves;
		const seaHeight = (1 - this.options.seaLevel) * canvas.height + offset.y;
		const waveColor = this.options.waveColor;
		maxWaveNum = maxWaveNum || numWaves;

		for(let i = minWaveNum; i < maxWaveNum; ++i)
		{
			const alpha = (i + 1) / (numWaves * 2);
			this.renderWave(canvas, ctx, seaHeight, numWaves - i, i, `rgba(${waveColor.r}, ${waveColor.g}, ${waveColor.b}, ${alpha})`);
		}
	}
}





class SceneRenderer
{
	constructor(canvas, bgImage, levelRenderer, waterRenderer, options)
	{
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");
		this.bgImage = bgImage;
		this.levelRenderer = levelRenderer;
		this.waterRenderer = waterRenderer;
		this.options = Object.assign({}, { parallax: 0.2 }, options);

		this.scaledLevelSize = this.rescaleToHeight(this.levelRenderer.canvas, this.canvas.height);

		this._drag = new Vec2(0, 0);
	}

	setDrag(dragX, dragY)
	{
		this._drag.set(dragX, dragY);
		this._drag.clamp2(-this.scaledLevelSize.x / 2, this.scaledLevelSize.x / 2, 0, this.scaledLevelSize.y / 2);
	}

	changeDrag(deltaX, deltaY)
	{
		this.setDrag(this._drag.x + deltaX, this._drag.y + deltaY);
	}

	fitCanvas(canvas)
	{
		return resizeCanvas(canvas, canvas.clientWidth, canvas.clientHeight);
	}

	rescaleToHeight(scalee, height)
	{
		return new Vec2(scalee.width * height / scalee.height, height);
	}

	drawBottomCenter(img, scaledSize, offset, canvas, ctx)
	{
		ctx.drawImage(img, offset.x + (canvas.width - scaledSize.x) / 2, offset.y + canvas.height - scaledSize.y, scaledSize.x, scaledSize.y);
	}

	levelMousePos()
	{
		// reverse all the transformation done to the level canvas
		return mouse.pos.copy()
		.addVec(this._drag.copy().scale1(-1)) // first reverse the drag translation
		.add(-(this.canvas.width - this.scaledLevelSize.x) / 2, 0) // then the draw-at-bottom-center translation
		.scale1(this.levelRenderer.canvas.height / this.canvas.height) // then the scale-to-fit-window
		.scale1(0.5); // and finally the hqx upscale
	}

	// TODO: add translation/scale/rotation and instead of manually using the renderer canvas, have each render function draw to a passed canvas instead
	render(timestep)
	{
		clearCanvas(this.canvas);

		this.levelRenderer.render(timestep);

		if(this.fitCanvas(this.canvas))
		{
			this.scaledLevelSize = this.rescaleToHeight(this.levelRenderer.canvas, this.canvas.height);
		}

		const rescaledBgSize = this.rescaleToHeight(this.bgImage, this.canvas.height).scale1(1.25);
		const bgOffset = this._drag.copy().scale1(this.options.parallax);
		this.drawBottomCenter(this.bgImage, rescaledBgSize, bgOffset.copy().add(rescaledBgSize.x / 4, 0), this.canvas, this.ctx);
		this.drawBottomCenter(this.bgImage, rescaledBgSize, bgOffset.add(-3 * rescaledBgSize.x / 4, 0), this.canvas, this.ctx);

		this.waterRenderer.render(this.canvas, this.ctx, this._drag, 0, 2);
		this.drawBottomCenter(this.levelRenderer.canvas, this.scaledLevelSize, this._drag, this.canvas, this.ctx);
		this.waterRenderer.render(this.canvas, this.ctx, this._drag, 2);
	}
}