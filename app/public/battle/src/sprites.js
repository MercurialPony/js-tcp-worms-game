class Sprite
{
	constructor(spritesheet, totalFrames)
	{
		this.spritesheet = spritesheet;
		this.totalFrames = totalFrames;

		this.width = this.spritesheet.width / this.totalFrames;
		this.height = this.spritesheet.height;
		this.currentFrame = 0;
	}

	nextFrame()
	{
		this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
	}

	render(ctx, x, y, timestep)
	{
		ctx.drawImage(this.spritesheet, this.currentFrame * this.width, 0, this.width, this.height, x - this.width / 2, y - this.height, this.width, this.height);
	}
}

class AnimatedSprite extends Sprite
{
	constructor(spritesheet, totalFrames, frameRate)
	{
		super(spritesheet, totalFrames);
		this.frameInterval = 1000 / frameRate;

		this.accumulatedTime = 0;
	}

	render(ctx, x, y, timestep)
	{
		super.render(ctx, x, y, timestep);

		this.accumulatedTime += timestep;

		if(this.accumulatedTime >= this.frameInterval)
		{
			this.accumulatedTime -= this.frameInterval;
			this.nextFrame();
		}
	}
}