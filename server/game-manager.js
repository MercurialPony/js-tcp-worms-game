const Utils = require("./utils");
const GameLoop = require("./game-loop");
const MessageSender = require("./message-sender");
const MessageHandler = require("./message-handler");
const TerrainGenerator = require("./terrain-generator");
const PositionGenerator = require("./position-generator");


class GameContext
{
	constructor(game)
	{
		this._game = game;
	}

	playerJoined(user) {}

	playerLeft(user) {}

	discard() {};
}

class Lobby extends GameContext
{
	static minPlayersToStart = 2;
	static timeToStart = 10 * 1000;

	constructor(game)
	{
		super(game);
		
		this._startTimer = null;
	}

	_setTimer()
	{
		const enoughPlayers = this._game._players.length >= Lobby.minPlayersToStart;
		const timerStarted = !!this._startTimer;

		if(enoughPlayers === timerStarted)
		{
			return;
		}

		if(enoughPlayers)
		{
			console.log("players connected. Started countdown");
			this._startTimer = setTimeout(this._game.startMatch.bind(this._game), Lobby.timeToStart);
		}
		else
		{
			console.log("player left. Stopped countdown");
			clearTimeout(this._startTimer);
			this._startTimer = null;
		}

		this._notifyAllTimeToStart(enoughPlayers ? Lobby.timeToStart : -1);
	}

	_notifyPlayerList(user)
	{
		MessageSender.json(user.socket, 0, { players: this._game._players.map(u => u.player.username) });
	}

	_notifyAllPlayerChange(user, joined)
	{
		MessageSender.json(this._game._players.filter(u => u !== user).map(u => u.socket), 1, { username: user.player.username, joined });
	}

	_notifyAllTimeToStart(timeToStart)
	{
		MessageSender.json(this._game._sockets, 2, { timeToStart });
	}

	playerJoined(user)
	{
		this._notifyAllPlayerChange(user, true);
		this._notifyPlayerList(user);
		this._setTimer();
	}

	playerLeft(user)
	{
		this._notifyAllPlayerChange(user, false);
		this._setTimer();
	}

	discard()
	{
		clearTimeout(this._startTimer);
	}
}

class Match extends GameContext
{
	constructor(game)
	{
		super(game);

		this._currentPlayerIdx = Utils.randIntBetween(0, game._players.length - 1);
	}

	_currentPlayer()
	{
		return this._game._players[this._currentPlayerIdx].player;
	}

	_notifyAllMap()
	{
		MessageSender.png(this._game._sockets, 3, this._game._map);
	}

	_notifyAllSpawnPos()
	{
		this._game._players.forEach(u => MessageSender.json(u.socket, 4, { spawnPos: u.player.spawnPos }));
	}

	_notifyAllCurrentTurn()
	{
		MessageSender.json(this._game._sockets, 5, { currentPlayer: this._currentPlayer().username });
	}

	_advanceTurn()
	{
		this._currentPlayerIdx = (this._currentPlayerIdx + 1) % this._game._players.length;
		this._notifyAllCurrentTurn();
	}

	shoot(user, direction, power)
	{
		if(user.player !== this._currentPlayer())
		{
			return;
		}

		console.log(user.player.username, "shot in", direction, "with power", power);
		this._advanceTurn();
	}

	start()
	{
		const spawnPoints = PositionGenerator.pickPoints(this._game._map, this._game._players.length);
		this._game._players.forEach((u, i) => u.player.spawnPos = { x: spawnPoints[i][0], y: spawnPoints[i][1] });
		console.log("picked spawn points for", this._game._players.length, "players");
		this._notifyAllMap();
		this._notifyAllSpawnPos();
		this._notifyAllCurrentTurn();
	}
}

module.exports = class Game
{
	constructor()
	{
		this._players = [];
		this._sockets = [];
		this._gameloop = new GameLoop(20, this._update);

		this._context = new Lobby(this);

		this._map = null;
	}

	_swapContext(ctx)
	{
		this._context.discard();
		this._context = ctx;
	}

	_initHandlers()
	{
		MessageHandler.json(0, (user, data) =>
		{
			user.player = { username: data.username };
			this._players.push(user);
			this._sockets.push(user.socket);
			this._context.playerJoined(user);
		});

		MessageHandler.json(1, (user, data) =>
		{
			if(this._context instanceof Match) // FIXME: ugh
			{
				this._context.shoot(user, data.direction, data.power);
			}
		});
	}

	genMap()
	{
		const randomType = Math.floor(Math.random() * 3) + 1;
		console.log("chose terrain type", randomType);
		this._map = TerrainGenerator.generate(`./terrain_bases/base_${randomType}.png`);
		console.log("generated terrain");
	}

	init()
	{
		this._initHandlers();
		this.genMap();
		// this.gameloop.start();
	}

	_update(delta)
	{

	}


	playerLeft(user)
	{
		this._players = this._players.filter(u => u !== user);
		this._sockets = this._players.map(u => u.socket);
		this._context.playerLeft(user);
	}

	startMatch()
	{
		this._swapContext(new Match(this));
		this._context.start();
		console.log("game started");
	}
}