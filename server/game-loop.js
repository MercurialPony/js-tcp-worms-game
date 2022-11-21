module.exports = class GameLoop
{
	constructor(tickRate, update)
	{
		this.tickLengthMs = 1000 / tickRate;
		this.update = update();
		
		this._running = false;
	}

	start()
	{
		this._previousTick = Date.now(); // timestamp of each loop
		this._actualTicks = 0; // number of times gameLoop gets calleds
		this._running = true;
		this._loop();
		return this;
	}

	end()
	{
		this._running = false;
	}

	_loop()
	{
		const now = Date.now();
		this._actualTicks++;

		if (this._previousTick + this.tickLengthMs <= now)
		{
			const delta = (now - this._previousTick) / 1000;
			this._previousTick = now;
	
			this.update(delta);
	
			//console.log('delta', delta, '(target: ' + tickLengthMs + ' ms)', 'node ticks', actualTicks);
			this._actualTicks = 0;
		}

		if(!this._running)
		{
			return;
		}
	
		if (Date.now() - this._previousTick < this.tickRate - 16)
		{
			setTimeout(this._loop);
		}
		else
		{
			setImmediate(this._loop);
		}
	}
}