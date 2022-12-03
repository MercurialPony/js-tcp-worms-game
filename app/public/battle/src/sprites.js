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

	nextFrame(loops)
	{
		this.currentFrame = loops ? (this.currentFrame + 1) % this.totalFrames : clamp(this.currentFrame + 1, 0, this.totalFrames - 1);
	}

	render(ctx, x, y, originU, originV, timestep)
	{
		ctx.drawImage(this.spritesheet, this.currentFrame * this.width, 0, this.width, this.height, x - this.width * originU, y - this.height * originV, this.width, this.height);
	}
}

class AnimatedSprite extends Sprite
{
	constructor(spritesheet, totalFrames, frameRate, loops = true)
	{
		super(spritesheet, totalFrames);
		this.frameInterval = 1000 / frameRate;
		this.loops = loops;

		this.accumulatedTime = 0;
	}

	render(ctx, x, y, originU, originV, timestep)
	{
		super.render(ctx, x, y, originU, originV, timestep);

		this.accumulatedTime += timestep;

		if(this.accumulatedTime >= this.frameInterval)
		{
			this.accumulatedTime -= this.frameInterval;
			this.nextFrame(this.loops);
		}
	}
}