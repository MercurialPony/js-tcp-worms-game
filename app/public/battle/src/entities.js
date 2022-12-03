class Entity
{
	constructor(width, height)
	{
		this.width = width;
		this.height = height;

		this.renderer = null;
		this.pos = new Vec2(0, 0);
		this.dead = false;
	}

	update(timestep) {}
}

class Player extends Entity
{
	static maxChargeTime = 1000;

	constructor(username, handJointUv, local)
	{
		super(12, 17);
		this.username = username;
		this.handJointUv = handJointUv;
		this.local = local;

		this.mouseDelta = new Vec2(1, 0); // TODO: relative to center eye height
		this.look = new Vec2(1, 0);

		this.chargeTime = 0;
		this.didShotThisTurn = false;

		this.killed = false;

		if(local)
		{
			this.notifyInterval = setInterval(() => parent.sendJson(1, { look: this.mouseDelta }), 20 / 1000);
		}
	}

	isCurrentTurn()
	{
		return currentTurnUsername === this.username;
	}

	charging()
	{
		return this.chargeTime > 0;
	}

	chargeProgress()
	{
		return 1 - this.chargeTime / Player.maxChargeTime;
	}

	startCharging(force)
	{
		if(!force && (!this.isCurrentTurn() || this.didShotThisTurn || this.killed || this.charging()))
		{
			return;
		}

		this.chargeTime = Player.maxChargeTime;
		this.didShotThisTurn = true;
		parent.sendJson(2, { started: true });
	}

	stopCharging(force)
	{
		if(!force && (!this.isCurrentTurn() || this.killed || !this.charging()))
		{
			return;
		}

		this.chargeTime = 0;
		parent.sendJson(2, { started: false });
	}

	handJointPos()
	{
		return this.handJointUv.copy()
		.add(-0.5, 0)
		.scale2(this.width, -this.height) // -0.5 on the x because in our system x is the center of an entity's hitbox (rather than left) and *-1 on the y because y is the bottom of the hitbox (rather than the top)
		.addVec(this.pos);
	}

	update(timestep)
	{
		super.update(timestep);

		if(this.local)
		{
			this.mouseDelta = sceneRenderer.levelMousePos().addVec(this.handJointPos().scale1(-1));
		}

		this.look = this.mouseDelta.copy().normalize();

		if(this.chargeTime > 0)
		{
			this.chargeTime -= timestep;

			if(this.chargeTime <= 0)
			{
				this.stopCharging(true);
			}
		}
	}
}