import { global } from "./global.js";
import { util } from "./util.js"
import { logger } from "./debug.js"
import { config } from "./config.js";
import { rewardManager } from "./achievements.js"
import { color, mixColors } from "./colors.js";
import { mockups } from "./mockups.js";
import { Smoothbar } from "./util.js";
import { multiplayer } from "./multiplayer.js";
import { fasttalk } from "./fasttalk.js";
import { lerp } from "./lerp.js";
import "./consoleCommands.js"

let socket;

let lag = function () {
	let sum = 0;
	let entries = 0;
	return {
		get: function () {
			return sum / entries;
		},
		add: function (l) {
			sum += l;
			entries++;
			if (entries > config.memory){
				sum -= sum/entries;
				entries--;
			}
		}
	};
}();

// CONVERT //
const convert = {
	reader: {
		index: 0,
		crawlData: [],
		next: function () {
			if (convert.reader.index >= convert.reader.crawlData.length) {
				logger.norm(convert.reader.crawlData);
				throw new Error("Trying to crawl past the end of the provided data!");
			} else return convert.reader.crawlData[convert.reader.index++];
		},
		take: amount => {
			convert.reader.index += amount;
			if (index > convert.reader.crawlData.length) {
				console.error(convert.reader.crawlData);
				throw new Error("Trying to crawl past the end of the provided data!");
			}
		},
		set: function (data, offset) {
			convert.reader.crawlData = data;
			convert.reader.index = offset;
		}
	},

	data: convertData,
	fastGui: convertFastGui,
	slowGui: convertSlowGui,
};

// CONVERT DATA // 
const GunContainer = function () {
	function physics(g) {
		g.isUpdated = 1;
		if (g.motion || g.position) {
			g.motion -= 0.01
			g.position += g.motion;
			if (g.position < 0) {
				g.position = 0;
				g.motion = -g.motion;
			} else if (g.position > .5) {
				g.position = .5
			}
			if (g.motion > 0) g.motion *= .7;
		}
	}
	return function (n) {
		let a = [];
		for (let i = 0; i < n; i++) a.push({
			motion: 0,
			position: 0,
			isUpdated: 1
		});
		return {
			getPositions: function () {
				return a.map(function (g) {
					return g.position;
				});
			},
			update: function () {
				for (let i = 0; i < a.length; i++) {
					physics(a[i])
				}
			},
			fire: function (i, power) {
				if (a[i].isUpdated) a[i].motion += Math.sqrt(power) / 20;
				a[i].isUpdated = 0;
			},
			length: a.length
		};
	};
}();

function Status() {
	let state = "normal",
		time = getNow();
	return {
		set: function (val) {
			// Only update time and state if the new value is different,
			// OR if we're explicitly re-setting "injured" (to refresh its timer)
			if (val !== state || val === "injured") {
				if (state !== "killed" && val !== "normal") {
					time = getNow(); // injured/killed timer
				}
				state = val;
			}
		},
		getFade: function () {
			return state === "killed" ? 1 - Math.min(1, (getNow() - time) / 300) : 1;
		},
		getColor: function () {
			return config.tintedDamage ? mixColors(color.red, color.guiblack, 0.2) : "#FFFFFF";
		},
		getBlend: function () {
			const val = 80 * 6
			let o = (state === "normal") ? 0 : .8 - Math.min(.8, (getNow() - time) / val);
			// Injured state wears off after some time and reverts to normal
			if (getNow() - time > val && state === "injured") {
				state = "normal";
			}
			return o;
		},
		getCurrentState: function () { // Getter for current state
			return state;
		}
	};
}

const process = function () {
	const unpacking = {
		new: function (entity) {
			let isNew = entity.facing == null;
			const type = convert.reader.next();
			if (type & 0x01) {
				entity.facing = convert.reader.next();
				entity.layer = convert.reader.next();
			} else {
				entity.interval = metrics._rendergap;
				entity.id = convert.reader.next();
				let iii = entityMap.get(entity.id)
				if (iii !== undefined) {
					entity = iii
				}
				isNew = iii === undefined;
				if (!isNew) {
					entity.render.draws = true;
					entity.render.lastx = entity.x;
					entity.render.lasty = entity.y;
					entity.render.lastvx = entity.vx;
					entity.render.lastvy = entity.vy;
				}
				const flags = convert.reader.next();
				entity.index = convert.reader.next();
				entity.x = isNew?convert.reader.next():lerp(entity.render.lastx, convert.reader.next(), config.movementSmoothing);
				entity.y = isNew?convert.reader.next():lerp(entity.render.lasty, convert.reader.next(), config.movementSmoothing);
				entity.vx = 0;//convert.reader.next();
				entity.vy = 0;//convert.reader.next();
				entity.size = convert.reader.next();
				entity.facing = convert.reader.next();
				entity.twiggle = (flags & 1);
				entity.layer = (flags & 2) ? convert.reader.next() : 0;
				entity.color = convert.reader.next();
				entity.team = convert.reader.next();
				if (isNew) {
					entity.health = (flags & 4) ? (convert.reader.next() / 255) : 1;
					entity.shield = (flags & 8) ? (convert.reader.next() / 255) : 1;
				} else {
					let hh = entity.health,
						ss = entity.shield;
					entity.health = (flags & 4) ? (convert.reader.next() / 255) : 1;
					entity.shield = (flags & 8) ? (convert.reader.next() / 255) : 1;
					if (entity.health < hh || entity.shield < ss) {
						entity.render.status.set("injured");
					} else if (entity.render.status.getFade() !== 1) {
						entity.render.status.set("normal");
					}
				}
				entity.alpha = (flags & 16) ? (convert.reader.next() / 255) : 1;
				entity.seeInvisible = flags & 32;
				entity.nameColor = flags & 64 ? convert.reader.next() : "#FFFFFF";
				entity.label = flags & 128 ? convert.reader.next() : mockups.get(entity.index).name
				entity.widthHeightRatio = [(flags & 256) ? convert.reader.next() : 1, (flags & 512) ? convert.reader.next() : 1];
				entity.drawsHealth = type & 0x02;
				entity.nameplate = type & 0x04;
				entity.invuln = (type & 0x08 ? entity.invuln || Date.now() : 0);
				if (type & 0x04) {
					entity.name = convert.reader.next();
					entity.score = convert.reader.next();
					entity.messages = convert.reader.next();
				}
				if (isNew) {
					entity.render = {
						real: true,
						draws: false,
						expandsWithDeath: entity.drawsHealth,
						x: entity.x,
						y: entity.y,
						lastx: entity.x - metrics._rendergap * config.roomSpeed * (1000 / 30) * entity.vx,
						lasty: entity.y - metrics._rendergap * config.roomSpeed * (1000 / 30) * entity.vy,
						lastvx: entity.vx,
						lastvy: entity.vy,
						facing: entity.facing,
						h: entity.health,
						s: entity.shield,
						interval: metrics._rendergap,
						slip: 0,
						status: Status(),
						health: Smoothbar(entity.health, .06, true),
						shield: Smoothbar(entity.shield, .06, true),
						size: 1,
						extra: [1, 0], // for props
					};

					let mockup = mockups.get(entity.index);
					if (mockup != null && mockup.shape > 2 && mockup.shape < 6) {
						switch (mockup.color) {
							case 207:
								rewardManager.unlockAchievement("hot");
								break;
							case 31:
								rewardManager.unlockAchievement("toxic");
								break;
							case 261:
								rewardManager.unlockAchievement("mystic");
								break;
						}
					}
					if (entity.color === -1) {
						rewardManager.unlockAchievement("realShiny")
					}
				}
				entity.render.health.set(entity.health);
				entity.render.shield.set(entity.shield);
				if (!isNew && entity.oldIndex !== entity.index) isNew = true;
				entity.oldIndex = entity.index;
			}
			let gunnumb = convert.reader.next();
			if (isNew) {
				entity.guns = GunContainer(gunnumb);
			} else if (gunnumb !== entity.guns.length) {
				throw new Error("Mismatch between data gun number and remembered gun number!");
			}
			for (let i = 0; i < gunnumb; i++) {
				let time = convert.reader.next(),
					power = convert.reader.next();
				if (time > global.player._lastUpdate - metrics._rendergap) {
					entity.guns.fire(i, power);
				}
			}
			let turnumb = convert.reader.next();
			if (isNew) {
				entity.turrets = [];
				for (let i = 0; i < turnumb; i++) {
					entity.turrets.push(process());
				}
			} else {
				if (entity.turrets.length !== turnumb) {
					console.log(entity);
					throw new Error("Mismatch between data turret number and remembered turret number!");
				}
				for (let i = 0; i < entity.turrets.length; i++) {
					process(entity.turrets[i]);
				}
			}

			return entity;
		}
	}
	// Return our function
	return (z = {}) => {
		return unpacking.new(z);
	};
}();

function convertData() {
	const updatedEntityIds = new Set(); // Keep track of IDs received in this packet

	// This loop updates existing entities or adds new ones to the 'entities' Map.
	// It also populates 'updatedEntityIds' with the IDs of all entities
	// for which data was received in this packet.
	for (let i = 0, len = convert.reader.next(); i < len; i++) {
		const e = process();
		entityMap.set(e.id, e);
		updatedEntityIds.add(e.id);
	}

	entityArr.length = 0;
	for (let [id, e] of entityMap) {
		entityArr.push(e);
		// This entity was in our client's list from the PREVIOUS frame,
		// but was NOT included in the server's update THIS frame.
		// This implies the server has stopped sending data for it, likely because it's dead.
		if (updatedEntityIds.has(id) === true) continue;

		// Check conditions for removing the entity from the client
		// (either its death animation finished, or it's out of view).
		if (e.render.status.getFade() === 0 ||
			!isInView(e.render.x - global.player._renderx, e.render.y - global.player._rendery, e.size, 1)) {
			entityMap.delete(id);
			continue;
		}

		// We apply the old "death inference" logic here.
		// The `e.health` here refers to its *last known health* from the previous packet.
		// Only change status if it's not already in a death state to avoid resetting fade.
		if (e.render.status.getCurrentState() !== "killed") {
			e.render.status.set("killed");
			// This "e.health === 1 ? 'dying' : 'killed'" was the original logic.
			// It implies: if an entity disappears and its last health was 1, it's "dying".
			// Otherwise (last health < 1, or even 0 if server sent that before stopping), it's "killed".
			// However that doesn't seem to matter
		}

	}

	entityArr.sort((a, b) => {
		let sort = a.layer - b.layer;
		if (!sort) sort = b.id - a.id; // Or a.id - b.id depending on desired tie-break
		return sort;
	});
};

// CONVERT GUI //
function convertFastGui() {
	let index = convert.reader.next(),
		indices = {
			topSpeed: index & 0x0100,
			accel: index & 0x0080,
			skills: index & 0x0040,
			statsdata: index & 0x0020,
			upgrades: index & 0x0010,
			points: index & 0x0008,
			score: index & 0x0004,
			label: index & 0x0002,
			fps: index & 0x0001
		};
	if (indices.fps) _gui._fps = convert.reader.next();
	if (indices.label) {
		_gui._type = convert.reader.next();
		_gui._color = convert.reader.next();
		_gui._playerid = convert.reader.next();
	}
	if (indices.score) _gui._skill.setScores(convert.reader.next());
	if (indices.points) _gui._points = convert.reader.next();
	if (indices.upgrades) {
		const upgrades = [];
		for (let i = 0, len = convert.reader.next(); i < len; i++) upgrades.push(convert.reader.next());

		if (upgrades.toString() !== _gui._realUpgrades.toString()) {
			_gui._realUpgrades = upgrades;
			_gui._upgrades = upgrades;
		}
	}
	if (indices.statsdata)
		for (let i = 9; i >= 0; i--) {
			_gui._skills[i].name = convert.reader.next();
			_gui._skills[i].cap = convert.reader.next();
			_gui._skills[i].softcap = convert.reader.next();
		}
	if (indices.skills) {
		let skk = parseInt(convert.reader.next(), 36).toString(16);
		skk = "0000000000".substring(skk.length) + skk;
		_gui._skills[0].amount = parseInt(skk.slice(0, 1), 16);
		_gui._skills[1].amount = parseInt(skk.slice(1, 2), 16);
		_gui._skills[2].amount = parseInt(skk.slice(2, 3), 16);
		_gui._skills[3].amount = parseInt(skk.slice(3, 4), 16);
		_gui._skills[4].amount = parseInt(skk.slice(4, 5), 16);
		_gui._skills[5].amount = parseInt(skk.slice(5, 6), 16);
		_gui._skills[6].amount = parseInt(skk.slice(6, 7), 16);
		_gui._skills[7].amount = parseInt(skk.slice(7, 8), 16);
		_gui._skills[8].amount = parseInt(skk.slice(8, 9), 16);
		_gui._skills[9].amount = parseInt(skk.slice(9, 10), 16);
	}
	if (indices.accel) _gui._accel = convert.reader.next();
	if (indices.topSpeed) _gui._topSpeed = convert.reader.next();
}

// CONVERT BROADCAST //
function convertSlowGui(data) {
	data.shift = (function () {
		let i = 0;
		return () => {
			return data[i++]
		}
	})()

	// So let's start unpacking!
	_gui._minimap._server = [];
	_gui._leaderboard._server = [];
	let minimapAllLength = data.shift();
	for (let i = 0; i < minimapAllLength; i++) {
		_gui._minimap._server.push({
			id: data.shift(),
			type: data.shift(),
			x: (data.shift() * global._gameWidth) / 255,
			y: (data.shift() * global._gameHeight) / 255,
			color: data.shift(),
			size: data.shift(),
			width: data.shift(),
			height: data.shift()
		});
	}
	let minimapTeamLength = data.shift();
	for (let i = 0; i < minimapTeamLength; i++) {
		_gui._minimap._server.push({
			id: data.shift(),
			x: (data.shift() * global._gameWidth) / 255,
			y: (data.shift() * global._gameHeight) / 255,
			color: data.shift(),
			type: 0,
			size: 0
		});
	}
	let leaderboardLength = data.shift();
	for (let i = 0; i < leaderboardLength; i++) {
		let instance = {
			id: data.shift(),
			score: data.shift(),
			index: data.shift(),
			name: data.shift(),
			color: data.shift(),
			barColor: data.shift(),
			nameColor: data.shift(),
		};
		instance.label = data.shift() || mockups.get(instance.index).label
		if (global.gamemodeAlteration !== "sbx" || data.shift() === global.party) {
			_gui._leaderboard._server.push(instance);
		}
	}
}

// SOCKET // 
let socketInit = function () {
	return async function ag(roomId) {
		let url = "ws://localhost:3001/"
		await multiplayer.joinRoom(roomId);

		let fakeWebsocket = (url, roomHost) => {
			return {
				set onmessage(v) {
					window.clientMessage = v
				},
				set onopen(v) {
					v()
				},
				send: (e) => {
					multiplayer.playerPeer.send(fasttalk.encode(e))
				}
			}
		}

		socket = fakeWebsocket(url);
		socket.binaryType = "arraybuffer";
		socket.open = 0;
		socket.controls = {
			commands: [0, 0, 0, 0, 0, 0, 0, 0],
			cache: { x: 0, y: 0, c: 0 },
			talk: function () {
				let o = 0;
				for (let i = 0; i < socket.controls.commands.length/*max 8*/; i++) if (socket.controls.commands[i]) o += Math.pow(2, i);
				let ratio = getRatio();
				let x = util._fixNumber(Math.round((global._target._x - global.player.rendershiftx) / ratio));
				let y = util._fixNumber(Math.round((global._target._y - global.player.rendershifty) / ratio));
				let c = util._fixNumber(o);
				if (socket.controls.cache.x !== x || socket.controls.cache.y !== y || socket.controls.cache.c !== c) {
					socket.controls.cache.x = x;
					socket.controls.cache.y = y;
					socket.controls.cache.c = c;
					socket.talk("C", x, y, c);
				}
			},
			reset: function () {
				socket.controls.commands = [0, 0, 0, 0, 0, 0, 0, 0];
				socket.controls.cache.x = 0;
				socket.controls.cache.y = 0;
				socket.controls.cache.c = 0;
			}
		};
		socket.talk = function (...message) {
			if (!socket.open) return 1;
			//message = Module.shuffle(message);
			global._sentPackets++
			socket.send(message);
			global._bandwidth._outbound += 1;
		};
		socket.onmessage = function (message, parent) {
			global._bandwidth._inbound += 1;
			let m = fasttalk.decode(message);
			if (m === -1) throw new Error("Malformed packet!");
			global._receivedPackets++
			let packet = m.shift();
			switch (packet) {
				case "mu": {
					mockups.pendingMockupRequests.delete(m[0])
					if (m[1].length !== 2) {
						mockups.set(m[0], JSON.parse(m[1]))
					}
				}
					break;
				case "AA": { // Achievements and statistics
					if (m[0] === -1) {
						rewardManager.unlockAchievement(m[1]);
					} else {
						rewardManager.increaseStatistic(m[0], m[1]);
						switch (m[0]) {
							case 0:
								global._killTracker++;
								if (global._killTracker === 2) rewardManager.unlockAchievement("double_kill");
								if (global._killTracker === 3) rewardManager.unlockAchievement("triple_kill");
								if (global._killTracker === 5) rewardManager.unlockAchievement("mean_lean_killing_machine");
								setTimeout(() => global._killTracker--, 3000);
								switch (rewardManager._statistics[0]) {
									case 1: return void rewardManager.unlockAchievement("woo_you_killed_someone");
									case 5: return void rewardManager.unlockAchievement("still_single_digits");
									case 10: return void rewardManager.unlockAchievement("only_ten");
									case 50: return void rewardManager.unlockAchievement("okay_that_is_something");
									case 100: return void rewardManager.unlockAchievement("got_good");
									case 250: return void rewardManager.unlockAchievement("okay_you_are_scaring_me");
									case 500: return void rewardManager.unlockAchievement("genocide");
									case 1000: return void rewardManager.unlockAchievement("genocide_ii");
								};
								break;
							case 2:
								switch (rewardManager._statistics[2]) {
									case 1: return void rewardManager.unlockAchievement("that_was_tough");
									case 4: return void rewardManager.unlockAchievement("those_things_are_insane");
									case 15: return void rewardManager.unlockAchievement("what_in_the_world_is_a_celestial");
									case 50: return void rewardManager.unlockAchievement("boss_hunter");
									case 100: return void rewardManager.unlockAchievement("bosses_fear_me");
								};
								break;
							case 3:
								switch (rewardManager._statistics[3]) {
									case 1: return void rewardManager.unlockAchievement("polynotagon");
									case 250: return void rewardManager.unlockAchievement("polygon_hater");
									case 1000: return void rewardManager.unlockAchievement("these_polygons_gotta_go");
									case 1000000: return void rewardManager.unlockAchievement("polygont");
								};
								break;
						}
					}
				};
					break;
				case "pL": {
					global.party = m[0];
				} break;
				case "gm": {
					global.gamemodeAlteration = m[0];
				} break;
				case "R": {
					window.gameStarted = true
					global._gameWidth = m[0];
					global._gameHeight = m[1];
					roomSetup = JSON.parse(m[2]);
					serverStart = JSON.parse(m[3]);
					global.searchName = m[4];
					config.roomSpeed = m[5];
					global._mapType = m[6] || 0;
					global._blackout = m[7];
					logger.info("Room data recieved! Starting game...");
					global._gameStart = true;
					global.message = "";
				}
					break;
				case "r": {
					global._gameWidth = m[0];
					global._gameHeight = m[1];
					roomSetup = JSON.parse(m[2]);
					logger.info("Room data reset!");
					global._gameStart = true;
					global.message = "";
				}
					break;
				case "c": {
					global.player.x = global.player._renderx = m[0];
					global.player.y = global.player._rendery = m[1];
					global.player._view = global.player._renderv = m[2];
				}
					break;
				case "m": {
					global.messages.push({
						text: m[0],
						status: 2,
						alpha: 0,
						time: Date.now(),
						color: m[1] || color.black
					});
				}
					break;
				case "Z": {
					logger.norm(m[0]);
				}
					break;
				case "u": {
					global.isScoping = !!m[0];
					if (global.isScoping) rewardManager.unlockAchievement("im_still_single");
					let cam = {
						time: m[1],
						x: m[2],
						y: m[3],
						FoV: m[4]
					};
					//if (cam.time > global.player._lastUpdate) { // Why is this here?
						lag.add(getNow() - cam.time);
						global.player._time = cam.time + lag.get();
						metrics._rendergap = cam.time - global.player._lastUpdate;
						if (metrics._rendergap <= 0) logger.warn("Yo some bullshit is up...");
						global.player._lastUpdate = cam.time;
						convert.reader.set(m, 5);
						convert.fastGui();
						convert.data();
						global.player._cx = lerp(global.player._cx, cam.x, config.movementSmoothing);
						global.player._cy = lerp(global.player._cy, cam.y, config.movementSmoothing);
						global.player._lastvx = global.player._vx;
						global.player._lastvy = global.player._vy;
						global.player._vx = global._died ? 0 : cam.vx;
						global.player._vy = global._died ? 0 : cam.vy;
						if (isNaN(global.player._renderx)) global.player._renderx = global.player._cx;
						if (isNaN(global.player._rendery)) global.player._rendery = global.player._cy;
						global.player._view = cam.FoV;
						if (isNaN(global.player._renderv) || global.player._renderv === 0) global.player._renderv = 2000;
						metrics._lastlag = metrics._lag;
						metrics._lastuplink = Date.now()
					//} //else logger.info("This is old data! Last given time: " + global.player._time + "; offered packet timestamp: " + cam.time + ".");
					socket.controls.talk();
					updateTimes++;
				}
					break;
				case "b": {
					convert.slowGui(m);
					//convert.begin(m);
					//convert.broadcast();
				}
					break;
				case "closeSocket":
					multiplayer.playerPeer.destroy();
					console.log("Closed socket via packet")
					break;
				case "p": {
					metrics._latency = global.time - lastPing;
					if (metrics._latency > 999) rewardManager.unlockAchievement("laaaaaag");
				}
					break;
				case "F": {
					let chatBox = document.getElementById("chatBox");
					if (chatBox) chatBox.remove();

					global.deathDate = new Date().toLocaleString();

					global._deathSplashChoice = Math.floor(Math.random() * global._deathSplash.length);
					let mockupname = (mockups.get(_gui._type).name || "").toLowerCase();
					if (!mockupname.includes("mothership") && !mockupname.includes("dominator")) {
						rewardManager.increaseStatistic(6, m[0]);
						if (rewardManager._statistics[6] >= 1_000_000) rewardManager.unlockAchievement("millionaire");
						if (rewardManager._statistics[6] >= 10_000_000) rewardManager.unlockAchievement("you_can_now_afford_a_lamborghini_veneno");
						if (rewardManager._statistics[6] >= 100_000_000) rewardManager.unlockAchievement("tax_collector");
						if (rewardManager._statistics[6] >= 1_000_000_000) rewardManager.unlockAchievement("billionaire");

						if (rewardManager._statistics[4] < m[0]) {
							if (m[0] >= 100_000) rewardManager.unlockAchievement("everybody_stars_somewhere");
							if (m[0] >= 750_000) rewardManager.unlockAchievement("250k_away");
							if (m[0] >= 1_000_000) rewardManager.unlockAchievement("one_million");
							if (m[0] >= 5_000_000) rewardManager.unlockAchievement("have_a_high_five");
							if (m[0] >= 10_000_000) rewardManager.unlockAchievement("10__9");
							rewardManager.increaseStatistic(4, m[0], true);
						}
						rewardManager.increaseStatistic(1, 1);
						switch (rewardManager._statistics[1]) {
							case 1:
								rewardManager.unlockAchievement("l_bozo");
								break;
							case 10:
								rewardManager.unlockAchievement("large_bozo_energy");
								break;
							case 50:
								rewardManager.unlockAchievement("okay_its_becoming_sad");
								break;
							case 100:
								rewardManager.unlockAchievement("it_became_sad");
								break;
						};
					}
					global.finalScore = Smoothbar(0);
					global.finalScore.set(m[0]);
					global.finalLifetime = Smoothbar(0);
					global.finalLifetime.set(m[1]);
					global.finalKills = [Smoothbar(0), Smoothbar(0), Smoothbar(0)];
					global.finalKills[0].set(m[2]);
					global.finalKills[1].set(m[3]);
					global.finalKills[2].set(m[4]);
					global.finalKillers = [];
					for (let i = 0; i < m[5]; i++) global.finalKillers.push(m[6 + i]);
					global._died = true;
					global._deathScreenState = 0
					global._diedAt = Date.now() + 3e3;
					if (mockups.get(_gui._type).name === "Basic") rewardManager.increaseStatistic(9, 1);
					if (rewardManager._statistics[9] > 49) rewardManager.unlockAchievement("there_are_other_classes_too");
				}
					break;
				case "P": {
					global._disconnectReason = m[0];
					if (m[0] === "The arena has closed. Please try again later once the server restarts.") {
						global._arenaClosed = true;
						rewardManager.unlockAchievement("the_end_of_time")
						global.closingSplash = m[1] || "";
					}
					socket.onclose({});
				}
					break;
				case "pepperspray":
					global.player.pepperspray.apply = m[0];
					global.player.pepperspray.blurMax = m[1];
					break;
				case "lsd":
					global.player.lsd = m[0];
					break;
				case "displayText": {
					global.displayTextUI.enabled = m[0];
					if (m[0]) {
						global.displayTextUI.text = m[1].toString()
						global.displayTextUI.color = m[2].toString()
					}
				}
					break;
				case "am":
					let animationsSize = m[0];
					for (let i = 1; i < animationsSize + 1; i++) {
						let animId = m[i++],
							animSize = m[i++];

						_anims[animId] = [];
						for (let j = 0; j < animSize; j++) {
							_anims[animId].push(m[i++]);
						}
					}
					break;
				case "da":
					metrics._serverCpuUsage = m[0]
					metrics._serverMemUsage = m[1]
					mockups.totalMockups = m[2]
					break;
				default:
					throw new Error("Unknown message index!" + packet);
			}
		};
		socket.onopen = function () {
			socket.open = 1;
			global.message = "Please wait while a connection attempt is being made.";
			socket.talk("k", document.getElementById("tokenInput").value || "", 0, "its local", false);
			logger.info("Token submitted to the server for validation.");
			socket.ping = function () {
				socket.talk("p");
			};
			logger.info("Socket open.");
		};
		socket.onclose = function (e) {
			socket.open = 0;
			global._disconnected = 1;
			console.log("Socket closed.", `\n
                    REASON: ${e.reason}
                    WAS_CLEAN: ${e.wasClean}
                    CODE: ${e.code}
                `);
			global.message = global._disconnectReason;
		};
		socket.onerror = function (error) {
			console.error("Socket error:", `error`);
			global.message = "A socket error occurred. Maybe check your internet connection and reload?";
		};
		return socket;
	};
}();

const makeSocket = async (arg) => { return socket = await socketInit(arg) }

export { socket, makeSocket }