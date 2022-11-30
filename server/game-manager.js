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

	playerJoined(user, data) {}

	playerLeft(user) {}

	discard() {};
}

class Lobby extends GameContext
{
	static minPlayersToStart = 2;
	static timeToStart = 5 * 1000;

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

	_notifyAccepted(user, accepted)
	{
		MessageSender.json(user.socket, 0, { accepted });
	}

	_notifyPlayerList(user)
	{
		MessageSender.json(user.socket, 1, { players: this._game._players.map(u => u.player.username) });
	}

	_notifyAllPlayerChange(user, joined)
	{
		MessageSender.json(this._game._players.filter(u => u !== user).map(u => u.socket), 2, { username: user.player.username, joined });
	}

	_notifyAllTimeToStart(timeToStart)
	{
		MessageSender.json(this._game._sockets, 3, { timeToStart });
	}

	playerJoined(user, data) // TODO: different error codes on reject
	{
		if(!data.username)
		{
			console.log(user.info(), "attempted to join lobby with no username but was denied");

			this._notifyAccepted(user, false);

			return;
		}

		if(this._game._players.some(u => u.player.username === data.username))
		{
			console.log(user.info(), "attempted to join lobby with an existing username '" + data.username + "' but was denied");

			this._notifyAccepted(user, false);

			return;
		}

		user.player = { username: data.username };
		this._game._players.push(user);
		this._game._sockets.push(user.socket);

		console.log(user.info(), "joined lobby");

		this._notifyAccepted(user, true);

		this._notifyAllPlayerChange(user, true);
		this._notifyPlayerList(user);
		this._setTimer();
	}

	playerLeft(user)
	{
		console.log(user.info(), "left lobby");

		this._game._players = this._game._players.filter(u => u.player.username !== user.player.username);
		this._game._sockets = this._game._players.map(u => u.socket);

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
		MessageSender.png(this._game._sockets, 4, this._game._map);
	}

	_notifyAllSpawnPos()
	{
		this._game._players.forEach(u => MessageSender.json(u.socket, 5, { spawnPos: u.player.spawnPos }));
	}

	_notifyAllCurrentTurn()
	{
		MessageSender.json(this._game._sockets, 6, { currentPlayer: this._currentPlayer().username });
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

		console.log(user.info(), "shot in", direction, "with power", power);
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

	playerJoined(user, data)
	{
		user.kick("for joining after match started");
	}

	playerLeft(user)
	{
		console.log(user.info(), "left game");
		// TODO: end game
	}
}

module.exports = class Game
{
	constructor()
	{
		this._players = [];
		this._sockets = [];
		//this._gameloop = new GameLoop(20, this._update);

		this._context = new Lobby(this);

		this._map = null;
	}

	playerCount()
	{
		return this._players.length + "/" + Lobby.minPlayersToStart;
	}

	_swapContext(ctx)
	{
		this._context.discard();
		this._context = ctx;
	}

	playerJoined(user, data)
	{
		if(user.player)
		{
			console.log(user.info(), "attempted to connect again with name '" + data.username + "'");
			return;
		}

		this._context.playerJoined(user, data);
	}

	playerLeft(user)
	{
		if(!user.player)
		{
			console.log(user.ip, "(forbidden) disconnected");
			return;
		}

		this._context.playerLeft(user);
	}

	_initHandlers()
	{
		MessageHandler.json(0, this.playerJoined.bind(this));

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

	startMatch()
	{
		this._swapContext(new Match(this));
		this._context.start();
		console.log("game started");
	}
}