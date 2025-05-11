"use strict";
import { global } from "./global.js";
import { util, resizeEvent } from "/js/util.js"
import { logger } from "/js/debug.js"
import { loadImage, imageCache } from "/js/assets.js"
import { color, setColor, themes, specialColors, mixColors, getColor, getColorDark, getZoneColor, setColors, setColorsUnmix, setColorsUnmixB, hslToColor } from "/js/colors.js";
import { config } from "/js/config.js"
import { fasttalk } from "/js/fasttalk.js"
import { lerp, lerpAngle, expLerp, bounceyLerp } from "/js/lerp.js"
import { rewardManager } from "/js/achievements.js"
import { initSettingsMenu } from "/js/settingsMenu.js"
import { LZString } from "./LZString.js"
import { mockups, getEntityImageFromMockup } from "./mockups.js"
import { ctx, drawBar, drawGUIPolygon, drawGuiCircle, drawGuiLine, drawGuiRect, drawGuiRoundRect, drawText, measureText, _clearScreen } from "./drawing/canvas.js"
import { drawEntity } from "./drawing/drawEntity.js"
import { drawHealth } from "./drawing/drawHealth.js"

document.getElementById("specialRoomToken").value = localStorage.getItem("specialRoomToken") || ""

// HTML display on death
let displayStatus = true;
const _displayDeathHTML = function (toggle) {
    try {
        if (displayStatus === toggle) {
            return
        }
        displayStatus = toggle

        let wrapperWrapper = document.getElementById("wrapperWrapper")
        wrapperWrapper.style.justifyContent = "flex-start"

        if (toggle === true) {
            wrapperWrapper.style.zIndex = 100
            return
        }

        wrapperWrapper.style.zIndex = -100
    } catch (e) {
        console.error(e)
    }
}

// App.js
function RememberScriptingIsBannable() {
    window.didMainLoad = true

    "use strict";

    window._socket = null;

    let entities = new Map(),
        particles = [],
        upgradeSpin = 0,
        metrics = {
            _latency: 0,
            _lag: 0,
            _rendertime: 0,
            _updatetime: 0,
            _lastlag: 0,
            _lastrender: 0,
            _rendergap: 0,
            _lastuplink: 0,
            _serverCpuUsage: 0,
            _serverMemUsage: 0
        },
        lastPing = 0,
        lastServerStat = 0,
        renderTimes = 0,
        updateTimes = 0,
        roomSetup = [
            ["norm"]
        ],
        _gui = {
            _getStatNames: function (num) {
                switch (num) {
                    case 1:
                        return ["Body Damage", "Max Health", "", "", "", "", "Acceleration", "Movement Speed", "Shield Regeneration", "Shield Capacity"];
                    case 2:
                        return ["Body Damage", "Max Health", "Drone Speed", "Drone Health", "Drone Penetration", "Drone Damage", "Respawn Rate", "Movement Speed", "Shield Regeneration", "Shield Capacity"];
                    case 3:
                        return ["Body Damage", "Max Health", "Drone Speed", "Drone Health", "Drone Penetration", "Drone Damage", "Max Drone Count", "Movement Speed", "Shield Regeneration", "Shield Capacity"];
                    case 4:
                        return ["Body Damage", "Max Health", "Swarm Speed", "Swarm Health", "Swarm Penetration", "Swarm Damage", "Reload", "Movement Speed", "Shield Regeneration", "Shield Capacity"];
                    case 5:
                        return ["Body Damage", "Max Health", "Trap Speed", "Trap Health", "Trap Penetration", "Trap Damage", "Reload", "Movement Speed", "Shield Regeneration", "Shield Capacity"];
                    case 6:
                        return ["Body Damage", "Max Health", "Weapon Speed", "Weapon Health", "Weapon Penetration", "Weapon Damage", "Reload", "Movement Speed", "Shield Regeneration", "Shield Capacity"];
                    case 7:
                        return ["Body Damage", "Max Health", "Bullet Speed", "Bullet Health", "Bullet Penetration", "Bullet Damage", "Reload & Acceleration", "Movement Speed", "Shield Regeneration", "Shield Capacity"];
                    case 8:
                        return ["Body Damage", "Max Health", "Minion Speed", "Minion Health", "Minion Penetration", "Minion Damage", "Respawn Rate", "Movement Speed", "Shield Regeneration", "Shield Capacity"];
                    case 9:
                        return ["Body Damage", "Max Health", "", "", "", "", "Jump Rate", "Movement Speed", "Shield Regeneration", "Shield Capacity"];
                    case 10:
                        return ["Body Damage", "Max Health", "Block Speed", "Block Health", "Block Penetration", "Block Damage", "Reload", "Movement Speed", "Shield Regeneration", "Shield Capacity"];
                    case 11:
                        return ["Body Damage", "Max Health", "Rebound Speed", "Boomerang Health", "Boomerang Penetration", "Boomerang Damage", "Reload", "Movement Speed", "Shield Regeneration", "Shield Capacity"];
                    case 12:
                        return ["Body Damage", "Max Health", "Lance Range", "Lance Longevity", "Lance Sharpness", "Lance Damage", "Lance Density", "Movement Speed", "Shield Regeneration", "Shield Capacity"];
                    case 13:
                        return ["Body Damage", "Max Health", "Flail Speed", "Flail Resistance", "Flail Penetration", "Flail Damage", "Flail Density", "Movement Speed", "Shield Regeneration", "Shield Capacity"];
                    case 14:
                        return ["Body Damage", "Max Health", "Syringe Range", "Syringe Longevity", "Syringe Sharpness", "Syringe Damage", "Refill Time", "Movement Speed", "Shield Regeneration", "Shield Capacity"];
                    default:
                        return ["Body Damage", "Max Health", "Bullet Speed", "Bullet Health", "Bullet Penetration", "Bullet Damage", "Reload", "Movement Speed", "Shield Regeneration", "Shield Capacity"];
                }
            },
            _skills: [{
                amount: 0,
                color: "purple",
                cap: 1,
                softcap: 1
            }, {
                amount: 0,
                color: "pink",
                cap: 1,
                softcap: 1
            }, {
                amount: 0,
                color: "blue",
                cap: 1,
                softcap: 1
            }, {
                amount: 0,
                color: "lgreen",
                cap: 1,
                softcap: 1
            }, {
                amount: 0,
                color: "red",
                cap: 1,
                softcap: 1
            }, {
                amount: 0,
                color: "yellow",
                cap: 1,
                softcap: 1
            }, {
                amount: 0,
                color: "green",
                cap: 1,
                softcap: 1
            }, {
                amount: 0,
                color: "teal",
                cap: 1,
                softcap: 1
            }, {
                amount: 0,
                color: "gold",
                cap: 1,
                softcap: 1
            }, {
                amount: 0,
                color: "orange",
                cap: 1,
                softcap: 1
            }],
            _points: 0,
            _upgrades: [],
            _realUpgrades: [],
            _playerid: -1,
            _skill: function () {
                let levelScore = 0,
                    deduction = 0,
                    level = 0,
                    score = Smoothbar(0);
                return {
                    setScores: function (s) {
                        if (s) {
                            score.set(s);
                            if (deduction > score.get()) {
                                level = 0;
                                deduction = 0;
                            }
                        } else {
                            score = Smoothbar(0);
                            level = 0;
                        }
                    },
                    update: function () {
                        levelScore = Math.ceil(1.8 * Math.pow(level + 1, 1.8) - 2 * level + 0), score.get() - deduction >= levelScore && (deduction += levelScore, level += 1);
                    },
                    getProgress: function () {
                        return levelScore ? Math.min(1, Math.max(0, (score.get() - deduction) / levelScore)) : 0;
                    },
                    getScore: function () {
                        return score.get();
                    },
                    getLevel: function () {
                        return level;
                    }
                };
            }(),
            _type: 0,
            _fps: 0,
            _color: 0,
            _accel: 0,
            _topSpeed: 1,
            _minimap: {
                _display: [],
                _server: []
            },
            _leaderboard: {
                _display: [],
                _server: [],
                _publish: (old, entry) => {
                    let ref = mockups.get(entry.index);
                    let trueLabel = entry.labelOverride ? entry.labelOverride : entry.label
                    return {
                        id: entry.id,
                        image: getEntityImageFromMockup(entry.index, entry.color),
                        position: ref.position,
                        barColor: getColor(entry.barColor),
                        label: entry.name ? entry.name + " - " + (trueLabel || ref.name) : (trueLabel || ref.name),
                        score: lerp(old.score, entry.score, 0.03),
                        nameColor: entry.nameColor,
                    }
                }
            }
        };

    let getRatio = function () {
        return Math.max(global._screenWidth / global.player._renderv, global._screenHeight / global.player._renderv / 9 * 16);
    };


    window.onload = function () {
        if (window.didWindowLoad) return
        window.didWindowLoad = true

        initSettingsMenu();

        util._retrieveFromLocalStorage("playerNameInput");
        document.getElementById("startButton").onclick = function () {
            if (global._disconnected && global._gameStart) return;
            _startGame();
        };
        document.onkeydown = function (e) {
            if (global._disconnected && global._gameStart) return;
            let key = e.which || e.keyCode;
            if (!global._disableEnter && key === global.KEY_ENTER && !global._gameStart) document.getElementById("startButton").click();
        };
        window.addEventListener("resize", resizeEvent);
        resizeEvent();
    };

    function getWOSocketId() {
        if (!localStorage.getItem("socketId")) {
            localStorage.setItem("socketId", Date.now().toString(16))
        }
        return localStorage.getItem("socketId");
    }

    function isInView(x, y, r) {
        let mid = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0,
            ratio = getRatio();
        r += config.borderChunk;
        if (mid) {
            ratio *= 2;
            return x > -global._screenWidth / ratio - r && x < global._screenWidth / ratio + r && y > -global._screenHeight / ratio - r && y < global._screenHeight / ratio + r;
        }
        return x > -r && x < global._screenWidth / ratio + r && y > -r && y < global._screenHeight / ratio + r;
    }

    function Smoothbar(value, speed) {
        let render = value;
        return {
            set: val => value = val,
            get: () => render = lerp(render, value, speed ? speed : 0.12) // speed / 6
        };
    }
    let sync = [],
        clockDiff = 0,
        serverStart = 0,
        lag = function () {
            let lags = [];
            return {
                get: function () {
                    if (!lags.length) return 0;
                    let sum = lags.reduce(function (a, b) {
                        return a + b;
                    });
                    return sum / lags.length;
                },
                add: function (l) {
                    lags.push(l);
                    if (lags.length > config.memory) lags.splice(0, 1);
                }
            };
        }(),
        getNow = function () {
            return Date.now() - clockDiff - serverStart;
        },
        getRelative = function () {
            return Date.now();
        };
    let _anims = {};
    let socketInit = async function () {
        resizeEvent();
        let protocol = fasttalk,
            convert = function () {
                let get = function () {
                    let index = 0,
                        crawlData = [];
                    return {
                        next: function () {
                            if (index >= crawlData.length) {
                                logger.norm(crawlData);
                                throw new Error("Trying to crawl past the end of the provided data!");
                            } else return crawlData[index++];
                        },
                        all: () => crawlData.slice(index),
                        take: amount => {
                            index += amount;
                            if (index > crawlData.length) {
                                console.error(crawlData);
                                throw new Error("Trying to crawl past the end of the provided data!");
                            }
                        },
                        set: function (data) {
                            crawlData = data;
                            index = 0;
                        }
                    };
                }();
                return {
                    begin: function (data) {
                        return get.set(data);
                    },
                    data: function () {
                        const process = function () {
                            const GunContainer = function () {
                                function physics(g) {
                                    g.isUpdated = 1;
                                    if (g.motion || g.position) {
                                        g.motion -= .2 * g.position;
                                        g.position += g.motion;
                                        if (g.position < 0) {
                                            g.position = 0;
                                            g.motion = -g.motion;
                                        }
                                        if (g.motion > 0) g.motion *= .5;
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
                                            return a.forEach(physics);
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
                                        if (val !== state || state === "injured") {
                                            if (state !== "dying") time = getNow();
                                            state = val;
                                        }
                                    },
                                    getFade: function () {
                                        return (state === "dying" || state === "killed") ? 1 - Math.min(1, (getNow() - time) / 300) : 1;
                                    },
                                    getColor: function () {
                                        return config.tintedDamage ? mixColors(color.red, color.guiblack, 0.2) : "#FFFFFF";
                                    },
                                    getBlend: function () {
                                        let o = state === "normal" || state === "dying" ? 0 : 1 - Math.min(1, (getNow() - time) / 80);
                                        if (getNow() - time > 500 && state === "injured") state = "normal";
                                        return o;
                                    }
                                };
                            }
                            const unpacking = {
                                new: function (entity) {
                                    let isNew = entity.facing == null;
                                    const type = get.next();
                                    if (type & 0x01) {
                                        entity.facing = get.next();
                                        entity.layer = get.next();
                                    } else {
                                        entity.interval = metrics._rendergap;
                                        entity.id = get.next();
                                        let iii = entities.get(entity.id)
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
                                            entity.render.lastf = entity.facing;
                                            entity.render.lastRender = global.player._time;
                                        }
                                        const flags = get.next();
                                        entity.index = get.next();
                                        entity.x = get.next();
                                        entity.y = get.next();
                                        entity.vx = 0;//get.next();
                                        entity.vy = 0;//get.next();
                                        entity.size = get.next();
                                        entity.facing = get.next();
                                        entity.twiggle = (flags & 1);
                                        entity.layer = (flags & 2) ? get.next() : 0;
                                        entity.color = get.next();
                                        entity.team = get.next();
                                        if (isNew) {
                                            entity.health = (flags & 4) ? (get.next() / 255) : 1;
                                            entity.shield = (flags & 8) ? (get.next() / 255) : 1;
                                        } else {
                                            let hh = entity.health,
                                                ss = entity.shield;
                                            entity.health = (flags & 4) ? (get.next() / 255) : 1;
                                            entity.shield = (flags & 8) ? (get.next() / 255) : 1;
                                            if (entity.health < hh || entity.shield < ss) {
                                                entity.render.status.set("injured");
                                            } else if (entity.render.status.getFade() !== 1) {
                                                entity.render.status.set("normal");
                                            }
                                        }
                                        entity.alpha = (flags & 16) ? (get.next() / 255) : 1;
                                        entity.seeInvisible = flags & 32;
                                        entity.nameColor = flags & 64 ? get.next() : "#FFFFFF";
                                        entity.label = flags & 128 ? get.next() : mockups.get(entity.index).name
                                        entity.widthHeightRatio = [(flags & 256) ? get.next() : 1, (flags & 512) ? get.next() : 1];
                                        entity.drawsHealth = true//type & 0x02;
                                        entity.nameplate = type & 0x04;
                                        entity.invuln = (type & 0x08 ? entity.invuln || Date.now() : 0);
                                        if (type & 0x04) {
                                            entity.name = get.next();
                                            entity.score = get.next();
                                            entity.messages = get.next();
                                        }
                                        if (isNew) {
                                            entity.render = {
                                                real: true,
                                                draws: false,
                                                lastRender: global.player._time,
                                                x: entity.x,
                                                y: entity.y,
                                                lastx: entity.x - metrics._rendergap * config.roomSpeed * (1000 / 30) * entity.vx,
                                                lasty: entity.y - metrics._rendergap * config.roomSpeed * (1000 / 30) * entity.vy,
                                                lastvx: entity.vx,
                                                lastvy: entity.vy,
                                                lastf: entity.facing,
                                                f: entity.facing,
                                                h: entity.health,
                                                s: entity.shield,
                                                interval: metrics._rendergap,
                                                slip: 0,
                                                status: Status(),
                                                health: Smoothbar(entity.health),
                                                shield: Smoothbar(entity.shield),
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
                                    let gunnumb = get.next();
                                    if (isNew) {
                                        entity.guns = GunContainer(gunnumb);
                                    } else if (gunnumb !== entity.guns.length) {
                                        throw new Error("Mismatch between data gun number and remembered gun number!");
                                    }
                                    for (let i = 0; i < gunnumb; i++) {
                                        let time = get.next(),
                                            power = get.next();
                                        if (time > global.player._lastUpdate - metrics._rendergap) {
                                            entity.guns.fire(i, power);
                                        }
                                    }
                                    let turnumb = get.next();
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
                        return function () {
                            let output = [];
                            for (let i = 0, len = get.next(); i < len; i++) {
                                let e = process()
                                e.render.status.set(e.health === 1 ? "dying" : "killed")
                                output.push(e);
                            }
                            output.sort((a, b) => {
                                let sort = a.layer - b.layer;
                                if (sort === 0) sort = b.id - a.id;
                                return sort;
                            });
                            entities.clear()
                            for(let e of output) entities.set(e.id, e)
                        };
                    }(),
                    gui: function () {
                        let index = get.next(),
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
                        if (indices.fps) _gui._fps = get.next();
                        if (indices.label) {
                            _gui._type = get.next();
                            _gui._color = get.next();
                            _gui._playerid = get.next();
                        }
                        if (indices.score) _gui._skill.setScores(get.next());
                        if (indices.points) _gui._points = get.next();
                        if (indices.upgrades) {
                            const upgrades = [];
                            for (let i = 0, len = get.next(); i < len; i++) upgrades.push(get.next());

                            if (upgrades.toString() !== _gui._realUpgrades.toString()) {
                                _gui._realUpgrades = upgrades;
                                _gui._upgrades = upgrades;
                            }
                        }
                        if (indices.statsdata)
                            for (let i = 9; i >= 0; i--) {
                                _gui._skills[i].name = get.next();
                                _gui._skills[i].cap = get.next();
                                _gui._skills[i].softcap = get.next();
                            }
                        if (indices.skills) {
                            let skk = parseInt(get.next(), 36).toString(16);
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
                        if (indices.accel) _gui._accel = get.next();
                        if (indices.topSpeed) _gui._topSpeed = get.next();
                    },
                    // Broadcast for minimap and leaderboard
                    newbroadcast: data => {
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
                };
            }();

        return async function ag(roomHost) {
            let validLobbyId = false
            for (let lobbyid in window.lobbies) {
                lobbyid = window.lobbies[lobbyid].lobby_id
                if (lobbyid === global._windowSearch.lobby) {
                    validLobbyId = true
                }
            }
            if (!validLobbyId) {
                global._windowSearch.lobby = undefined
            }
            let url = await getFullURL([global._windowSearch.lobby, servers[global._selectedServer] || servers[0]], true) + `a=${_$a}&b=${_$b}&c=${_$c}&d=${_$d}&e=${_$e}`
            let connectionAttempts = 1
            window.socket = WebSocket(url, roomHost);
            global._windowSearch.lobby = window.rivetLobby
            window["help"] = function () {
                logger.info("Here is a list of commands and their usages:");
                logger.norm(" � broadcast('message')");
                logger.norm(" � setColor(colorID)");
                logger.norm(" � setSkill(amount)");
                logger.norm(" � setScore(score)");
                logger.norm(" � setSize(size)");
                logger.norm(" � setTank('exportName')");
                logger.norm(" � setDevKey(1-9 (numpad), <'exportName' or '()=>{code}>', <if code set this to true>)");
                logger.norm(" � getDevKeyData()");
                logger.norm(" � loadDevKeyData([devKeyData])");
                logger.norm(" � setStat('statName', value)");
                logger.norm(" � spawnEntity('exportName', x, y, teamID, colorID, size, score)");
                logger.norm(" � teleport(x, y)");
                logger.norm(" � setChildren(amount)");
                logger.norm(" � setInvisible(fadeInValue, fadeOutValue, limit)");
                logger.norm(" � setFOV(fov)");
                logger.norm(" � setSpinSpeed(speed)");
                logger.norm(" � setEntity('exportName, size, isMinion = false')");
                logger.norm(" � clearChildren()");
                logger.norm(" � setTeam(teamID)");
                logger.norm(" � skillSet(atk, hlt, spd, str, pen, dam, rld, rgn, shi)");
                logger.norm(" � rainbowSpeed(speed)");
                logger.norm(" � setControl(amount)");
                logger.warn("To use any of the above commands, you need to have beta-tester level 2!");
            };
            window["broadcast"] = function (message, hex) {
                if (!hex) hex = color.black;
                socket.talk("D", 0, message, hex);
                logger.info("Broadcasting your message to all players.");
            };
            window["setColor"] = function (id) {
                if (id < 0) return logger.warn("Please specify a valid color ID! Note that IDs 0-31 are colors.");
                socket.talk("D", 1, id);
                logger.info("Set your color ID to " + id + ".");
            };
            window["setSkill"] = function (amount) {
                if (isNaN(amount) || amount < 0) return logger.warn("Please specify a valid amount of stats! Note that the amount can't be below 0 or above 90.");
                socket.talk("D", 2, amount);
                logger.info("Set your amount of skill points to " + amount + ".");
            };
            window["setScore"] = function (score) {
                if (isNaN(score)) return logger.warn("Please specify a valid score!");
                socket.talk("D", 3, score);
                logger.info("Set your score to " + score + ".");
            };
            window["setSize"] = function (size) {
                if (isNaN(size) || size < 0 || size > 3000) return logger.warn("Please specify a valid size value!");
                socket.talk("D", 4, size);
                logger.info("Set your size to " + size + ".");
            };
            window["setTank"] = function (tank) {
                if (!tank) return logger.warn("Please specify a valid tank!");
                socket.talk("D", 5, tank);
                logger.info("Set your tank to " + tank + ".");
            };
            window["setDevKey"] = function (num, tank, isCode) {
                if (num < 1 || num > 9) return logger.warn("Please specify a valid dev key (1-9)")
                if (!tank) return logger.warn("Please specify a valid tank or valid code");
                localStorage.setItem(`DEV_KEY_${num}`, JSON.stringify([tank, isCode]))
                logger.info(`Set DEV_KEY_${num}. Use numpad${num} to change to that tank or run that code.`)
            }
            window["getDevKeyData"] = function () {
                let arr = [null]
                for (let i = 1; i < 10; i++) {
                    arr[i] = JSON.stringify(localStorage.getItem(`DEV_KEY_${i}`) || null)
                }
                console.log(JSON.stringify(arr))
                logger.info("Copy that text and use it in loadDevKeyData. loadDevKeyData only accepts arrays.")
            }
            window["loadDevKeyData"] = function (arr = "") {
                if (typeof arr === "string" || !arr.length) {
                    logger.warn("Provided value must be an array")
                    return
                }
                if (arr.length !== 10) {
                    logger.warn("Provided value must be of length 10")
                    return
                }
                for (let i = 1; i < 10; i++) {
                    arr[i] = JSON.parse(arr[i])
                    if (!arr[i]) continue;
                    localStorage.setItem(`DEV_KEY_${i}`, arr[i])
                }
                logger.info("Loaded dev key data!")
            }
            window["setStat"] = function (stat, value) {
                if (stat !== "weapon_speed" && stat !== "weapon_reload" && stat !== "move_speed" && stat !== "max_health" && stat !== "body_damage" && stat !== "weapon_damage" && stat !== "names") return logger.warn("Invalid stat name! Input setStat('names') for a list of stats.");
                if (stat == "names") return logger.info("Stat Names: weapon_speed, weapon_reload, move_speed, max_health, body_damage, weapon_damage."), value = 0;
                if (isNaN(value) || (stat == "weapon_reload" && value <= 0)) return logger.warn("Please specify a valid value for this stat!");
                socket.talk("D", 6, stat, value);
                logger.info("Set " + stat + " to " + value + ".");
            };
            window["spawnEntity"] = function (entity, x, y, team, color, size, value) {
                if (!entity || !isNaN(entity)) return logger.warn("Please specify a valid entity!");
                if (!x || !y || (isNaN(x) && x !== "me" || isNaN(y) && y !== "me")) return logger.warn("Please specify a valid (X,Y) position!");
                if (!team || (isNaN(team) && team !== "me")) return logger.warn("Please specify a valid team!");
                if (color < 0 || (isNaN(color) && color !== "rainbow" && color !== "default")) return logger.warn("Please specify a valid color ID!");
                socket.talk("D", 7, entity, x, y, team, color, size, value);
                logger.info("Spawned " + entity + " at (" + x + ", " + y + ") with the team ID " + team + ", a color ID of " + color + ", a size of " + size + ", and a value of " + value);
            };
            window["setChildren"] = function (amount) {
                if (!amount || amount < 0 || isNaN(amount)) return logger.warn("Please specify a valid maxChildren value!");
                socket.talk("D", 8, amount);
                logger.info("Set your maxChildren to " + amount + ".");
            };
            window["teleport"] = function (x, y) {
                if (isNaN(x) || isNaN(x)) return logger.warn("Please specify a valid (X, Y) position!");
                socket.talk("D", 9, x, y);
                logger.info("Teleported to (" + x + ", " + y + ").");
            };
            window["setInvisible"] = function (fadeOut, fadeIn, maxFade) {
                let valueCheck = function (value) {
                    return value > 1 || value < 0 || isNaN(value);
                };
                if (valueCheck(fadeOut) || valueCheck(fadeIn) || valueCheck(maxFade)) return logger.warn("Please specify a valid invisibility alpha value!");
                socket.talk("D", 10, fadeOut, fadeIn, maxFade);
                logger.info("Set your invisible attribute to [" + fadeOut + ", " + fadeIn + ", " + maxFade + "].");
            };
            window["setFOV"] = function (fov) {
                if (!fov || fov < 0 || fov > 500 || isNaN(fov)) return logger.warn("Please specify a valid FoV value!");
                socket.talk("D", 11, fov);
                logger.info("Set your FoV to " + fov + ".");
            };
            window["setSpinSpeed"] = function (speed) {
                if (!speed || isNaN(speed)) return logger.warn("Please specify a valid speed value!");
                socket.talk("D", 12, speed);
                logger.info("Set your autospin speed to " + speed + ".");
            };
            window["setEntity"] = function (entity, size = 0, isMinion = false) {
                if (!entity || !isNaN(entity)) return logger.warn("Please specify a valid entity!");
                if (isNaN(size)) return logger.warn("Please specify a valid size, or do not provide one at all.");
                socket.talk("D", 13, entity, size, isMinion);
                logger.info("Set the F key entity to " + entity + ".");
            };
            window["clearChildren"] = function () {
                socket.talk("D", 14);
                logger.info("Cleared all children entities.");
            };
            window["setTeam"] = function (teamID) {
                if (isNaN(teamID)) return logger.warn("Please specify a valid team ID!");
                socket.talk("D", 15, teamID);
                logger.info("Set your team ID to " + teamID + ".");
            };
            window["skillSet"] = function (s1, s2, s3, s4, s5, s6, s7, s8, s9, s10) { // Simplify?
                let s = function (skill) {
                    return skill < 0 || isNaN(skill);
                };
                if (s(s1) || s(s2) || s(s3) || s(s4) || s(s5) || s(s6) || s(s7) || s(s8) || s(s9) || s(s10)) return logger.warn("Please specify a valid skill-set array!");
                socket.talk("D", 17, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10);
                logger.info("Changed your skill-set to [" + s1 + ", " + s2 + ", " + s3 + ", " + s4 + ", " + s5 + ", " + s6 + ", " + s7 + ", " + s8 + ", " + s9 + ", " + s10 + "].");
            };
            window["rainbowSpeed"] = function (speed) {
                if (isNaN(speed)) return logger.warn("Please specify a valid rainbow speed value!");
                socket.talk("D", 18, speed);
                logger.info("Set your rainbow color change speed to " + speed + ".");
            };
            window["setControl"] = function (amount) {
                if (isNaN(amount) || amount < 0) return logger.warn("Please specify a valid amount of entities to control!");
                socket.talk("D", 19, amount);
            };
            window["addController"] = function (ioType) {
                socket.talk("D", 20, ioType);
            }
            window["removeController"] = function (ioType) {
                socket.talk("D", 21, ioType);
            }
            window["clearControllers"] = function () {
                socket.talk("D", 22);
            }
            socket.binaryType = "arraybuffer";
            socket.open = 0;
            socket.cmd = function () {
                let flag = 0,
                    commands = [0, 0, 0, 0, 0, 0, 0, 0],
                    cache = {
                        _x: 0,
                        _y: 0,
                        _c: 0
                    };
                return {
                    set: function (index, value) {
                        if (commands[index] !== value) {
                            commands[index] = value;
                            flag = 1;
                        }
                    },
                    talk: function () {
                        flag = 0;
                        let o = 0;
                        for (let i = 0; i < 8; i++) if (commands[i]) o += Math.pow(2, i);
                        let ratio = getRatio();
                        let x = util._fixNumber(Math.round((global._target._x - global.player._rendershiftx) / ratio));
                        let y = util._fixNumber(Math.round((global._target._y - global.player._rendershifty) / ratio));
                        let c = util._fixNumber(o);
                        if (cache._x !== x || cache._y !== y || cache._c !== c) {
                            cache._x = x;
                            cache._y = y;
                            cache._c = c;
                            socket.talk("C", x, y, c);
                        }

                    },
                    check: function () {
                        return flag;
                    },
                    reset: function () {
                        commands = [0, 0, 0, 0, 0, 0, 0, 0],
                            cache = {
                                _x: 0,
                                _y: 0,
                                _c: 0
                            }
                    }
                };
            }();
            socket.talk = function (...message) {
                if (!socket.open) return 1;
                //message = Module.shuffle(message);
                global._sentPackets++
                socket.send(message);
                global._bandwidth._outbound += 1;
            };
            socket.onmessage = function (message, parent) {
                global._bandwidth._inbound += 1;
                //message = Module.shuffle(Array.from(new Uint8Array(message.data)));
                let m = (message);
                if (m === -1) throw new Error("Malformed packet!");
                global._receivedPackets++
                let packet = m.splice(0, 1)[0];
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
                    case "w": {
                        if (m[0] && !global.firstSpawn) {
                            _displayDeathHTML(false)
                            global.firstSpawn = true;
                            logger.info("The server has welcomed us to the game room! Sending spawn request.");
                            let socketOut = util._cleanString(global.playerName, 25).split('');
                            for (let i = 0; i < socketOut.length; i++) socketOut[i] = socketOut[i].charCodeAt();
                            socket.talk("s", global.party || 0, socketOut.toString(), 1, getWOSocketId());
                            if (config.autoUpgrade) for (let i = 0; i < 75; i++) setTimeout(() => _socket.talk('L'), i * 25);
                        }
                    }
                        break;
                    case "pL": {
                        global.party = m[0];
                        global._windowSearch.party = m[0]
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
                        global.player._x = global.player._renderx = m[0];
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
                        global.isScoping = !!m.shift();
                        if (global.isScoping) rewardManager.unlockAchievement("im_still_single");
                        let cam = {
                            time: m[0],
                            x: m[1],
                            y: m[2],
                            FoV: m[3]
                        },
                            playerData = m.slice(4);
                        if (cam.time > global.player._lastUpdate) {
                            lag.add(getNow() - cam.time);
                            global.player._time = cam.time + lag.get();
                            metrics._rendergap = cam.time - global.player._lastUpdate;
                            if (metrics._rendergap <= 0) logger.warn("Yo some bullshit is up...");
                            global.player._lastUpdate = cam.time;
                            convert.begin(playerData);
                            convert.gui();
                            convert.data();
                            global.player._lastx = global.player._cx;
                            global.player._lasty = global.player.yc;
                            global.player._cx = cam.x;
                            global.player._cy = cam.y;
                            global.player._lastvx = global.player._vx;
                            global.player._lastvy = global.player._vy;
                            global.player._vx = global._died ? 0 : cam.vx;
                            global.player._vy = global._died ? 0 : cam.vy;
                            if (isNaN(global.player._renderx)) global.player._renderx = global.player._cx;
                            if (isNaN(global.player._rendery)) global.player._rendery = global.player._cy;
                            global.player._view = cam.FoV;
                            if (isNaN(global.player._renderv) || global.player._renderv === 0) global.player._renderv = 2000;
                            metrics._lastlag = metrics._lag;
                            metrics._lastuplink = getRelative();
                        } //else logger.info("This is old data! Last given time: " + global.player._time + "; offered packet timestamp: " + cam.time + ".");
                        socket.cmd.talk();
                        updateTimes++;
                    }
                        break;
                    case "b": {
                        convert.newbroadcast(m);
                        //convert.begin(m);
                        //convert.broadcast();
                    }
                        break;
                    case "closeSocket":
                        window.roomManager.close()
                        break;
                    case "p": {
                        window.Date
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
                        window.onbeforeunload = function () {
                            return 0;
                        };
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
                socket._clientIdentification = Math.random().toString(16).substr(2, 9) + Date.now();
                localStorage.setItem("_0xFFaB87", socket._clientIdentification);
                window.onstorage = function (event) {
                    if (event.key === "_0xFFaB87") {
                        socket.talk("N", event.newValue);
                    }
                }
                socket.talk("k", localStorage.getItem("discordCode") || "", socket._clientIdentification, isLocal ? "its local" : window.rivetPlayerToken, false);
                logger.info("Token submitted to the server for validation.");
                socket.ping = function () {
                    socket.talk("p");
                };
                // socket.commandCycle = setInterval(function () {
                //     if (socket.cmd.check()) socket.cmd.talk();
                // });
                logger.info("Socket open.");
            };
            socket.onclose = function (e) {
                socket.open = 0;
                global._disconnected = 1;
                // clearInterval(socket.commandCycle);
                window.onbeforeunload = function () {
                    return 0;
                };

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

    async function _tryFullScreen() {
        if (document.body.requestFullScreen)
            document.body.requestFullScreen();
        else if (document.body.webkitRequestFullScreen)
            document.body.webkitRequestFullScreen();
        else if (document.body.mozRequestFullScreen)
            document.body.mozRequestFullScreen();
    }

    async function _startGame() {
        if (!window.connectedToWRM) return;
        const specialRoomToken = document.getElementById("specialRoomToken").value
        document.getElementById("specialRoomToken").remove()
        if (window.creatingRoom === true) {
            window.loadingTextStatus = "Downloading server..."
            window.loadingTextTooltip = ""
            window.connectSocketToServer = async function () {
                // WRM, roomCreate
                window.roomManager.send(window.addMetaData(1, 3, fasttalk.encode([/*TODO: reimplement selection*/"", specialRoomToken])))
                localStorage.setItem("specialRoomToken", specialRoomToken)
                _socket = await (await socketInit)(true)
                console.log(_socket)
            }
            window.serverWorker = new Worker("./server.js");
            window.serverWorkerSetup()
            document.getElementById("entityEditor").style.display = "block" // enable editor for host
        } else {
            window.loadingTextStatus = "Joining server..."
            window.loadingTextTooltip = ""
            window.onRoomJoined = async () => {
                _socket = await (await socketInit)()
            }
            window.roomManager.send(window.addMetaData(1, 4, fasttalk.encode([window.selectedRoomId])))
        }
        document.getElementsByClassName("background")[0].remove();
        let playerNameInput = document.getElementById("playerNameInput");
        util._submitToLocalStorage("playerNameInput");
        global.playerName = global.player._name = playerNameInput.value.trim();
        global.cleanPlayerName = util._cleanString(global.playerName, 25)
        setTimeout(() => {
            if (global.playerName === "") rewardManager.unlockAchievement("anonymous");
        }, 5000);
        if (document.getElementById("mainMenu")) {
            document.getElementById("mainMenu").remove();
        } else {
            document.getElementById("startMenuWrapper").remove();
        };
        if (document.getElementById("signInDiv")) document.getElementById("signInDiv").remove()
        _displayDeathHTML(false)
        if (!global.animLoopHandle) _animloop();
        //clearInterval(global.screenScale);
        //global.functionSociety.push([`${_socket}`, canvas, "socket"]);
        document.getElementById("gameCanvas").focus();
        if (global.mobile) {
            _tryFullScreen()
            if (navigator.b || window.matchMedia && window.matchMedia("(display-mode: fullscreen), (display-mode: standalone), (display-mode: minimal-ui)").matches) {
                global.messages.push({
                    text: "Thank you for adding the Woomy-Arras.io app!",
                    status: 2,
                    alpha: 0,
                    time: Date.now() + 3000
                });
            } else {
                global.messages.push({
                    text: "Add the Woomy-Arras.io app by bookmarking the site to the homescreen!",
                    status: 2,
                    alpha: 0,
                    time: Date.now() + 3000
                });
            }
        }
        window.onbeforeunload = function () {
            return 1;
        };
    }

    window.requestAnimFrame = function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame
    }();
    window.cancelAnimFrame = function () {
        return window.cancelAnimationFrame || window.mozCancelAnimationFrame;
    }();
    let gameDraw = function () {
        let upgradeBarSpeed = 0.4;
        let statMenu = Smoothbar(0, 0.075),
            upgradeMenu = Smoothbar(0, 0.25),
            statBars = [Smoothbar(0, upgradeBarSpeed), Smoothbar(0, upgradeBarSpeed), Smoothbar(0, upgradeBarSpeed), Smoothbar(0, upgradeBarSpeed), Smoothbar(0, upgradeBarSpeed), Smoothbar(0, upgradeBarSpeed), Smoothbar(0, upgradeBarSpeed), Smoothbar(0, upgradeBarSpeed), Smoothbar(0, upgradeBarSpeed), Smoothbar(0, upgradeBarSpeed), Smoothbar(0, upgradeBarSpeed)]

        let compensation = function () {
            return function () {
                let strength = metrics._rendergap / (1000 / 30);
                return {
                    predict: (p1, p2, v1, v2) => lerp(p1 + v1, p2 + v2, .075, 1),
                    predictFacing: (a1, a2) => lerpAngle(a1, a2, .1, 1),
                    predictExtrapolate: (p1, p2, v1, v2) => lerp(p1 + v1, p2 + v2, .075, 1),
                    predictFacingExtrapolate: (a1, a2) => lerpAngle(a1, a2, .12, 1),
                    getPrediction: () => strength
                }
            };
        }();

        let ska = function () {
            function make(x) {
                return Math.log(4 * x + 1) / Math.log(5);
            }
            let a = [];
            for (let i = 0; i < config.expectedMaxSkillLevel * 2; i++) a.push(make(i / config.expectedMaxSkillLevel));
            return function (x) {
                return a[x];
            };
        }();
        function drawMobileButton(i, x, y, w, h, text) {
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.translate(x, y);
            ctx.fillStyle = getColor(i ? 7 : 11);
            ctx.fillRect(0, 0, w, h);
            ctx.globalAlpha = .1;
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, h / 2, w, h / 2);
            ctx.globalAlpha = .4;
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(0, 0, w, h);
            ctx.globalAlpha = 1;
            drawText(text, w / 2, h / 2, 14, color.guiwhite, "center", true);
            global.clickables.mobileClicks.place(i, x, y, w, h);
            ctx.restore();
        }
        return function (ratio) {
            renderTimes++;
            let px,
                py; {
                let motion = compensation();
                global.player._renderx = motion.predict(global.player._renderx, global.player._cx, 0, 0);
                global.player._rendery = motion.predict(global.player._rendery, global.player._cy, 0, 0);
                px = ratio * global.player._renderx;
                py = ratio * global.player._rendery;
            } {
                ctx.clearRect(0, 0, global._screenWidth, global._screenHeight);
                _clearScreen(mixColors(color.white, color.guiblack, 0.15), 1);
                ctx.globalAlpha = 1;
                const TAU = Math.PI * 2;
                if (global._mapType !== 1) {
                    let W = roomSetup[0].length,
                        H = roomSetup.length,
                        i = 0;
                    ctx.globalAlpha = 1;
                    for (let j = 0; j < roomSetup.length; j++) {
                        let row = roomSetup[j],
                            k = 0;
                        for (let l = 0; l < row.length; l++) {
                            let cell = row[l],
                                left = Math.max(0, ratio * k * global._gameWidth / W - px + global._screenWidth / 2),
                                top = Math.max(0, ratio * i * global._gameHeight / H - py + global._screenHeight / 2),
                                right = Math.min(global._screenWidth, ratio * (k + 1) * global._gameWidth / W - px + global._screenWidth / 2),
                                bottom = Math.min(global._screenHeight, ratio * (i + 1) * global._gameHeight / H - py + global._screenHeight / 2);
                            k++;
                            if (cell === "edge") continue;
                            ctx.fillStyle = mixColors(color.white, getZoneColor(cell, 1), 0.3, 0);
                            ctx.fillRect(left - 1, top - 1, right - left + 2, bottom - top + 2);
                        }
                        i++;
                    }
                } else if (global._mapType === 1) {
                    const xx = -px + global._screenWidth / 2 + ratio * global._gameWidth / 2;
                    const yy = -py + global._screenHeight / 2 + ratio * global._gameHeight / 2;
                    const radius = ratio * global._gameWidth / 2;
                    ctx.fillStyle = color.white;
                    ctx.globalAlpha = 1;
                    ctx.beginPath();
                    ctx.arc(xx, yy, radius, 0, TAU);
                    ctx.closePath();
                    ctx.fill();
                }
                ctx.lineWidth = 1;
                ctx.strokeStyle = color.guiblack;
                ctx.globalAlpha = 0.05;
                let gridsize = 30 * ratio;//(Math.min(global._gameWidth, global._gameHeight) / roomSetup.length / 14 * ratio);
                for (let x = (global._screenWidth / 2 - px) % gridsize; x < global._screenWidth; x += gridsize) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, global._screenHeight | 0);
                    ctx.stroke();
                }


                for (let y = (global._screenHeight / 2 - py) % gridsize; y < global._screenHeight; y += gridsize) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(global._screenWidth, y);
                    ctx.stroke();
                };

                ctx.globalAlpha = 1;

                ctx.fillStyle = color.red;

            } {
                let frameplate = [];
                ctx.translate(global._screenWidth / 2, global._screenHeight / 2);
                for (let [_, v] of entities) {
                    let instance = v
                    if (!instance.render.draws) continue;
                    let motion = compensation();
                    let isMe = instance.id === _gui._playerid;
                    instance.render.x = motion.predict(instance.render.x, Math.round(instance.x + instance.vx), 0, 0);
                    instance.render.y = motion.predict(instance.render.y, Math.round(instance.y + instance.vy), 0, 0);

                    let x = ratio * instance.render.x - px,
                        y = ratio * instance.render.y - py;
                    if (isMe) {
                        global.player._x = x;
                        global.player.y = y;
                        global.player._rendershiftx = x
                        global.player._rendershifty = y
                        global.player.team = instance.team;
                        // Ok                        // Set facing
                        instance.render.f = (!instance.twiggle && !global._died && !global._forceTwiggle) ? Math.atan2(global._target._y - y, global._target._x - x) : motion.predictFacing(instance.render.f, instance.facing);
                        // Save information about the player
                        global.player._nameColor = instance.nameColor
                        //console.log(mockups[instance.index])
                        global.player._name = instance.name == null ? mockups.get(instance.index).name : instance.name;
                        global.player._label = instance.label
                        global.player._canSeeInvisible = instance.seeInvisible;
                        if (instance.alpha < 0.1) rewardManager.unlockAchievement("sneak_100");
                    } else {
                        instance.render.f = motion.predictFacing(instance.render.f, instance.facing);
                    };

                    ctx.globalAlpha = 1;
                    instance.render.size = config.lerpSize ? lerp(instance.render.size, instance.size, 0.3) : instance.size;
                    // Empty bars
                    if (instance.render.status.getFade() !== 1) {
                        instance.render.health.set(0);
                        instance.render.shield.set(0);
                    }
                    drawEntity(x, y, instance, ratio, global.player._canSeeInvisible ? instance.alpha + .5 : instance.alpha, 1.1, instance.render.f);
                    if ((instance.nameplate || instance.drawsHealth) && !config.screenshotMode) frameplate.push([x, y, instance, ratio, global.player._canSeeInvisible ? instance.alpha + .5 : instance.alpha]);
                    ctx.globalAlpha = 1;
                };
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                for (let i = 0; i < frameplate.length; i++) {
                    drawHealth(...frameplate[i]);
                    ctx.globalAlpha = 1;
                };
                if (global._blackout) {
                    //overlay
                    const darknessCanvas = document.createElement('canvas');
                    darknessCanvas.width = global._screenWidth;
                    darknessCanvas.height = global._screenWidth;
                    const darknessCtx = darknessCanvas.getContext('2d');
                    if (global.player._canSeeInvisible) {
                        darknessCtx.globalAlpha = .9
                    }
                    darknessCtx.fillStyle = "black";
                    darknessCtx.fillRect(0, 0, darknessCanvas.width, darknessCanvas.height);
                    darknessCtx.globalAlpha = 1;
                    darknessCtx.globalCompositeOperation = "destination-out";
                    darknessCtx.translate(global._screenWidth / 2, global._screenHeight / 2);
                    for (let [_, v] of entities) {
                        let instance = v
                        x = ratio * instance.render.x - px,
                            y = ratio * instance.render.y - py,
                            size = ((Math.min(15 + instance.size * 12, instance.size + 200)) * instance.render.status.getFade()) * ratio

                        // auras
                        let mockup = mockups.get(instance.index)
                        for (let prop of mockup.props) {
                            if (prop.isAura) {
                                let size = Math.round(instance.size / mockup.size * mockup.realSize * prop.size)
                                let fillGradiant = darknessCtx.createRadialGradient(
                                    prop.x + x, prop.y + y, 0,
                                    prop.x + x, prop.y + y, size
                                );
                                fillGradiant.addColorStop(0, `rgba(0, 0, 0, 1`);
                                fillGradiant.addColorStop(1, `rgba(0, 0, 0, 0)`);
                                darknessCtx.fillStyle = fillGradiant;
                                darknessCtx.beginPath();
                                darknessCtx.arc(prop.x + x, prop.y + y, size, 0, Math.PI * 2);
                                darknessCtx.fill();
                            }
                        }

                        // entities
                        if (instance.team !== global.player.team) continue;
                        let gradient = darknessCtx.createRadialGradient(
                            x, y, 0,
                            x, y, size
                        );
                        gradient.addColorStop(0, `rgba(0, 0, 0, ${Math.min(1, instance.size / 20)}`);
                        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                        darknessCtx.fillStyle = gradient;
                        darknessCtx.beginPath();
                        darknessCtx.arc(x, y, size, 0, Math.PI * 2);
                        darknessCtx.fill();

                        // if player scoping
                        if (instance.id === _gui._playerid && global.isScoping) {
                            x = 0
                            y = 0
                            gradient = darknessCtx.createRadialGradient(
                                x, y, 0,
                                x, y, size
                            );
                            gradient.addColorStop(0, `rgba(0, 0, 0, ${Math.min(1, instance.size / 20)}`);
                            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                            darknessCtx.fillStyle = gradient;
                            darknessCtx.beginPath();
                            darknessCtx.arc(x, y, size, 0, Math.PI * 2);
                            darknessCtx.fill();
                        }
                    }
                    ctx.translate(global._screenWidth / -2, global._screenHeight / -2);
                    ctx.globalAlpha = 1;
                    ctx.drawImage(darknessCanvas, 0, 0);
                    ctx.translate(global._screenWidth / 2, global._screenHeight / 2);
                    darknessCanvas.remove()
                }
            }
            ctx.translate(global._screenWidth / -2, global._screenHeight / -2);
            ratio = util._getScreenRatio();
            let scaleScreenRatio = (by, unset) => {
                global._screenWidth /= by;
                global._screenHeight /= by;
                ctx.scale(by, by);
                if (!unset) ratio *= by;
            };
            scaleScreenRatio(ratio, true);
            // Draw GUI
            let alcoveSize = 200 / ratio; // / drawRatio * global.screenWidth;
            let spacing = 20;

            if (!config.screenshotMode) {
                if (global.mobile) scaleScreenRatio(ratio, true);
                _gui._skill.update();
                if (global.mobile) scaleScreenRatio(1.4);

                if (global.mobile) scaleScreenRatio(1 / 1.4);
                {
                    if (!global.mobile) {
                        global.canSkill = !!_gui._points && _gui._skills.some(skill => skill.amount < skill.cap);
                        let active = (global.canSkill || global._died || global.statHover)
                        statMenu.set(0 + active);
                        global.clickables.stat.hide();
                        let spacing = 4,
                            height = 15,
                            gap = 35,
                            len = alcoveSize,
                            savedLen = len,
                            save = len * statMenu.get(),
                            ticker = 11,
                            namedata = _gui._getStatNames(mockups.get(_gui._type).statnames || -1);
                        let y = global._screenHeight - 20 - height
                        let x = -20 - 2 * len + statMenu.get() * (2 * 20 + 2 * len)
                        _gui._skills.forEach(function drawSkillBar(skill) {
                            ticker--;
                            let name = namedata[ticker - 1],
                                level = skill.amount,
                                col = color[skill.color],
                                cap = skill.softcap,
                                maxLevel = skill.cap;
                            statBars[ticker - 1].set(ska(level))
                            if (cap) {
                                len = save;
                                let _max = config.expectedMaxSkillLevel,
                                    extension = cap > _max,
                                    blocking = cap < maxLevel;
                                if (extension) _max = cap;
                                drawBar(x + height / 2, x - height / 2 + len * ska(cap), y + height / 2, height - 3 + config.barChunk, color.black);
                                drawBar(x + height / 2, x + height / 2 + (len - gap) * ska(cap), y + height / 2, height - 3, color.grey);
                                drawBar(x + height / 2, x + height / 2 + ((len - gap) * statBars[ticker - 1].get()), y + height / 2, height - 3.5, col);
                                if (blocking) {
                                    ctx.lineWidth = 1;
                                    ctx.strokeStyle = color.grey;
                                    for (let i = cap + 1; i < _max; i++) drawGuiLine(x + (len - gap) * ska(i), y + 1.5, x + (len - gap) * ska(i), y - 3 + height);
                                }
                                ctx.strokeStyle = color.black;
                                ctx.lineWidth = 1;
                                for (let i = 1; i < level + 1; i++) drawGuiLine(x + (len - gap) * ska(i), y + 1.5, x + (len - gap) * ska(i), y - 3 + height);
                                len = save * ska(_max);
                                let textcolor = level == maxLevel ? col : !_gui._points || cap !== maxLevel && level == cap ? color.grey : color.guiwhite;
                                drawText(name, Math.round(x + len / 2) + .5, y + height / 2, height - 5, textcolor, "center", 1);
                                drawText("[" + ticker % 10 + "]", Math.round(x + len - height * .25) - 1.5, y + height / 2, height - 5, textcolor, "right", 1);
                                if (textcolor === color.guiwhite) global.clickables.stat.place(ticker - 1, x, y, len, height);
                                if (level) drawText(textcolor === col ? "MAX" : "+" + level, Math.round(x + len + 4) + .5, y + height / 2, height - 5, col, "left", 1);
                                y -= height + spacing;
                            }
                        });
                        global.clickables.hover.place(0, 0, y, .8 * savedLen, .8 * (global._screenHeight - y));
                        if (_gui._points !== 0) drawText("x" + _gui._points, Math.round(x + len - 2) + .5, Math.round(y + height - 4) + .5, 20, color.guiwhite, "right");
                    }
                    {
                        let spacing = 4,
                            len = 1.65 * alcoveSize,
                            height = 25,
                            x = (global._screenWidth - len) / 2,
                            y = global._screenHeight - 20 - height,
                            max = _gui._leaderboard._display.length ? _gui._leaderboard._display[0].score : false,
                            level = _gui._skill.getLevel();
                        ctx.lineWidth = 1;
                        drawBar(x, x + len, y + height / 2, height - 3 + config.barChunk, color.black);
                        drawBar(x, x + len, y + height / 2, height - 3, color.grey);
                        drawBar(x, x + len * (level > 59 ? 1 : _gui._skill.getProgress()), y + height / 2, height - 3.5, color.gold);
                        drawText("Level " + level + " " + global.player._label, x + len / 2, y + height / 2, height - 4, color.guiwhite, "center", 1);
                        height = 14;
                        y -= height + spacing;
                        drawBar(x + len * .1, x + len * .9, y + height / 2, height - 3 + config.barChunk, color.black);
                        drawBar(x + len * .1, x + len * .9, y + height / 2, height - 3, color.grey);
                        drawBar(x + len * .1, x + len * (0.1 + .8 * (max ? Math.min(1, _gui._skill.getScore() / max) : 1)), y + height / 2, height - 3.5, color.green);
                        drawText("Score: " + util._formatLargeNumber(Math.round(_gui._skill.getScore())), x + len / 2, y + height / 2, height - 2, color.guiwhite, "center", 1);
                        ctx.lineWidth = 4;
                        if (global.player._nameColor) {
                            if (global.player._nameColor.charAt("0") !== "!") {
                                let nameColor = global.player._nameColor || "#FFFFFF";
                                drawText(global.player._name, Math.round(x + len / 2) + .5, Math.round(y - 10 - spacing) + .5, 32, nameColor, "center");
                            } else {
                                let [fill, stroke, font, size] = util._getSpecialNameInfoById(Number(global.player._nameColor.substring(1)));
                                drawText(global.player._name, Math.round(x + len / 2) + .5, Math.round(y - 10 - spacing) + .5, 32, fill, "center", false, 1, stroke, ctx, font);
                            }
                        }
                        if (global.displayTextUI.enabled) {
                            drawText(global.displayTextUI.text, Math.round(x + len / 2) + .5, Math.round(y - 55 - spacing), 16, global.displayTextUI.color, "center", true);
                        }
                    }
                    if (global.mobile) scaleScreenRatio(0.8); {
                        let len = alcoveSize,
                            height = len / global._gameWidth * global._gameHeight,
                            rawRatio = [global._gameWidth > global._gameHeight, global._gameWidth / global._gameHeight, global._gameHeight / global._gameWidth];
                        if (global._gameWidth > global._gameHeight || global._gameHeight > global._gameWidth) {
                            let ratio = [global._gameWidth / global._gameHeight, global._gameHeight / global._gameWidth];
                            len /= ratio[1] * 1.5;
                            height /= ratio[1] * 1.5;
                            if (len > alcoveSize * 2) {
                                ratio = len / (alcoveSize * 2);
                            } else if (height > alcoveSize * 2) {
                                ratio = height / (alcoveSize * 2);
                            } else {
                                ratio = 1;
                            }
                            len /= ratio;
                            height /= ratio;
                        }
                        let x = global.mobile ? spacing : global._screenWidth - len - 20,
                            y = global.mobile ? spacing : global._screenHeight - height - 20,
                            y2 = 66,
                            w = roomSetup[0].length,
                            h = roomSetup.length,
                            i = 0;
                        ctx.globalAlpha = .6;
                        if (global._mapType !== 1) {
                            for (let j = 0; j < roomSetup.length; j++) {
                                let row = roomSetup[j],
                                    k = 0;
                                for (let m = 0; m < row.length; m++) {
                                    ctx.fillStyle = getZoneColor(row[m], 0, Math.min(1, (Math.abs(roomSetup.length / 2 - j) / (roomSetup.length / 2)) * .5 + (Math.abs(row.length / 2 - m) / (row.length / 2)) * .5));
                                    drawGuiRect(x + k++ * len / w, y + i * height / h, len / w, height / h);
                                }
                                i++;
                            }
                        }
                        ctx.fillStyle = mixColors(color.grey, "#000000", 0.1);
                        let box = [x, y, len, height];
                        global._mapType === 1 ? drawGuiCircle(box[0] + box[2] / 2, box[1] + box[2] / 2, box[2] / 2, 0) : drawGuiRect(...box);
                        _gui._minimap._display = _gui._minimap._display.filter(entry => _gui._minimap._server.findIndex(real => real.id === entry.id) > -1);
                        for (let real of _gui._minimap._server) {
                            let index = _gui._minimap._display.findIndex(old => real.id === old.id);
                            if (index === -1) {
                                _gui._minimap._display.push(real);
                            } else {
                                // Update it
                                let old = _gui._minimap._display[index];
                                old.type = real.type;
                                old.x = lerp(old.x, real.x, .1, false);
                                old.y = lerp(old.y, real.y, .1, false);
                                old.color = real.color;
                                old.size = real.size;
                                old.width = real.width;
                                old.height = real.height;
                                _gui._minimap._display[index] = old;
                            }
                        }
                        for (let entity of _gui._minimap._display) {
                            ctx.fillStyle = mixColors(getColor(entity.color), color.black, 0.3);
                            ctx.globalAlpha = 1; //entity.alpha;
                            switch (entity.type) {
                                case 3: {
                                    const size = 3;
                                    drawGuiRect(x + ((entity.x - size) / global._gameWidth) * len, y + ((entity.y - size) / global._gameHeight) * height, size, size);
                                }
                                    break;
                                case 2: {
                                    const width = entity.size * (entity.width || 1);
                                    const hgt = entity.size * (entity.height || 1);
                                    drawGuiRect(x + ((entity.x - width) / global._gameWidth) * len - 0.4, y + ((entity.y - hgt) / global._gameHeight) * height - 1, ((2 * width) / global._gameWidth) * len + 0.2, ((2 * hgt) / global._gameWidth) * len + 0.2);
                                }
                                    break;
                                case 1: {
                                    drawGuiCircle(x + (entity.x / global._gameWidth) * len, y + (entity.y / global._gameHeight) * height, (entity.size / global._gameWidth) * len + 0.2);
                                }
                                    break;
                                case 0: {
                                    if (entity.id !== _gui._playerid) drawGuiCircle(x + (entity.x / global._gameWidth) * len, y + (entity.y / global._gameHeight) * height, 2);
                                }
                                    break;
                            }
                        }
                        ctx.globalAlpha = 1;
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = color.black;

                        ctx.fillStyle = color.guiblack;
                        if (!global._died) {
                            if (config.prediction === 2 || true) {
                                let xAdder = (global.player._cx * (rawRatio[0] ? 1 : rawRatio[2])) / global._gameWidth * len - 1
                                let yAdder = (global.player._cy * (rawRatio[0] ? rawRatio[1] : 1)) / global._gameWidth * height - 1
                                if (xAdder > 0 && yAdder > 0 && xAdder < 200 && yAdder < 200) {
                                    drawGuiCircle(x + xAdder, y + yAdder, 2);
                                }
                            } else {
                                drawGuiCircle(x + global.player._x / global._gameWidth * len - 1, y + global.player.y / global._gameWidth * height - 1, 2);
                            }
                        }
                        if (global.mobile) {
                            x = global._screenWidth - len - spacing;
                            y = global._screenHeight - spacing;
                        }
                        y -= 8;
                        drawText("Room ID: " + window.selectedRoomId, x + len, y, 18, "#B6E57C", "right");
                        y -= 18;
                        if (global._debug > 1) {
                            drawText("ClientFPS: " + metrics._rendertime, x + len, y, 14, metrics._rendertime > 15 ? color.guiwhite : color.orange, "right");
                            y -= 16;
                            drawText("Latency: " + metrics._latency + "ms", x + len, y, 14, metrics._latency < 375 ? color.guiwhite : color.orange, "right");
                            y -= 16;
                            if (global._debug > 2) {
                                drawText((global._died ? "Server Speed (Standby): " : "Server Speed: ") + _gui._fps.toFixed(1) + "mspt", x + len, y, 14, _gui._fps < 30 ? color.guiwhite : color.orange, "right");
                                y -= 16;
                                drawText(`Bandwidth: ${global._bandwidth._in} in, ${global._bandwidth._out} out`, x + len, y, 14, color.guiwhite, "right");
                                y -= 16;
                                drawText("Update Rate: " + metrics._updatetime + "Hz", x + len, y, 14, color.guiwhite, "right");
                                if (global._debug > 3) {
                                    y -= 16
                                    drawText(`Server MEM usage: ${metrics._serverMemUsage.toFixed(2)}%`, x + len, y, 14, metrics._serverMemUsage > 90 ? color.red : metrics._serverMemUsage > 70 ? color.orange : color.guiwhite, "right")
                                    y -= 16
                                    drawText(`Server CPU usage: ${metrics._serverCpuUsage.toFixed(2)}%`, x + len, y, 14, metrics._serverCpuUsage > 80 ? color.red : metrics._serverCpuUsage > 65 ? color.orange : color.guiwhite, "right")
                                    y -= 16
                                    drawText(`${mockups.fetchedMockups}/${mockups.totalMockups} (${((mockups.fetchedMockups / mockups.totalMockups) * 100).toFixed(2)}%) Mockups`, x + len, y, 14, color.guiwhite, "right")
                                }
                            }
                        }
                        ctx.lineWidth = 4;
                        ctx.strokeStyle = color.black;
                        //drawGuiRect(...box, 1);
                        switch (global._mapType) {
                            case 1:
                                drawGuiCircle(box[0] + box[2] / 2, box[1] + box[2] / 2, box[2] / 2, 1)
                                break;
                            case 3:
                                drawGUIPolygon(box[0] + box[2] / 2, box[1] + box[2] / 2, box[2] / 2, 3, 1);
                                break;
                            default:
                                drawGuiRect(...box, 1);
                        }
                    }
                    if (global.mobile) {
                        scaleScreenRatio(1 / 0.8);
                        scaleScreenRatio(1.4);
                    } { // Draw leaderboard
                        let vspacing = 4;
                        let len = 200;
                        let height = 14;
                        let x = global._screenWidth - len - spacing;
                        let y = spacing + height + 7;
                        drawText("Leaderboard", Math.round(x + len / 2) + 0.5, Math.round(y - 6) + 0.5, height + 4, color.guiwhite, 'center');
                        _gui._leaderboard._display = _gui._leaderboard._display.filter(entry => _gui._leaderboard._server.findIndex(real => real.id === entry.id) > -1);
                        for (let real of _gui._leaderboard._server) {
                            let index = _gui._leaderboard._display.findIndex(old => real.id === old.id);
                            if (index === -1) {
                                _gui._leaderboard._display.push(_gui._leaderboard._publish({
                                    score: 0
                                }, real));
                            } else {
                                // Update it
                                _gui._leaderboard._display[index] = _gui._leaderboard._publish(_gui._leaderboard._display[index], real);
                            }
                        }
                        _gui._leaderboard._display = _gui._leaderboard._display.sort((a, b) => b.score - a.score);
                        for (let i = 0; i < _gui._leaderboard._display.length && (!global.mobile || i < 6); i++) {
                            let entry = _gui._leaderboard._display[i];
                            drawBar(x, x + len, y + height / 2, height - 3 + config.barChunk, color.black);
                            drawBar(x, x + len, y + height / 2, height - 3, color.grey);
                            let shift = Math.min(1, entry.score / _gui._leaderboard._display[0].score);
                            drawBar(x, x + len * shift, y + height / 2, height - 3.5, entry.barColor);
                            // Leadboard name + score
                            let nameColor = entry.nameColor;
                            if (nameColor.charAt(0) !== "!") {
                                drawText(entry.label + (': ' + util._handleLargeNumber(Math.round(entry.score))), x + len / 2, y + height / 2, height - 5, nameColor, 'center', true);
                            } else {
                                let [fill, stroke, font, size] = util._getSpecialNameInfoById(Number(nameColor.substring(1)));
                                // With stroke its too hard to read xd
                                stroke = 0;
                                drawText(entry.label + (': ' + util._handleLargeNumber(Math.round(entry.score))), x + len / 2, y + height / 2, height - 5, fill, 'center', true, 1, stroke, ctx, font);
                            }
                            // Mini-image
                            let scale = height / entry.position.axis,
                                xx = x - 1.5 * height - scale * entry.position.middle.x * 0.707,
                                yy = y + 0.5 * height + scale * entry.position.middle.x * 0.707;
                            drawEntity(xx, yy, entry.image, 1 / scale, 1, scale * scale / entry.image.size, -Math.PI / 4, true);
                            // Move down
                            y += vspacing + height;
                        }
                    }
                    {
                        if (!config.disableMessages) {
                            let vspacing = 4,
                                height = 18,
                                x = global._screenWidth / 2,
                                y = 20,
                                fill;
                            if (global.mobile) y += (global.canSkill ? ((alcoveSize / 3 + spacing) / 1.4) * statMenu.get() : 0) + (global.canUpgrade ? ((alcoveSize / 2 + spacing) / 1.4) * upgradeMenu.get() : 0);
                            for (let i = global.messages.length - 1; i >= 0; i--) {
                                let msg = global.messages[i],
                                    txt = msg.text,
                                    text = txt;
                                //if (msg.len == null || msg.font !== config.fontFamily) {
                                msg.len = measureText(text, height - 4);
                                //msg.font = config.fontFamily;
                                //};
                                ctx.globalAlpha = .5 * msg.alpha;
                                fill = msg.color === "rainbow" ? hslToColor((Date.now() % 2520) / 7, 100, 50) : msg.color;
                                drawBar(x - msg.len / 2, x + msg.len / 2, y + height / 2, height, fill);
                                ctx.globalAlpha = Math.min(1, msg.alpha);
                                drawText(text, x, y + height / 2, height - 4, color.guiwhite, "center", 1);
                                y += vspacing + height;
                                if (msg.status > 1) y -= (vspacing + height) * (1 - Math.sqrt(msg.alpha));
                                if (msg.status > 1) {
                                    msg.status -= .05;
                                    msg.alpha += .05;
                                } else if (i === 0 && (global.messages.length > 6 || Date.now() - msg.time > 1e4)) {
                                    let mult = global.messages.length > 15 ? 5 : 1;
                                    msg.status -= .05 * mult;
                                    msg.alpha -= .05 * mult;
                                    if (msg.alpha <= 0 || global.messages.length > 40) {
                                        global.messages.splice(0, 1);
                                    }
                                }
                            }
                        }
                    }

                    if (global.mobile) scaleScreenRatio(1 / 1.4); {
                        upgradeMenu.set(0 + (global.canUpgrade || global.upgradeHover));
                        let glide = upgradeMenu.get();
                        global.clickables.upgrade.hide();
                        if (_gui._upgrades.length > 0) {
                            global.canUpgrade = 1;
                            let spacing = 10,
                                x = 2 * 20 - 20,
                                colorIndex = global._tankMenuColor,
                                i = 0,
                                y = 20,
                                x2 = x,
                                x3 = 0,
                                y2 = y,
                                ticker = 0,
                                len = Math.min(100, 200 * (Math.min(global._screenHeight, global._screenWidth) / Math.max(global._screenHeight, global._screenWidth))), //100
                                height = len;
                            //_scale = Math.max(global.screenWidth, 16 * global.screenHeight / 9) / (global.screenWidth <= 1280 ? 1280 : global.screenWidth >= 1920 ? 1920 : global.screenWidth);
                            upgradeSpin += .01;
                            for (let model of _gui._upgrades) {
                                if (y > y2) y2 = y - 60;
                                x3 = x * 2 + 105;
                                x *= glide
                                y *= glide
                                global.clickables.upgrade.place(i++, y, x, len, height);
                                ctx.globalAlpha = .5;
                                ctx.fillStyle = getColor(colorIndex > 185 ? colorIndex - 85 : colorIndex);
                                config.roundUpgrades ? drawGuiRoundRect(y, x, len, height, 10) : drawGuiRect(y, x, len, height);
                                ctx.globalAlpha = .175;
                                ctx.fillStyle = getColor(-10 + (colorIndex++ - (colorIndex > 185 ? 85 : 0)));
                                config.roundUpgrades ? drawGuiRoundRect(y, x, len, .6 * height, 4) : drawGuiRect(y, x, len, .6 * height);
                                ctx.fillStyle = color.black;
                                config.roundUpgrades ? drawGuiRoundRect(y, x + .6 * height, len, .4 * height, 4) : drawGuiRect(y, x + .6 * height, len, .4 * height);
                                if (!global._died && !global._disconnected) {
                                    let tx = Math.pow((global.guiMouse.x) - (y + height / 2), 2),
                                        ty = Math.pow((global.guiMouse.y) - (x + len / 2), 2);
                                    if (Math.sqrt(tx + ty) < height * .55) {
                                        config.roundUpgrades ? drawGuiRoundRect(y, x, len, height, 10) : drawGuiRect(y, x, len, height);
                                        ctx.globalAlpha = .5;
                                    }
                                }
                                ctx.globalAlpha = 1;
                                let picture = getEntityImageFromMockup(model, _gui._color),
                                    position = mockups.get(model).position,
                                    scale = .6 * len / position.axis,
                                    xx = y + .5 * height - scale * position.middle.x * Math.cos(upgradeSpin),
                                    yy = x + .5 * len - scale * position.middle.x * Math.sin(upgradeSpin);
                                drawEntity(xx, yy, picture, 1, 1, scale / picture.size, upgradeSpin, 1);
                                drawText(picture.name, y + len / 2, x + height - 6, height / 8 - 3, color.guiwhite, "center");
                                ctx.strokeStyle = color.black;
                                ctx.globalAlpha = 1;
                                ctx.lineWidth = 3;
                                config.roundUpgrades ? drawGuiRoundRect(y, x, len, height, 10, false, true) : drawGuiRect(y, x, len, height, true);
                                if (++ticker % 4 === 0) {
                                    x = x2;
                                    y += height + spacing;
                                } else {
                                    x += (len + spacing);
                                }
                            }
                            let h = 14,
                                txt = "Ignore",
                                m = measureText(txt, h - 3) + 10,
                                xx = y2 + height + spacing,
                                yy = (x3 + len + spacing + x2 - 15) / 2;
                            drawBar(xx - m / 2, xx + m / 2, yy + h / 2, h + config.barChunk, color.black);
                            drawBar(xx - m / 2, xx + m / 2, yy + h / 2, h, color.white);
                            drawText(txt, xx, yy + h / 2, h - 2, color.guiwhite, "center", 1);
                            global.clickables.skipUpgrades.place(0, xx - m / 2, yy, m, h);
                        } else {
                            global.canUpgrade = 0;
                            global.clickables.upgrade.hide();
                            global.clickables.skipUpgrades.hide();
                        }
                    } {
                        if (global.mobile) {
                            // Draw skill bars
                            global.canSkill = _gui._points > 0 && _gui._skills.some(skill => skill.amount < skill.cap) && !global.canUpgrade;
                            statMenu.set(0 + (global.canSkill || global._died));
                            let glide = statMenu.get();
                            global.clickables.stat.hide();
                            let internalSpacing = 14;
                            let width = alcoveSize / 2.5;
                            let height = alcoveSize / 2.5;
                            let x = 2 * spacing - spacing;
                            let y = spacing;
                            let index = 0;
                            let namedata = _gui._getStatNames(mockups.get(_gui._type).statnames || -1);
                            if (global.canSkill) {
                                _gui._skills.forEach((skill, ticker) => {
                                    let skillCap = skill.softcap;
                                    if (skillCap <= 0) return;
                                    let skillAmount = skill.amount;
                                    let skillColor = color[skill.color];
                                    let skillMax = skill.cap;
                                    let skillNameParts = namedata[9 - ticker].split(/\s+/);
                                    let skillNameCut = Math.floor(skillNameParts.length / 2);
                                    let [skillNameTop, skillNameBottom] = skillNameParts.length === 1 ? [skillNameParts, null] : [
                                        skillNameParts.slice(0, skillNameCut),
                                        skillNameParts.slice(skillNameCut)
                                    ];
                                    // Draw box
                                    ctx.globalAlpha = 0.9;
                                    ctx.fillStyle = skillColor;
                                    drawGuiRect(x, y, width, (height * 2) / 3);
                                    ctx.globalAlpha = 0.1;
                                    ctx.fillStyle = color.black;
                                    drawGuiRect(x, y + (((height * 2) / 3) * 2) / 3, width, (((height * 2) / 3) * 1) / 3);
                                    ctx.globalAlpha = 1;
                                    ctx.fillStyle = color.guiwhite;
                                    drawGuiRect(x, y + (height * 2) / 3, width, (height * 1) / 3);
                                    ctx.fillStyle = skillColor;
                                    drawGuiRect(x, y + (height * 2) / 3, (width * skillAmount) / skillCap, (height * 1) / 3);
                                    // Dividers
                                    ctx.strokeStyle = color.black;
                                    ctx.lineWidth = 1;
                                    for (let j = 1; j < skillMax; j++) {
                                        let xPos = x + width * (j / skillCap);
                                        drawGuiLine(xPos, y + (height * 2) / 3, xPos, y + height);
                                    }
                                    // Upgrade name
                                    if (skillAmount !== skillMax && _gui._points && (skillCap === skillMax || skillAmount !== skillCap)) {
                                        global.clickables.stat.place(9 - ticker, x * ratio, y * ratio, width * ratio, height * ratio);
                                    }
                                    if (skillNameBottom) {
                                        drawText(skillNameBottom, x + width / 2, y + height * 0.55, height / 6, color.guiwhite, "center");
                                        drawText(skillNameTop, x + width / 2, y + height * 0.3, height / 6, color.guiwhite, "center");
                                    } else {
                                        drawText(skillNameTop, x + width / 2, y + height * 0.425, height / 6, color.guiwhite, "center");
                                    }
                                    if (skillAmount > 0) {
                                        drawText(skillAmount >= skillCap ? "MAX" : "+" + skillAmount, Math.round(x + width / 2) + 0.5, y + height * 1.3, height / 4, skillColor, "center");
                                    }
                                    // Border
                                    ctx.strokeStyle = color.black;
                                    ctx.globalAlpha = 1;
                                    ctx.lineWidth = 3;
                                    drawGuiLine(x, y + (height * 2) / 3, x + width, y + (height * 2) / 3);
                                    drawGuiRect(x, y, width, height, true);
                                    x += (width + internalSpacing);
                                    y *= glide
                                    index++;
                                });
                                if (_gui._points > 1) {
                                    drawText("x" + _gui._points, Math.round(x) + 0.5, Math.round(y + 20) + 0.5, 20, color.guiwhite, "left");
                                }
                            }
                        }
                    } { // Joysticks
                        if (global.mobile) {
                            {
                                let radius = Math.min(global._screenWidth * 0.6, global._screenHeight * 0.12);
                                ctx.globalAlpha = 0.3;
                                ctx.fillStyle = "#ffffff";
                                ctx.beginPath();
                                ctx.arc((global._screenWidth * 1) / 6, (global._screenHeight * 2) / 3, radius, 0, 2 * Math.PI);
                                ctx.arc((global._screenWidth * 5) / 6, (global._screenHeight * 2) / 3, radius, 0, 2 * Math.PI);
                                ctx.fill();
                                for (let i = 0; i < 4; i++) {
                                    const angle = Math.PI * 2 / 4 * i;
                                    ctx.strokeStyle = "#dddddd";
                                    ctx.lineWidth = radius * 0.125;
                                    ctx.beginPath();
                                    ctx.save();
                                    ctx.translate((global._screenWidth * 1) / 6, (global._screenHeight * 2) / 3);
                                    ctx.moveTo(Math.cos(angle) * radius * 0.2, Math.sin(angle) * radius * 0.2);
                                    ctx.lineTo(Math.cos(angle) * radius * 0.8, Math.sin(angle) * radius * 0.8);
                                    ctx.restore();
                                    ctx.closePath();
                                    ctx.stroke();
                                    ctx.beginPath();
                                    ctx.save();
                                    ctx.translate((global._screenWidth * 5) / 6, (global._screenHeight * 2) / 3);
                                    ctx.moveTo(Math.cos(angle) * radius * 0.2, Math.sin(angle) * radius * 0.2);
                                    ctx.lineTo(Math.cos(angle) * radius * 0.8, Math.sin(angle) * radius * 0.8);
                                    ctx.restore();
                                    ctx.closePath();
                                    ctx.stroke();
                                }
                            }
                            const size = spacing * 2;
                            drawMobileButton(0, spacing, global._screenHeight - spacing - size, size, size, global._mobileOptions ? "X" : "+");
                            if (global._mobileOptions) {
                                const offX = spacing + (size * 2);
                                const offY = spacing + size;
                                const x = spacing * 2 + size;
                                const y = global._screenHeight - spacing - size;
                                drawMobileButton(1, x, y - offY, size * 2, size, "Level Up");
                                drawMobileButton(2, x + offX, y - offY, size * 2, size, "Testbed");
                                drawMobileButton(3, x, y, size * 2, size, "Override");
                                drawMobileButton(4, x + offX, y, size * 2, size, "Reset Tank");
                                drawMobileButton(5, x + offX * 2, y, size * 2, size, "Full Screen");
                                drawMobileButton(6, x + offX * 2, y - offY, size * 2, size, global._mobileChatText);
                            } else {
                                let x = spacing + size * 1.5
                                let y = global._screenHeight - spacing - size
                                drawMobileButton(7, x, y, size * 2, size, global._mobileFiring[0] === 4 ? "Main Firing" : "Alt Firing");
                                drawMobileButton(8, x * 2.25, y, size, size, "Q");
                            }
                        }
                    }
                };
                if (global.mobile) scaleScreenRatio(1 / ratio, true);
            }

            if (global.player.pepperspray.apply || global.player.pepperspray.blurMax > 0) {
                ctx.filter = `blur(${global.player.pepperspray.blurAmount}px)`;
                ctx.drawImage(c, 0, 0, global._screenWidth, global._screenHeight);
                ctx.filter = "none";
                if (!global.player.pepperspray.apply && global.player.pepperspray.blurAmount != 0) {
                    global.player.pepperspray.blurAmount--
                    if (global.player.pepperspray.blurAmount == 0) global.player.pepperspray.blurMax = 0;
                } else if (global.player.pepperspray.blurAmount < global.player.pepperspray.blurMax) global.player.pepperspray.blurAmount++;
            }

            if (global.player.lsd) {
                ctx.filter = `hue-rotate(${Math.sin(Date.now() / 600) * 360}deg)`;
                ctx.drawImage(c, 0, 0, global._screenWidth, global._screenHeight);
                ctx.filter = "none";
            }

            if (global.drawPoint) {
                ctx.fillStyle = "red"
                ctx.globalAlpha = 0.5
                drawGuiCircle(global.drawPoint.x, global.drawPoint.y, 25)
            }

            ctx.filter = ["none", "contrast(1000%)", "grayscale(100%)", "grayscale(28%)", "invert(100%)", "sepia(75%)"][["Disabled", "Saturated", "Grayscale", "Dramatic", "Inverted", "Sepia"].indexOf(config.filter)];
            if (ctx.filter !== "none") ctx.drawImage(c, 0, 0, global._screenWidth, global._screenHeight);
            ctx.filter = "none";
            metrics._lastrender = getNow();
        };
    }();
    let _gameDrawDead = function () {
        let getKills = function getKills() {
            let finalKills = [Math.round(global.finalKills[0].get()), Math.round(global.finalKills[1].get()), Math.round(global.finalKills[2].get())],
                b = finalKills[0] + .5 * finalKills[1] + 3 * finalKills[2];
            return (0 === b ? "🌼" : 4 > b ? "🎯" : 8 > b ? "💥" : 15 > b ? "💢" : 25 > b ? "🔥" : 50 > b ? "💣" : 75 > b ? "👺" : 100 > b ? "🌶️" : "💯") + (finalKills[0] || finalKills[1] || finalKills[2] ? " " + (finalKills[0] ? finalKills[0] + " kill" + (1 === finalKills[0] ? "" : "s") : "") + (finalKills[0] && finalKills[1] ? " and " : "") + (finalKills[1] ? finalKills[1] + " assist" + (1 === finalKills[1] ? "" : "s") : "") + ((finalKills[0] || finalKills[1]) && finalKills[2] ? " and " : "") + (finalKills[2] ? finalKills[2] + " boss" + (1 === finalKills[2] ? "" : "es") + " defeated" : "") : " A true pacifist") + ".";
        },
            getDeath = function getDeath() {
                let txt = "";
                if (global.finalKillers.length) {
                    txt = "🔪 Succumbed to";
                    for (let i = 0; i < global.finalKillers.length; i++) txt += " " + util._addArticle(mockups.get(global.finalKillers[i]).name) + " and";
                    txt = txt.slice(0, -4) + ".";
                } else txt += "🔪 Well that was kinda dumb, huh?";
                return txt;
            };
        return function () {
            if (!global.finalScore) return;
            let glideDuration = 750
            let glide;
            let getGlide;
            let getAlpha;
            if (global._deathScreenState === 0) {// FADE IN
                glide = (Date.now() - (global._diedAt - 3000)) / glideDuration
                let glideSuber = 0
                getGlide = function () {
                    glideSuber += 0.025
                    return bounceyLerp.out(Math.min(glide + glideSuber, 1))
                }
                let alphaEquation = (Math.min(1, Math.min(1, glide) + 0.25)) // Broooo litterally meeeeee
                getAlpha = function () {
                    return alphaEquation
                }
                _clearScreen(color.black, .5 * alphaEquation);
            } else if (global._deathScreenState === 1) {// FADE OUT
                if (Date.now() - global._diedAt > glideDuration) {
                    _displayDeathHTML(false)
                    return;
                }
                glide = (Date.now() - (global._diedAt)) / glideDuration
                let glideSuber = 0
                getGlide = function () {
                    glideSuber += 0.025
                    return 1 + expLerp.in(Math.min(glide + glideSuber, 1))
                }
                let alphaEquation = (1 - (Math.min(1, glide))) // Sammeee onggg 🙏🙏🙏🙏
                getAlpha = function () {
                    return alphaEquation
                }
                _clearScreen(color.black, .5 * alphaEquation);
            }

            _displayDeathHTML(true)
            _socket.cmd.reset()
            let x = global._screenWidth / 2,
                y = global._screenHeight / 2 - 50,
                picture = getEntityImageFromMockup(_gui._type, _gui._color),
                len = 140,
                position = mockups.get(_gui._type).position,
                scale = len / position.axis,
                xx = global._screenWidth / 2 - scale * position.middle.x * .707,
                yy = global._screenHeight / 2 - 35 + scale * position.middle.x * .707,
                delay = Math.ceil((global._diedAt - Date.now()) / 1000);
            global.player.pepperspray.apply = false;
            global.player.lsd = false;
            drawEntity(xx - 190 - len / 2, (yy - 10) * getGlide(), picture, 1.5, getAlpha(), .5 * scale / picture.realSize, -Math.PI / 4);
            ctx.globalAlpha = getAlpha()
            drawText(global._deathSplashOverride || global._deathSplash[global._deathSplashChoice], x, (y - 80) * getGlide(), 10, color.guiwhite, "center");
            drawText("Level " + _gui._skill.getLevel() + " " + global.player._label, x - 170, (y - 30) * getGlide(), 24, color.guiwhite);
            drawText("Final Score: " + util._formatLargeNumber(Math.round(global.finalScore.get())), (x - 170), (y + 25) * getGlide(), 50, color.guiwhite);
            drawText("⌛ Survived for " + util._formatTime(Math.round(global.finalLifetime.get())) + ".", (x - 170), (y + 55) * getGlide(), 16, color.guiwhite);
            drawText(getKills(), (x - 170), (y + 77) * getGlide(), 16, color.guiwhite);
            drawText(getDeath(), (x - 170), (y + 99) * getGlide(), 16, color.guiwhite);
            drawText("⌚ Died on " + global.deathDate, (x - 170), (y + 121) * getGlide(), 16, color.guiwhite);
            drawText(delay > 0 ? "You may respawn in " + delay + " second" + (delay === 1 ? "" : "s") + "." : "Press enter to respawn!", x, (y + 147) * getGlide(), 16, color.guiwhite, "center");
            global._forceTwiggle = false;
        };
    }();
    //
    let _gameDrawDisconnected = function () {
        return function () {
            let alphaColor = global._arenaClosed ? color.yellow : color.red,
                offset = global._died ? 120 : 0;
            _clearScreen(mixColors(alphaColor, color.guiblack, .3), .25);
            drawText("💀 Disconnected 💀", global._screenWidth / 2, global._screenHeight / 2 + offset, 30, color.guiwhite, "center");
            drawText(global.message, global._screenWidth / 2, global._screenHeight / 2 + 30 + offset, 15, alphaColor, "center");
            if (global._arenaClosed) drawText(global.closingSplash || "", global._screenWidth / 2, global._screenHeight / 2 + 45 + offset, 15, alphaColor, "center");
        };
    }();
    let _gameDrawError = function (error) {
        console.error(error);
        console.error(error.stack)
        let offset = global._died ? 120 : 0;
        _clearScreen(mixColors(color.orange, color.guiblack, .3), .25);
        drawText("Client Error", global._screenWidth / 2, global._screenHeight / 2 + offset, 30, color.red, "center");
        drawText(error, global._screenWidth / 2, global._screenHeight / 2 + 30 + offset, 15, color.red, "center");
        drawText("Please take a screenshot and report this to a dev", global._screenWidth / 2, global._screenHeight / 2 + 45 + offset, 15, color.red, "center");
    };
    let _gameDrawServerStatusText = function () {
        _clearScreen(color.white, 1);
        drawText(window.loadingTextStatus || "", global._screenWidth / 2, global._screenHeight / 2, 30, color.guiwhite, "center");
        drawText(window.loadingTextTooltip || "", global._screenWidth / 2, global._screenHeight / 2 + 75, 15, color.guiwhite, "center");
    };
    let _gameDrawLoadingMockups = function () {
        _clearScreen(color.white, 1);
        drawText("Loading mockups...", global._screenWidth / 2, global._screenHeight / 2, 30, color.guiwhite, "center");
        drawText("This may take a while depending on your device and internet speed!", global._screenWidth / 2, global._screenHeight / 2 + 75, 15, color.guiwhite, "center");
    };

    global.gameLoopSecond = function () {
        let time = 0;
        let i = 0;
        let func = function () {
            global._bandwidth._out = global._bandwidth._outbound;
            global._bandwidth._in = global._bandwidth._inbound;
            global._bandwidth._outbound = 0;
            global._bandwidth._inbound = 0;

            if (!global._gameStart || global.gameDrawDead || global._disconnected) {
                return time = 0
            } else {

            };
            if (rewardManager._statistics[5] < ++time) rewardManager.increaseStatistic(5, time, true);
            switch (time) {
                case 1800:
                    rewardManager.unlockAchievement("hope_you_are_having_fun");
                    break;
                case 3600:
                    rewardManager.unlockAchievement("i_mean_you_must_be_right");
                    break;
                case 7200:
                    rewardManager.unlockAchievement("hopefully_you_have_the_score_to_back_this_up");
                    break;
                case 14400:
                    rewardManager.unlockAchievement("no_way_you_didnt_go_afk");
                    break;
            }

            rewardManager.increaseStatistic(7, 1);
            switch (rewardManager._statistics[7]) {
                case 1800:
                    rewardManager.unlockAchievement("hourly_enjoyer");
                    break;
                case 14400:
                    rewardManager.unlockAchievement("fhourly_enjoyer");
                    break;
                case 36000:
                    rewardManager.unlockAchievement("okay_that_was_fun");
                    break;
                case 86400:
                    rewardManager.unlockAchievement("uh_are_you_okay");
                    break;
                case 259200:
                    rewardManager.unlockAchievement("you_need_something_else_to_do");
                    break;
                case 604800:
                    rewardManager.unlockAchievement("wake_up_wake_up_wake_up");
                    break;
            }

            global._fps = global._fpsc;
            global._fpsc = 0;

            if (time % 3 === 0) {
                if (_gui._skills[0].cap !== 0 && _gui._skills[0].amount === _gui._skills[0].cap) rewardManager.unlockAchievement("shielded_from_your_bs");
                if (_gui._skills[1].cap !== 0 && _gui._skills[1].amount === _gui._skills[1].cap) rewardManager.unlockAchievement("selfrepairing");
                if (_gui._skills[2].cap !== 0 && _gui._skills[2].amount === _gui._skills[2].cap) rewardManager.unlockAchievement("2fast4u");
                if (_gui._skills[3].cap !== 0 && _gui._skills[3].amount === _gui._skills[3].cap) rewardManager.unlockAchievement("ratatatatatatatata");
                if (_gui._skills[4].cap !== 0 && _gui._skills[4].amount === _gui._skills[4].cap) rewardManager.unlockAchievement("more_dangerous_than_it_looks");
                if (_gui._skills[5].cap !== 0 && _gui._skills[5].amount === _gui._skills[5].cap) rewardManager.unlockAchievement("theres_no_stopping_it");
                if (_gui._skills[6].cap !== 0 && _gui._skills[6].amount === _gui._skills[6].cap) rewardManager.unlockAchievement("indestructible_ii");
                if (_gui._skills[7].cap !== 0 && _gui._skills[7].amount === _gui._skills[7].cap) rewardManager.unlockAchievement("mach_4");
                if (_gui._skills[8].cap !== 0 && _gui._skills[8].amount === _gui._skills[8].cap) rewardManager.unlockAchievement("dont_touch_me");
                if (_gui._skills[9].cap !== 0 && _gui._skills[9].amount === _gui._skills[9].cap) rewardManager.unlockAchievement("indestructible");

                if (rewardManager._statistics[8] < 225 && rewardManager._statistics[8] > 199) rewardManager.unlockAchievement("nuisance_exterminator");
                if (rewardManager._statistics[8] < 15 && rewardManager._statistics[8] > 0) rewardManager.unlockAchievement("they_seek");

                if (rewardManager._statistics[10] < 110 && rewardManager._statistics[10] > 99) rewardManager.unlockAchievement("drones_are_life");

                let max = _gui._leaderboard._display.length ? _gui._leaderboard._display[0].score : false;
                if (!global._died && time > 30 && Math.min(1, _gui._skill.getScore() / max) === 1) rewardManager.unlockAchievement("the_leader");
            }
        }
        setInterval(func, 1000);
    }();

    let nextTime = 0;
    function _animloop() {
        global.animLoopHandle = window.requestAnimFrame(_animloop);
        if (nextTime < performance.now()) {
            global._fpsc++;
            try {
                if (global._tankMenuColorReal >= 185) global._tankMenuColorReal = 100;
                global._tankMenuColorReal += 0.16;
                global._tankMenuColor = global._tankMenuColorReal | 0;
                global.player._renderv += (global.player._view - global.player._renderv) / 30;
                let ratio = getRatio();
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                if (global._gameStart && !global._disconnected) {
                    global.time = Date.now(); //getNow();
                    if (global.time - lastPing > 1000) {
                        _socket.ping();
                        lastPing = global.time;
                        metrics._rendertime = renderTimes;
                        renderTimes = 0;
                        metrics._updatetime = updateTimes;
                        updateTimes = 0;
                    }
                    if (global._debug > 3 && global.time - lastServerStat > 1000 + 150) {// make sure to update this on the server if you change the time
                        _socket.talk("da")
                        lastServerStat = global.time
                    }
                    metrics._lag = global.time - global.player._time;
                }
                if (!window.rivetServerFound) _gameDrawServerStatusText();
                else if (global._gameStart) {
                    if (mockups.length === 0) _gameDrawLoadingMockups();
                    else {
                        gameDraw(ratio);
                    };
                } else if (!global._disconnected) {
                    _gameDrawServerStatusText();
                }
                _gameDrawDead();
                if (global._disconnected) _gameDrawDisconnected();
            } catch (error) {
                _gameDrawError(error)
            }
            nextTime += global._fpscap;
        }
    };
    document.getElementById("wrapperWrapper").onclick = () => {
        if (document.getElementById("startMenuWrapper")) {
            //return
        }
        document.getElementById("gameCanvas").focus()
    }
}

let startInterval = setInterval(() => {
    if (!window.preloadsDoneCooking) {
        return
    }
    clearInterval(startInterval)
    if (!window.didMainLoad) RememberScriptingIsBannable()
    window.onload()
})