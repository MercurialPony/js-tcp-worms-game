module.exports = class Vec2
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}

	copy()
	{
		return new Vec2(this.x, this.y);
	}

	length()
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	_operation(binaryFunc)
	{
		return (x, y) =>
		{
			if(y !== undefined)
			{
				binaryFunc(x, y);
				return this;
			}

			if(x instanceof Vec2) // TODO: any object with x and y
			{
				binaryFunc(x.x, x.y)
				return this;
			}

			binaryFunc(x, x);
			return this;
		}
	}

	set = this._operation((x, y) =>
	{
		this.x = x;
		this.y = y;
	});

	add = this._operation((x, y) =>
	{
		this.x += x;
		this.y += y;
	});

	mul = this._operation((x, y) =>
	{
		this.x *= x;
		this.y *= y;
	});

	normalize()
	{
		return this.mul(1 / this.length());
	}
}