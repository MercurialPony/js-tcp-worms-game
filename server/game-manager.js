const GameLoop = require("./game-loop");
const MessageSender = require("./message-sender");
const MessageHandler = require("./message-handler");
const TerrainGenerator = require("./terrain-generator");
const PositionGenerator = require("./position-generator");


module.exports = class Game
{
	static minPlayersToStart = 1;
	static timeToStart = 1 * 1000;

	constructor()
	{
		// global stuff
		this.players = [];
		this.gameloop = new GameLoop(20, this._update);

		// lobby stuff
		this.startTimer = null;

		// game stuff
		this.terrain = null;
	}

	_initHandlers()
	{
		MessageHandler.json(0, (user, data) =>
		{
			user.player = { username: data.username };
			this.players.push(user);
			this._setTimer();
		});
	}

	genLevel()
	{
		const randomType = Math.floor(Math.random() * 3) + 1;
		console.log("chose terrain type", randomType);
		this.terrain = TerrainGenerator.generate(`./terrain_bases/base_${randomType}.png`);
		console.log("generated terrain");
	}

	init()
	{
		this._initHandlers();
		this.genLevel();
		// this.gameloop.start();
	}

	_update(delta)
	{

	}

	removePlayer(user)
	{

	}

	_setTimer()
	{
		const enoughPlayers = this.players.length >= Game.minPlayersToStart;
		const timerStarted = !!this.startTimer;

		if(enoughPlayers === timerStarted)
		{
			return;
		}

		if(enoughPlayers)
		{
			console.log("players connected. Started countdown");
			this.startTimer = setTimeout(this._startMatch.bind(this), Game.timeToStart);
		}
		else
		{
			console.log("player left. Stopped countdown");
			clearTimeout(this.startTimer);
			this.startTimer = null;
		}
	}

	_startMatch()
	{
		console.log("game started");
		const spawnPoints = PositionGenerator.pickPoints(this.terrain, this.players.length);
		console.log("picked spawn points for", this.players.length, "players");
	}
}