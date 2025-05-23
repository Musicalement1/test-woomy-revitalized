import { global, resizeEvent } from "./global.js";
import { util, displayDeathHTML, getWOSocketId } from "/js/util.js"
import { ctx, _clearScreen } from "./drawing/canvas.js"
import { fasttalk } from "/js/fasttalk.js"
import { rewardManager } from "/js/achievements.js"
import { initSettingsMenu } from "/js/settingsMenu.js"
import { mockups, } from "./mockups.js"
import { socket, makeSocket } from "./socket.js"
import { gameDrawDead, gameDrawDisconnected, gameDrawError, gameDrawServerStatusText, gameDrawLoadingMockups } from "./drawing/scenes.js"
import { gameDraw } from "./drawing/gameDraw.js"

document.getElementById("specialRoomToken").value = localStorage.getItem("specialRoomToken") || ""

// App.js
function RememberScriptingIsBannable() {
    window.didMainLoad = true

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
            let playerNameInput = document.getElementById("playerNameInput");
            util._submitToLocalStorage("playerNameInput");
            global.playerName = global.player._name = playerNameInput.value.trim();
            global.cleanPlayerName = util._cleanString(global.playerName, 25)
            let socketOut = util._cleanString(global.playerName, 25).split('');
            for (let i = 0; i < socketOut.length; i++) socketOut[i] = socketOut[i].charCodeAt();
            window.connectSocketToServer = async function () {
                // WRM, roomCreate
                window.roomManager.send(window.addMetaData(1, 3, fasttalk.encode([/*TODO: reimplement selection*/"", specialRoomToken])))
                localStorage.setItem("specialRoomToken", specialRoomToken)
                await makeSocket(true)
                socket.talk("s", global.party || 0, socketOut.toString(), 1, getWOSocketId());
                console.log(socket)
            }
            window.serverWorker = new Worker("./server.js");
            window.serverWorkerSetup()
            document.getElementById("entityEditor").style.display = "block" // enable editor for host
        } else {
            window.loadingTextStatus = "Joining server..."
            window.loadingTextTooltip = ""
            window.onRoomJoined = async () => {
                await makeSocket()
                console.log(socket)
                socket.talk("s", global.party || 0, socketOut.toString(), 1, getWOSocketId());
            }
            window.roomManager.send(window.addMetaData(1, 4, fasttalk.encode([window.selectedRoomId])))
        }
        document.getElementsByClassName("background")[0].remove();
        setTimeout(() => {
            if (global.playerName === "") rewardManager.unlockAchievement("anonymous");
        }, 5000);
        if (document.getElementById("mainMenu")) {
            document.getElementById("mainMenu").remove();
        } else {
            document.getElementById("startMenuWrapper").remove();
        };
        if (document.getElementById("signInDiv")) document.getElementById("signInDiv").remove()
        displayDeathHTML(false)
        if (!global.animLoopHandle) _animloop();
        //clearInterval(global.screenScale);
        //global.functionSociety.push([`${socket}`, canvas, "socket"]);
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
                        socket.ping();
                        lastPing = global.time;
                        metrics._rendertime = renderTimes;
                        renderTimes = 0;
                        metrics._updatetime = updateTimes;
                        updateTimes = 0;
                    }
                    if (global._debug > 3 && global.time - lastServerStat > 1000 + 150) {// make sure to update this on the server if you change the time
                        socket.talk("da")
                        lastServerStat = global.time
                    }
                    metrics._lag = global.time - global.player._time;
                }
                if (global._gameStart) {
                    if (mockups.length === 0) {
                        gameDrawLoadingMockups();
                    } else {
                        gameDraw(ratio);
                    };
                } else if (!global._disconnected) {
                    gameDrawServerStatusText();
                }
                gameDrawDead();
                if (global._disconnected) gameDrawDisconnected();
            } catch (error) {
                gameDrawError(error)
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