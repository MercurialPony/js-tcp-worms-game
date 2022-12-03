const Vec2 = require("./vec2");



class Entity
{
	constructor(game, width, height)
	{
		this.game = game;
		this.width = width;
		this.height = height;

		this.id = -1;
		this.pos = new Vec2(0, 0);
		this.dead = false;
	}

	update(timestep) {}
}

class Player extends Entity
{
	static maxChargeTime = 1000;

	constructor(game, username)
	{
		super(game, 12, 17);
		this.eyeHeight = 0.617;
		this.username = username;

		this.lastLook = new Vec2(1, 0); // not normalized

		this.chargeTime = 0;
		this.didShotThisTurn = false;
		this.killed = false;
	}

	eyePos()
	{
		return this.pos.copy().add(0, -this.eyeHeight * this.height);
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
		if(!force && (this.didShotThisTurn || this.killed || this.charging()))
		{
			return false;
		}

		this.chargeTime = Player.maxChargeTime;
		this.didShotThisTurn = true;
		this.game._context._notifyAllCharge(this, true);
		return true;
	}

	stopCharging(force)
	{
		if(!force && (this.killed || !this.charging()))
		{
			return false;
		}

		this.game._context._notifyAllCharge(this, false);
		this.game._context.shoot(this, this.chargeProgress());
		this.chargeTime = 0;
		return true;
	}

	update(timestep)
	{
		super.update(timestep);

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

class Bullet extends Entity
{
	constructor(game, owner)
	{
		super(game, 1, 1);
		this.owner = owner;

		this.velocity = new Vec2(0, 0);
		this.acceleration = new Vec2(0, 300);
	}

	hit(player)
	{
		if(player)
		{
			this.game._context.kill(player, this.owner);
		}

		this.game._context._advanceTurn();
		this.dead = true;
	}

	update(timestep)
	{
		super.update(timestep);

		const oldPos = this.pos.copy();

		this.pos.add(this.velocity.copy().mul(timestep / 1000));
		this.velocity.add(this.acceleration.copy().mul(timestep / 1000));

		const hitPlayers = this.game._players.map(u => u.player).filter(p => p !== this.owner).filter(p => Bullet.lineRect(oldPos, this.pos, p.pos.copy().add(-p.width / 2, -p.height), p.pos.copy().add(-p.width / 2, -p.height), p.pos.copy().add(p.width / 2, 0), p.pos.copy().add(-p.width / 2, 0)));
		if(hitPlayers.length > 0)
		{
			this.hit(hitPlayers[0]);
			return;
		}

		if(this.game._map.isSolidAt(this.pos.x, this.pos.y) || this.pos.y > this.game._map.terrain.height) // TODO: bounding box
		{
			this.hit(null);
		}
	}

	// FIXME: horrible!! remove all this shit and move into dedicated aabb and line classes! DO IT PROPERLY!!!
	static lineLine(va, vb, ua, ub)
	{
		// https://www.jeffreythompson.org/collision-detection/line-line.php
		// calculate the distance to intersection point
		const uA = ((ub.x - ua.x) * (va.y - ua.y) - (ub.y - ua.y) * (va.x - ua.x)) / ((ub.y - ua.y) * (vb.x - va.x) - (ub.x - ua.x) * (vb.y - va.y));
		const uB = ((vb.x - va.x) * (va.y - ua.y) - (vb.y - va.y) * (va.x - ua.x)) / ((ub.y - ua.y) * (vb.x - va.x) - (ub.x - ua.x) * (vb.y - va.y));

		// if uA and uB are between 0-1, lines are colliding
		return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
	}

	static lineRect(lineA, lineB, topLeft, topRight, botRight, botLeft)
	{
		// https://www.jeffreythompson.org/collision-detection/line-rect.php
		return Bullet.lineLine(lineA, lineB, topLeft, topRight) || Bullet.lineLine(lineA, lineB, topRight, botRight) || Bullet.lineLine(lineA, lineB, botRight, botLeft) || Bullet.lineLine(lineA, lineB, botLeft, topLeft);
	}
}

module.exports = {
	Entity,
	Player,
	Bullet
};