const Utils = require("./utils");
const GameLoop = require("./game-loop");
const MessageSender = require("./message-sender");
const MessageHandler = require("./message-handler");
const TerrainGenerator = require("./terrain-generator");
const PositionGenerator = require("./position-generator");
const Vec2 = require("./vec2");
const { Player, Bullet } = require("./entities");
const Highscores = require("./highscores");


class Map
{
	constructor(terrain)
	{
		this.terrain = terrain;
	}

	isSolidAt(x, y)
	{
		return this.terrain.getColor(Math.floor(x), Math.floor(y)).r > 0; // TODO: floor?
	}
}

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

		user.logIn(new Player(this._game, data.username));
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

		this.entities = this._game._players.map(u => u.player);
		this.lastEntityId = 0;
		this._currentPlayerIdx = Utils.randIntBetween(0, game._players.length - 1);
		this.gameloop = new GameLoop(20, this.update.bind(this));
	}

	addEntity(entity)
	{
		entity.id = this.lastEntityId++;
		this.entities.push(entity);
		this._notifyAllEntityCreated(entity);
	}

	_currentPlayer()
	{
		return this._game._players[this._currentPlayerIdx].player;
	}

	_notifyAllMap()
	{
		MessageSender.png(this._game._sockets, 4, this._game._map.terrain);
	}

	_notifyAllSpawnPos()
	{
		MessageSender.json(this._game._sockets, 5, { spawns: this._game._players.map( u => ({ username: u.player.username, pos: u.player.pos }) ) });
	}

	_notifyAllCurrentTurn()
	{
		MessageSender.json(this._game._sockets, 6, { currentTurnUsername: this._currentPlayer().username });
	}

	_notifyAllLook(user)
	{
		MessageSender.json(this._game._players.filter(u => u !== user).map(u => u.socket), 7, { username: user.player.username, look: user.player.lastLook });
	}

	_notifyAllCharge(player, started)
	{
		MessageSender.json(this._game._players.filter(u => u.player !== player).map(u => u.socket), 8, { username: player.username, started });
	}

	_notifyAllEntityCreated(entity)
	{
		MessageSender.json(this._game._sockets, 9, { id: entity.id, pos: entity.pos, velocity: entity.velocity }); // TODO: serialize
	}

	_notifyAllEntityDied(entity)
	{
		MessageSender.json(this._game._sockets, 10, { id: entity.id });
	}

	_notifyAllEntityStatus(entity)
	{
		MessageSender.json(this._game._sockets, 11, { id: entity.id, pos: entity.pos, velocity: entity.velocity });
	}

	_notifyAllPlayerKilled(player)
	{
		MessageSender.json(this._game._sockets, 12, { username: player.username });
	}

	_notifyAllWinner(player)
	{
		MessageSender.json(this._game._sockets, 13, { username: player.username });
	}

	_notifyAllStats()
	{
		MessageSender.json(this._game._sockets, 14, { highscores: this._game._players.map(u => u.player).map(p => Object.assign({ username: p.username }, Highscores.getInfo(p.username))) });
	}

	kill(player, killer)
	{
		player.killed = true;
		this._notifyAllPlayerKilled(player);
		
		Highscores.getInfo(player.username).deaths++;
		Highscores.getInfo(killer.username).kills++;
		Highscores.save();
	}

	isGameOver()
	{
		const playersAlive = this._game._players.filter(u => !u.player.killed).length;
		return playersAlive <= 1;
	}

	endGame()
	{
		this._notifyAllWinner(this._game._players.map(u => u.player).find(p => !p.killed));
		setTimeout(this.end.bind(this), 3000);
	}

	_advanceTurn()
	{
		if(this.isGameOver())
		{
			setTimeout(this.endGame.bind(this), 3000);
			return;
		}

		do
		{
			this._currentPlayerIdx = (this._currentPlayerIdx + 1) % this._game._players.length;
		}
		while(this._currentPlayer().killed)

		this._game._players.forEach(u => u.player.didShotThisTurn = false);
		this._notifyAllCurrentTurn();
		console.log("Switched turn to " + this._currentPlayer().username);
	}

	updateLook(user, look)
	{
		if(user.player.killed)
		{
			return;
		}

		user.player.lastLook = new Vec2(look.x, look.y);
		this._notifyAllLook(user);
	}

	handleCharge(user, started)
	{
		if(user.player.killed)
		{
			console.log(user.info(), "sent a started/ended charge message after dying");
			return;
		}

		if(user.player !== this._currentPlayer())
		{
			console.log(user.info(), "sent a started/ended charge message even though it's not their turn");
			return;
		}

		if(started)
		{
			if(!user.player.startCharging())
			{
				console.log(user.info(), "tried to start charging while already charging or having taken a shot already");
			}

			return;
		}

		if(!user.player.stopCharging())
		{
			console.log(user.info(), "tried to stop charging even though they weren't already charging");
		}
	}

	shoot(player, progress)
	{
		const bullet = new Bullet(this._game, player);
		bullet.pos.set(player.eyePos());
		bullet.velocity.set(player.lastLook.copy().normalize().mul(Utils.remap(progress, 0, 1, 50, 500)));
		this.addEntity(bullet);
	}

	update(timestep)
	{
		for(const entity of this.entities)
		{
			entity.update(timestep);

			if(entity.dead)
			{
				console.log("died");
				this._notifyAllEntityDied(entity);
				continue;
			}

			if(entity.id >= 0) // dirty hack to exclude players for now
			{
				this._notifyAllEntityStatus(entity);
			}
		}

		this.entities = this.entities.filter(e => !e.dead);
	}

	start()
	{
		console.log("game started");
		this._game.genMap();
		const spawnPoints = PositionGenerator.pickPoints(this._game._map.terrain, this._game._players.length);
		this._game._players.forEach((u, i) => u.player.pos.set(spawnPoints[i][0], spawnPoints[i][1]));
		console.log("picked spawn points for", this._game._players.length, "players");
		this._notifyAllMap();
		this._notifyAllSpawnPos();
		this._notifyAllCurrentTurn();
		this._notifyAllStats();
		this.gameloop.start();
	}

	end() // FIXME: players get counted into lobby
	{
		this._game._players.forEach(u => u.kick("match ended")); // TODO: remove player on disconnect
		this._game._players.length = 0; // TODO don't repeat
		this._game._sockets.length = 0;
		this._game.startLobby();
	}

	playerJoined(user, data)
	{
		user.kick("for joining after match started");
	}

	playerLeft(user)
	{
		console.log(user.info(), "left game");
		console.log("Ending game");
		this.end();
	}

	discard()
	{
		this.gameloop.end();
	}
}

module.exports = class Game
{
	constructor()
	{
		this._players = [];
		this._sockets = [];

		this._context = null;

		this._map = null;
	}

	playerCount()
	{
		return this._players.length + "/" + Lobby.minPlayersToStart;
	}

	_swapContext(ctx)
	{
		if(this._context)
		{
			this._context.discard();
		}

		this._context = ctx;
	}

	playerJoined(user, data)
	{
		if(user.loggedIn())
		{
			console.log(user.info(), "attempted to connect again with name '" + data.username + "'");
			return;
		}

		this._context.playerJoined(user, data);
	}

	playerLeft(user)
	{


		if(!user.loggedIn())
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
				this._context.updateLook(user, data.look);
			}
		});

		MessageHandler.json(2, (user, data) =>
		{
			if(this._context instanceof Match) // FIXME: ugh
			{
				this._context.handleCharge(user, data.started);
			}
		});
	}

	genMap()
	{
		const randomType = 2; // Math.floor(Math.random() * 3) + 1; // FIXME: 2 only for showcase
		console.log("chose terrain type", randomType);
		this._map = new Map(TerrainGenerator.generate(`./terrain_bases/base_${randomType}.png`));
		console.log("generated terrain");
	}

	init()
	{
		this._initHandlers();
		this.startLobby();
	}

	startLobby()
	{
		this._swapContext(new Lobby(this));
		console.log("lobby started");
	}

	startMatch()
	{
		this._swapContext(new Match(this));
		this._context.start();
	}
}