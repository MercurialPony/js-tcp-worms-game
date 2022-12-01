class Entity
{
	constructor(width, height)
	{
		this.width = width;
		this.height = height;

		this.renderer = null;
		this.pos = new Vec2();
	}

	update(timestep) {}
}

class Player extends Entity
{
	constructor(width, height, username, handJointUv, local)
	{
		super(width, height);
		this.username = username;
		this.handJointUv = handJointUv;
		this.local = local;

		this.aimAngle = 0;
	}

	handJointPos()
	{
		return this.handJointUv.copy()
		.add(-0.5, 0)
		.scale2(this.width, -this.height) // -0.5 on the x because in our system x is the center of an entity's hitbox (rather than left) and *-1 on the y because y is the bottom of the hitbox (rather than the top)
		.addVec(this.pos);
	}

	update(timestamp)
	{
		super.update(timestamp);

		if(this.local && currentTurnUsername === this.username)
		{
			this.aimAngle = sceneRenderer.levelMousePos().angleTo(this.handJointPos());
		}
	}
}