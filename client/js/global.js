import { util } from "./util.js"
import { color, getColor } from "/js/colors.js";


// TODO: Move to ui
function Smoothbar(value, speed) {
	let render = value;
	return {
		set: val => value = val,
		get: () => render = lerp(render, value, speed ? speed : 0.12 ) // speed / 6
	};
	/*let sharpness = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3,
		time = Date.now(),
		display = value,
		oldvalue = value;
	return {
		set: function (val) {
			if (value !== val) {
				oldvalue = display;
				value = val;
				time = Date.now();
			}
		},
		get: function () {
			let timediff = (Date.now() - time) / 1000;
			display = timediff < speed ? oldvalue + (value - oldvalue) * Math.pow(timediff / speed, 1 / sharpness) : value;
			return display;
		}
	};*/
}
//


const global = {
	_selectedServer: 0,
	_windowSearch: {
		_server: "null",
		_lobby: "null",
		_party: "null",
	},
	mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|android|mobi/i.test(navigator.userAgent),
	guiMouse: {
		x: 0,
		y: 0
	},
	_mapType: 0,
	_killTracker: 0,
	_forceTwiggle: false,
	KEY_ESC: 27,
	KEY_ENTER: 13,
	_canvas: null,
	KEY_CHAT: 13,
	KEY_FIREFOOD: 119,
	KEY_SPLIT: 32,
	KEY_LEFT: 65,
	KEY_UP: 87,
	KEY_RIGHT: 68,
	KEY_DOWN: 83,
	KEY_LEFT_ARROW: 37,
	KEY_UP_ARROW: 38,
	KEY_RIGHT_ARROW: 39,
	KEY_DOWN_ARROW: 40,
	KEY_AUTO_SPIN: 67,
	KEY_AUTO_FIRE: 69,
	KEY_OVER_RIDE: 82,
	KEY_UPGRADE_ATK: 49,
	KEY_UPGRADE_HTL: 50,
	KEY_UPGRADE_SPD: 51,
	KEY_UPGRADE_STR: 52,
	KEY_UPGRADE_PEN: 53,
	_diedAt: 0,
	KEY_UPGRADE_DAM: 54,
	KEY_UPGRADE_RLD: 55,
	KEY_UPGRADE_MOB: 56,
	KEY_UPGRADE_RGN: 57,
	KEY_UPGRADE_SHI: 48,
	KEY_MOUSE_0: 32,
	//KEY_MOUSE_1: 86,
	KEY_MOUSE_2: 16,
	KEY_LEVEL_UP: 78,
	KEY_TESTBED: 191,
	KEY_TESTBED_FIREFOX: 111,
	KEY_TESTBED_ALT: 192,
	KEY_RESET_BASIC_TANK: 80,
	KEY_CHANGE_TO_BASIC: 85,
	KEY_SUICIDE: 75,
	KEY_MAX_STATS: 77,
	KEY_GODMODE: 186,
	KEY_GODMODE_2: 59,
	KEY_COLOR_CHANGE: 66,
	KEY_SPAWN_SHAPES: 70,
	KEY_TELEPORT: 84,
	KEY_POWER_CYCLE: 222,
	KEY_POWER_CYCLE_FIREFOX: 165,
	KEY_BAN_PLAYER: 190,
	KEY_PASSIVE_MODE: 88,
	KEY_RAINBOW: 187,
	KEY_RAINBOW_2: 61,
	KEY_DEBUG: 76,
	//KEY_CLASS_TREE: -69, //85, Disabled for now due to new mockup system
	KEY_TIER_SWITCH: 79,
	KEY_TIER_SWITCH_2: 81,
	KEY_OVERRIDE_ENTITY: 86,
	KEY_INFECT_MINION: 73,
	KEY_RESET_COLOR: 89,
	KEY_CONTROL_DOM: 72,
	KEY_TANK_JOURNEY: 220,
	KEY_KILL_WITH_MOUSE: 71,
	KEY_STEALTH: 74,
	KEY_DRAG: 90,
	DEV_KEY_1: 35,
	DEV_KEY_2: 40,
	DEV_KEY_3: 34,
	DEV_KEY_4: 37,
	DEV_KEY_5: 12,
	DEV_KEY_6: 49,
	DEV_KEY_7: 36,
	DEV_KEY_8: 38,
	DEV_KEY_9: 33,
	_screenWidth: 0,
	_screenHeight: 0,
	_gameWidth: 0,
	_gameHeight: 0,
	_gameStart: false,
	_disconnected: false,
	_died: false,
	_deathScreenState: 1, // 0 = on | 1 = off
	_loadingMockups: true,
	_debug: 1,
	_scrollX: 0,
	_realScrollX: 0,
	_disconnectReason: "The connection was lost for an unknown reason.\nPlease press F12 or ctrl+shift+i then click on the console tab and take a screenshot, then send it in the discord.",
	_disableEnter: false,
	_seeInvisible: false,
	_tipSplash: [
		"Press the E key to enable autofire.",
		"Press the C key to enable autospin.",
		"Press the R key to disable drone and auto turret AI.",
		"Hold the N key to level up.",
		"Hold the Z key to change the color of the upgrade menu.",
		"Press the U key to change back to basic",
		"Hold the M key and press a number stat to instantly max out that stat.",
		"Hold the L key to show extra debug stuff above the minimap.",
		"If you have a low frame rate, you can try enabling Low Graphics in the options menu, which removes death fade.",
		"Don't like seeing a lot of messages? Or maybe they cause you lag? Consider enabling the Disable Messages option.",
		"Don't like the rounded edges look of Arras? Try the Use Miter Edges option.",
		"Begging for beta-tester on this server is like digging your own grave.",
		"Naming yourself Trans Rights makes your name have the colors of the Transgender Pride Flag.",
		"Don't get salty just because someone kills you; it's just a game, after all.",
		"Bosses are spawned by a randomizer; they may spawn every 8 to 15 minutes.",
		"The Password is 4NAX.",
		"The Password is Silvy.",
		"The password is SkuTsu.",
		"The Password is Trans Rights.",
		"Sanctuaries are spawned by a randomizer; they may spawn every 2 to 10 minutes.",
		"Sometimes, it helps to press Ctrl+R if your UI is bugged out.",
		"The first thing you should try if the client or in-game UI is bugged out is Ctrl+R.",
		"The first thing you should try if the client or in-game UI is bugged out is Ctrl+R.", // Duplicated on purpose // Jekyll - I might just automate this at some point /shrug
		"Sanctuaries can be seen on the minimap, and will spawn a boss when killed.",
		"Hitting the enemy deals more damage than not hitting them.",
		"If you can't take a joke, press Alt+F4 for godmode.",
		"Developers are marked by their badges next to their names.",
		"Developers typically have very fancy names.",
		'Import "Secret5"...',
		'Import "Pixel Mode"...',
		'Import "delete woomy"...',
		'Import "token"...',
		'Import "randomize"...'
	],
	_deathSplash: [
		"You are dead, not big surprise.",
		"All things must come to an end eventually.",
		"That's unfortunate...",
		"Your score was not in vain.",
		"Everyone falls to death; the destroyer of worlds.",
		"Tanks for playing!",
		"Don't be mad because you died; Be happy that you got the score you did.",
		"We interrupt this program to bring you this death screen.",
		"ZZAZZ Corruption will get to this world if you won't hurry and respawn!",
		"Success is not final, failure is not fatal: it is the courage to continue that counts.",
		"Dread it. Run from it. Destiny arrives all the same.",
		"F in the chat.",
		"Going to suggest a nerf again?",
		"Here lies your grave.",
		"Game over.",
		"Don't get mad, get even.",
		"Try, try again!",
		"OOF",
		"How much wood would a woodchuck chuck?",
		"Did you really think that through?",
		"Please refrain from abusing your computer.",
		"Ouch. Just ouch.",
		"Did you get a world record score?",
		"Try another tank, maybe it'll work out.",
		"Press Alt+F4 for godmode.",
		"L",
		"Cope",
		"Seethe",
		"Mald",
		"YO WE GOT THAT IN VIDEOOOOOOOO"
	],
	_deathSplashOverride: 0,
	_deathSplashChoice: 0,
	_tankMenuColor: 0,
	_tankMenuColorReal: 100 + Math.round(Math.random() * 70),
	searchName: "Basic",
	_arenaClosed: false,
	_ratio: window.devicePixelRatio,
	_fps: 60,
	_fpsc: 0,
	_fpscap: 1000 / 60,
	_oldFpsCap: 1000 / 60,
	_bandwidth: {
		_outbound: 0,
		_inbound: 0,
		_out: 0,
		_in: 0
	},
	_sentPackets: 80085,
	_receivedPackets: 80085,
	displayTextUI: {
		enabled: false,
		text: "",
		color: "#FFFFFF"
	},
	_waterAnimation: .5,
	_waterDirection: 1,
	_target: {
		_x: 0,
		_y: 0
	},
	_screenSize: Math.min(1920, Math.max(window.innerWidth, 1280)),
	_mobileOptions: false,
	_mobileFiring: [4, false],
	_mobileChatText: "Chat",
	_standalone: window.navigator.standalone || (window.matchMedia && window.matchMedia("(display-mode: fullscreen), (display-mode: standalone), (display-mode: minimal-ui)").matches),
}
global.mobileClickables = [function () { // Toggle menu
	let clickdata = global.clickables.mobileClicks.get()
	if (!global._mobileOptions) {
		for (let i = 1; i < clickdata.length; i++) {
			clickdata[i].setActive(i <= 6 ? 1 : 0)
		}
		global._mobileOptions = true;
	} else {
		for (let i = 1; i < clickdata.length; i++) {
			clickdata[i].setActive(i >= 7 ? 1 : 0)
		}
		global._mobileOptions = false;
	}
}, function () { // Level Up
	for (let i = 0; i < 75; i++) {
		setTimeout(() => _socket.talk('L'), i * 25);
	}
}, function () { // Testbed
	_socket.talk("T", 0);
}, function () { // Override
	_socket.talk("t", 2);
}, function () { // Reset Tank
	_socket.talk("T", 2);
}, function () { // Fullscreen
	_tryFullScreen()
}, function () { // Chat
	let chatbox = document.getElementById("chatBox")
	if (!chatbox) {
		global._mobileChatText = "Chat"
		global._canvas._cv.dispatchEvent(new KeyboardEvent('keydown', {
			'keyCode': global.KEY_CHAT
		}));
	} else {
		global._mobileChatText = "Chat"
		chatbox.dispatchEvent(new KeyboardEvent('keydown', {
			'keyCode': 13
		}));
	}

}, function () { // Firing modes
	_socket.cmd.set(global._mobileFiring[0], false);
	if (global._mobileFiring[0] === 4) {
		global._mobileFiring[0] = 6
		if (global._mobileFiring[1]) _socket.cmd.set(global._mobileFiring[0], true);
		return
	}
	global._mobileFiring[0] = 4
	if (global._mobileFiring[1]) _socket.cmd.set(global._mobileFiring[0], true);
}, function () {
	_socket.talk("X");
}];


global.clickables = function () {
	let Region = function () {
		function Clickable() {
			let region = {
				_x: 0,
				_y: 0,
				_w: 0,
				_h: 0
			},
				active = 0;
			return {
				set: function (x, y, w, h) {
					region._x = x * global._ratio;
					region._y = y * global._ratio;
					region._w = w * global._ratio;
					region._h = h * global._ratio;
					active = 1;
				},
				check: function (target) {
					let dx = Math.round(target.x - region._x),
						dy = Math.round(target.y - region._y);
					return active && dx >= 0 && dy >= 0 && dx <= region._w && dy <= region._h;
				},
				setActive: function (v) {
					active = v;
				}
			};
		}
		return function (size) {
			let data = [];
			for (let i = 0; i < size; i++) data.push(Clickable());
			return {
				place: function (index, ...a) {
					if (index >= data.length) {
						logger.norm(index);
						logger.norm(data);
						throw new Error("Trying to reference a clickable outside a region!");
					}
					data[index].set(...a);
				},
				hide: function () {
					for (let r of data) r.setActive(0);
				},
				get: function () {
					return data
				},
				check: function (x) {
					return data.findIndex(function (r) {
						return r.check(x);
					});
				}
			};
		};
	}();
	return {
		stat: Region(10),
		upgrade: Region(40),
		hover: Region(1),
		skipUpgrades: Region(1),
		mobileClicks: Region(global.mobileClickables.length),
	};
}();
global.statHover = 0;
global.upgradeHover = 0;
global.messages = []
global._sendMessageToClient = (msg, c = "black") => global.messages.push({
	text: msg,
	status: 2,
	alpha: 0,
	time: Date.now(),
	color: color[c]
});
global.clearUpgrades = function () {
	_gui._upgrades = [];
};
global.canUpgrade = 0;
global.canSkill = 0;
global.message = "";
global.time = 0;

global.player = { // Why var?
	_x: 0,
	y: 0,
	_cx: 0,
	_cy: 0,
	_vx: 0,
	_vy: 0,
	_rendershiftx: 0,
	_rendershifty: 0,
	_lastvx: 0,
	_lastvy: 0,
	_renderx: 0,
	_rendery: 0,
	_renderv: 1,
	_lastx: 0,
	_lasty: 0,
	_name: "",
	_view: 1,
	_lastUpdate: 0,
	_time: 0,
	_nameColor: 0 /*"#FFFFFF"*/,
	_color: 0,
	_canSeeInvisible: 0,
	_isOutsideRoom: 0,
	// PLACEHOLDER
	_instance: {
		"interval": 0,
		"id": 0,
		"index": 0,
		"x": 0,
		"y": 0,
		"vx": 0,
		"vy": 0,
		"size": 1,
		"facing": 0,
		"twiggle": 0,
		"layer": 0,
		"color": 16,
		"health": 1,
		"shield": 1,
		"alpha": 1,
		"seeInvisible": 0,
		"nameColor": "#FFFFFF",
		"widthHeightRatio": [
			1,
			1
		],
		"drawsHealth": 2,
		"nameplate": 4,
		"invuln": 1,
		"name": "Whygena",
		"score": 0,
		"render": {
			"draws": true,
			"lastRender": 0,
			"x": 0,
			"y": 0,
			"lastx": 0,
			"lasty": 0,
			"lastvx": 0,
			"lastvy": 0,
			"lastf": 0,
			"f": 0,
			"h": 1,
			"s": 1,
			"interval": 0,
			"slip": 0,
			"status": {},
			"health": {},
			"shield": {},
			"size": 1,
		},
		"oldIndex": 0,
		"guns": {
			"length": 0
		},
		"turrets": [],
		"lasers": {
			"length": 0
		},
		"props": {
			"length": 0
		}
	},
	pepperspray: {
		apply: false,
		blurAmount: 0,
		blurMax: 0
	},
	lsd: false
}

global._canvas = new (class Canvas {
	constructor() {
		let mobile = global.mobile;
		this.mobile = mobile;
		this._directionLock = 0;
		this._reenviar = 1;
		this._directions = [];
		this._maxStats = false;
		let self = this;
		this._cv = document.getElementById("gameCanvas");
		this._cv.width = global._screenWidth;
		this._cv.height = global._screenHeight;
		if (mobile) {
			this.controlTouch = null;
			this.movementTouch = null;
			this.movementTop = false;
			this.movementBottom = false;
			this.movementLeft = false;
			this.movementRight = false;
			this.lastTap = 0;
			this._cv.addEventListener('touchstart', this._touchStart, false);
			this._cv.addEventListener('touchmove', this._touchMove, false);
			this._cv.addEventListener('touchend', this._touchEnd, false);
			this._cv.addEventListener('touchcancel', this._touchEnd, false);
		} else {
			this._cv.addEventListener('mousedown', this._mouseDown, false);
			this._cv.addEventListener('mousemove', this._gameInput, false);
			this._cv.addEventListener('mouseup', this._mouseUp, false);
		}
		this._cv.addEventListener('keydown', this._keyboardDown, false);
		this._cv.addEventListener('keyup', this._keyboardUp, false);
		this._cv.parent = self;
		this._cv.mouse = {
			x: 0,
			y: 0,
			down: false
		};
	}
	_keyboardDown(event) {
		if (!global._gameStart) return;
		if (event.location === 3) {
			let number = event.code.substring(6)
			if (global["DEV_KEY_" + number]) {
				let value = JSON.parse(localStorage.getItem("DEV_KEY_" + number))
				if (!value[0]) {
					global._sendMessageToClient(`To use DEV_KEY_${number} you must do setDevKey in the console`)
					return
				} else if (value[1]) {
					eval(value[0])(global, _socket)
				} else {
					_socket.talk("D", 5, value[0]);
				}
			}
			return
		}
		if (event.keyCode == global.KEY_UPGRADE_STR) {
			event.preventDefault()
		}
		switch (event.keyCode) {
			case global.KEY_UP_ARROW:
				_socket.cmd.set(0, 1);
				break;
			case global.KEY_DOWN_ARROW:
				_socket.cmd.set(1, 1);
				break;
			case global.KEY_LEFT_ARROW:
				_socket.cmd.set(2, 1);
				break;
			case global.KEY_RIGHT_ARROW:
				_socket.cmd.set(3, 1);
				break;
			case global.KEY_LEVEL_UP:
				_socket.talk("L");
				break;
			// Beta-tester keys
			case global.KEY_COLOR_CHANGE:
				_socket.talk("B", 0);
				break;
			case global.KEY_SPAWN_SHAPES:
				_socket.talk("B", 2);
				break;
			case global.KEY_TELEPORT:
				_socket.talk("B", 3);
				break;
			case global.KEY_POWER_CYCLE_FIREFOX:
			case global.KEY_POWER_CYCLE:
				_socket.talk("B", 4);
				break;
			case global.KEY_BAN_PLAYER:
				_socket.talk("banSocket")
				break;
			case global.KEY_KILL_WITH_MOUSE:
				_socket.talk("B", 9);
				break;
			case global.KEY_STEALTH:
				_socket.talk("B", 10);
				break;
			case global.KEY_CHAT:
				let chatBox = document.getElementById("chatBox");
				if (!chatBox & !global._died) {
					_socket.cmd.reset()
					chatBox = document.createElement("input");
					chatBox.type = "text";
					chatBox.id = "chatBox";
					chatBox.classList.add("chatBox");
					chatBox.placeholder = global.mobile ? "Press send to send" : "Press enter to send";
					chatBox.maxLength = 50;
					document.body.appendChild(chatBox);
					chatBox.focus();
					setTimeout(() => {
						chatBox.style.opacity = 1;
					}, 10);
					chatBox.addEventListener("keydown", (e) => {
						if (e.keyCode === global.KEY_CHAT) {
							let input = chatBox.value;
							removeChatBox();
							_socket.talk("cs", input.substring(0, 50));
						}
					})
					// detect lost focus
					chatBox.addEventListener("blur", () => {
						removeChatBox();
					})
				}
				function removeChatBox() {
					let chatBox = document.getElementById("chatBox");
					let game = document.getElementById("gameCanvas");
					if (chatBox) {
						chatBox.style.opacity = 0;
						setTimeout(() => {
							chatBox.remove();
						}, 200);
					}
					game.focus();
				}
				break;
		}
		if (global.canSkill) {
			let amount = this._maxStats ? 16 : 1;
			do {
				switch (event.keyCode) {
					case global.KEY_UPGRADE_ATK:
						_socket.talk("x", 0);
						break;
					case global.KEY_UPGRADE_HTL:
						_socket.talk("x", 1);
						break;
					case global.KEY_UPGRADE_SPD:
						_socket.talk("x", 2);
						break;
					case global.KEY_UPGRADE_STR:
						_socket.talk("x", 3);
						break;
					case global.KEY_UPGRADE_PEN:
						_socket.talk("x", 4);
						break;
					case global.KEY_UPGRADE_DAM:
						_socket.talk("x", 5);
						break;
					case global.KEY_UPGRADE_RLD:
						_socket.talk("x", 6);
						break;
					case global.KEY_UPGRADE_MOB:
						_socket.talk("x", 7);
						break;
					case global.KEY_UPGRADE_RGN:
						_socket.talk("x", 8);
						break;
					case global.KEY_UPGRADE_SHI:
						_socket.talk("x", 9);
						break;
				}
			} while (--amount);
		}
		if (!event.repeat) {
			switch (event.keyCode) {
				case global.KEY_ENTER:
					if (global._diedAt - Date.now() > 0 || (global._disconnected && global._gameStart)) return;
					if (global._died) {
						_displayDeathHTML(false)
						let socketOut = util._cleanString(global.playerName, 25).split('');
						for (let i = 0; i < socketOut.length; i++) socketOut[i] = socketOut[i].charCodeAt();
						_socket.talk("s", global.party || 0, socketOut.toString(), 0, getWOSocketId());
						if (config.autoUpgrade) for (let i = 0; i < 75; i++) setTimeout(() => _socket.talk('L'), i * 25);
						global._diedAt = Date.now()
						global._deathScreenState = 1
						global._died = false;
					}
					break;
				case 221:
					global.playerKey.includes("DEV") && eval(window.prompt("Local eval: "));
					break;
				case global.KEY_UP:
					_socket.cmd.set(0, 1);
					break;
				case global.KEY_DOWN:
					_socket.cmd.set(1, 1);
					break;
				case global.KEY_LEFT:
					_socket.cmd.set(2, 1);
					break;
				case global.KEY_RIGHT:
					_socket.cmd.set(3, 1);
					break;
				case global.KEY_MOUSE_0:
					_socket.cmd.set(4, 1);
					break;
				//case global.KEY_MOUSE_1:
				//  _socket.cmd.set(5, 1);
				//break;
				case global.KEY_MOUSE_2:
					_socket.cmd.set(6, 1);
					break;
				case global.KEY_AUTO_SPIN:
					_socket.talk("t", 0);
					break;
				case global.KEY_AUTO_FIRE:
					_socket.talk("t", 1);
					break;
				case global.KEY_OVER_RIDE:
					_socket.talk("t", 2);
					break;
				case global.KEY_MAX_STATS:
					this._maxStats = true;
					break;
				case global.KEY_DEBUG:
					global._debug = global._debug % 4 + 1;
					break;
				case global.KEY_DRAG:
					_socket.talk("B", 11);
					break;
				// Beta-tester keys
				case global.KEY_TESTBED:
				case global.KEY_TESTBED_FIREFOX:
				case global.KEY_TESTBED_ALT:
					_socket.talk("T", 0);
					break;
				case global.KEY_SUICIDE:
					_socket.talk("T", 1);
					break;
				case global.KEY_RESET_BASIC_TANK:
					_socket.talk("T", 2);
					break;
				case global.KEY_CHANGE_TO_BASIC:
					_socket.talk("CTB");
					break;
				case global.KEY_GODMODE:
				case global.KEY_GODMODE_2:
					_socket.talk("B", 1);
					break;
				case global.KEY_PASSIVE_MODE:
					_socket.talk("T", 4);
					break;
				case global.KEY_RAINBOW:
				case global.KEY_RAINBOW_2:
					_socket.talk("T", 5);
					break;
				case global.KEY_TIER_SWITCH:
				case global.KEY_TIER_SWITCH_2:
					_socket.talk("X");
					break;
				case global.KEY_OVERRIDE_ENTITY:
					//_socket.talk("B", 6);
					_socket.talk("B", 13);
					break;
				case global.KEY_INFECT_MINION:
					//_socket.talk("B", 6);
					_socket.talk("B", 14);
					break;
				case global.KEY_RESET_COLOR:
					_socket.talk("T", 7);
					break;
				case global.KEY_CONTROL_DOM:
					_socket.talk("l");
					break;
				case global.KEY_TANK_JOURNEY:
					_socket.talk("B", 8);
					break;
				case 17:
					_socket.talk("B", 12);
					break;
			}
		}
	}
	_keyboardUp(event) {
		if (!global._gameStart) return;
		switch (event.keyCode) {
			case global.KEY_UP_ARROW:
			case global.KEY_UP:
				_socket.cmd.set(0, 0);
				break;
			case global.KEY_DOWN_ARROW:
			case global.KEY_DOWN:
				_socket.cmd.set(1, 0);
				break;
			case global.KEY_LEFT_ARROW:
			case global.KEY_LEFT:
				_socket.cmd.set(2, 0);
				break;
			case global.KEY_RIGHT_ARROW:
			case global.KEY_RIGHT:
				_socket.cmd.set(3, 0);
				break;
			case global.KEY_MOUSE_0:
				_socket.cmd.set(4, 0);
				break;
			//case global.KEY_MOUSE_1:
			//  _socket.cmd.set(5, 0);
			//break;
			case global.KEY_MOUSE_2:
				_socket.cmd.set(6, 0);
				break;
			case global.KEY_MAX_STATS:
				this._maxStats = false;
				break;
		}
	}
	_mouseDown(mouse) {
		global.mousedown = true
		if (!global._gameStart) return;
		switch (mouse.button) {
			case 0:
				const ratio = util._getScreenRatio();
				let width = global._screenWidth / innerWidth;
				let height = global._screenHeight / innerHeight;
				this.mouse.x = mouse.clientX * global._ratio * width; //global.ratio / ratio;// / ratio;//(global.ratio * ratio);// / ratio;
				this.mouse.y = mouse.clientY * global._ratio * height; //global.ratio / ratio;// / ratio;//(global.ratio * ratio);// / ratio;
				this.mouse.down = true;
				let statIndex = global.clickables.stat.check(this.mouse);
				if (statIndex !== -1) _socket.talk("x", statIndex);
				else if (global.clickables.skipUpgrades.check(this.mouse) !== -1) global.clearUpgrades();
				else {
					let uIndex = global.clickables.upgrade.check(this.mouse);
					if (uIndex !== -1) {
						_socket.talk("U", uIndex);
					} else {
						_socket.cmd.set(4, 1);
					}
				}
				break;
			case 1:
				_socket.cmd.set(5, 1);
				break;
			case 2:
				_socket.cmd.set(6, 1);
				break;
		}
	}
	_mouseUp(mouse) {
		if (!global._gameStart) return;
		switch (mouse.button) {
			case 0:
				this.mouse.down = true;
				_socket.cmd.set(4, 0);
				break;
			case 1:
				_socket.cmd.set(5, 0);
				break;
			case 2:
				_socket.cmd.set(6, 0);
				break;
		}
	}
	_gameInput(mouse) {
		let width = global._screenWidth / innerWidth;
		let height = global._screenHeight / innerHeight;
		this.mouse.x = mouse.clientX; // / rs;
		this.mouse.y = mouse.clientY; // / rs;// / ratio;
		if (global.player._cx != null && global.player._cy != null) {
			if (global._target === undefined) {
				console.log("GLOBAL", Object.entries(global).toString())
				return;
			}
			global._target._x = (this.mouse.x - innerWidth / 2) * width; //this.parent.cv.width / 2;
			global._target._y = (this.mouse.y - innerHeight / 2) * height; //this.parent.cv.height / 2;
		}
		global.statHover = global.clickables.hover.check({
			x: mouse.clientX * global._ratio,
			y: mouse.clientY * global._ratio
		}) === 0;
		global.guiMouse = {
			x: mouse.clientX * height, // * global.ratio / ratio,//(global.ratio * ratio),
			y: mouse.clientY * width // * global.ratio / ratio//(global.ratio * ratio)
		};
	}
	_touchStart(e) {
		e.preventDefault();
		if (global._diedAt - Date.now() > 0 || (global._disconnected && global._gameStart)) return;
		if (global._died) {
			_displayDeathHTML(false)
			let socketOut = util._cleanString(global.playerName, 25).split('');
			for (let i = 0; i < socketOut.length; i++) socketOut[i] = socketOut[i].charCodeAt();
			_socket.talk("s", global.party || 0, socketOut.toString(), 0, getWOSocketId());
			if (config.autoUpgrade) {
				for (let i = 0; i < 75; i++) {
					setTimeout(() => _socket.talk('L'), i * 25);
				}
			}
			global._diedAt = Date.now()
			global._deathScreenState = 1
			global._died = false;
		}
		let width = global._screenWidth / innerWidth;
		let height = global._screenHeight / innerHeight;
		for (let touch of e.changedTouches) {
			let mpos = {
				x: touch.clientX * global._ratio * width,
				y: touch.clientY * global._ratio * height
			};
			let guiMpos = { // exactally where the mouse is, dk how the other ones manage to work but
				x: touch.clientX * width,
				y: touch.clientY * height
			}
			let id = touch.identifier;
			let statIndex = global.clickables.stat.check(mpos);
			let mobileClickIndex = global.clickables.mobileClicks.check(mpos);
			if (mobileClickIndex !== -1) global.mobileClickables[mobileClickIndex]();
			else if (statIndex !== -1) _socket.talk('x', statIndex);
			else if (global.clickables.skipUpgrades.check(mpos) !== -1) global.clearUpgrades();
			else {
				let index = global.clickables.upgrade.check(mpos)
				if (index !== -1) {
					_socket.talk("U", index);
				} else {
					mpos.x /= width;
					mpos.y /= height;
					let onLeft = mpos.x < this.parent._cv.width / 2;
					if (this.parent.movementTouch === null && onLeft) {
						this.parent.movementTouch = id;
					} else if (this.parent.controlTouch === null && !onLeft) {
						this.parent.controlTouch = id;
						global._mobileFiring[1] = true
						_socket.cmd.set(global._mobileFiring[0], true);
					}
				}
			}
		}
		this.parent._touchMove(e, false);
	}
	_touchMove(e, useParent = true) {
		const _this = useParent ? this.parent : this;
		e.preventDefault();
		for (let touch of e.changedTouches) {
			let mpos = {
				x: touch.clientX * global._ratio,
				y: touch.clientY * global._ratio
			};
			let id = touch.identifier;
			if (_this.movementTouch === id) {
				let x = mpos.x - _this._cv.width * 1 / 6;
				let y = mpos.y - _this._cv.height * 2 / 3;
				let norm = Math.sqrt(x * x + y * y);
				x /= norm;
				y /= norm;
				let amount = 0.3826834323650898; // Math.sin(Math.PI / 8)
				if ((y < -amount) !== _this.movementTop) _socket.cmd.set(0, _this.movementTop = y < -amount);
				if ((y > amount) !== _this.movementBottom) _socket.cmd.set(1, _this.movementBottom = y > amount);
				if ((x < -amount) !== _this.movementLeft) _socket.cmd.set(2, _this.movementLeft = x < -amount);
				if ((x > amount) !== _this.movementRight) _socket.cmd.set(3, _this.movementRight = x > amount);
			} else if (_this.controlTouch === id) {
				global._target._x = (mpos.x - _this._cv.width * 5 / 6) * 4;
				global._target._y = (mpos.y - _this._cv.height * 2 / 3) * 4;
			}
		}
	}
	_touchEnd(e) {
		e.preventDefault();
		for (let touch of e.changedTouches) {
			let mpos = {
				x: touch.clientX * window.devicePixelRatio,
				y: touch.clientY * window.devicePixelRatio
			};
			let id = touch.identifier;
			if (this.parent.movementTouch === id) {
				this.parent.movementTouch = null;
				if (this.parent.movementTop) _socket.cmd.set(0, this.parent.movementTop = false);
				if (this.parent.movementBottom) _socket.cmd.set(1, this.parent.movementBottom = false);
				if (this.parent.movementLeft) _socket.cmd.set(2, this.parent.movementLeft = false);
				if (this.parent.movementRight) _socket.cmd.set(3, this.parent.movementRight = false);
			} else if (this.parent.controlTouch === id) {
				this.parent.controlTouch = null;
				global._mobileFiring[1] = false
				_socket.cmd.set(4, false);
				_socket.cmd.set(6, false);
			}
		}
	}
});

export { global }