import { global } from "./global.js";
import { _startGame } from "./app.js";
import { multiplayer } from "./multiplayer.js";
import { openModBrowser } from "./mainmenu.js";
import { util } from "./util.js";

/*
== NOTE ==
using .click() on an element such as a filter element will not automatically refresh the ui
*/

const closeButton = document.getElementById("gameJoinClose");
closeButton.onclick = openJoinScreen
function openJoinScreen(close) {
	let mb = document.getElementById("gameJoinScreen")
	if (close === true || mb.style.top === "0%") {
		mb.style.top = "-100%";
	} else if(!window.gameLaunched){
		mb.style.top = "0%"
	}
}

const roomGalleryTemplate = document.getElementById("joinEntryGalleryTemplate")
roomGalleryTemplate.style.display = "none";

const roomListTemplate = document.getElementById("joinEntryListTemplate")
roomListTemplate.style.display = "none";

const modListTemplate = document.getElementById("modListTemplate")
modListTemplate.children[1].style.display = "none";
modListTemplate.style.display = "none";

const roomInfoPlayerCount = document.getElementById("roomInfoPlayerAmount")
const roomInfoGamemode = document.getElementById("roomInfoGamemode")
const roomInfoGamemodeImage = document.getElementById("roomInfoGamemodeImage")
const roomInfoGamemodeDescription = document.getElementById("roomInfoGamemodeDescription")

let playerCount = 0;
let gamemodeName = "";
let gamemodeImage = "";
let gamemodeDescription = "";
let selectedGamemode = "";
let selectedRoomId = "";
resetRoomInfo()
function resetRoomInfo() {
	gamemodeName = "Welcome!"
	gamemodeImage = ""
	gamemodeDescription = "Select a room to join other players or click create and host a room for others to join."
}
function updateRoomInfo() {
	roomInfoPlayerCount.innerHTML = playerCount;
	roomInfoGamemode.innerHTML = gamemodeName;
	if (gamemodeImage === "") {
		roomInfoGamemodeImage.style.display = "none";
	} else {
		roomInfoGamemodeImage.style.display = "block";
	}
	roomInfoGamemodeImage.src = gamemodeImage;
	roomInfoGamemodeDescription.innerHTML = gamemodeDescription
}

const nameInput = document.getElementById("nameInput")
nameInput.oninput = function () {
	console.log("asdasd")
	util._submitToLocalStorage("nameInput")
}

const tokenInput = document.getElementById("tokenInput")
tokenInput.oninput = function () {
	util._submitToLocalStorage("tokenInput")
}

const joinButton = document.getElementById("joinActionButton")
joinButton.onclick = function () {
	if (window.creatingRoom === false && selectedRoomId === "") {
		return;
	}
	openModBrowser(true);
	openJoinScreen(true);
	if (global._disconnected && global._gameStart) return;
	window.gameLaunched = true;
	_startGame(selectedGamemode, gamemodeName, selectedRoomId);
}
document.addEventListener("keydown", function eh (e) {
	if (global._disconnected && global._gameStart) return;
	let key = e.which || e.keyCode;
	if (document.getElementById("gameJoinScreen").style.top !== "0%") return;
    this.removeEventListener("keydown", eh)
	if (!global._disableEnter && key === global.KEY_ENTER && !global._gameStart) joinButton.click();
})


let createFilter = "join";
const joinFilter = document.getElementById("joinFilter")
const hostFilter = document.getElementById("hostFilter")
function createFilterClick(e) {
	if (typeof this === "string") createFilter = this;
	if (createFilter === "host") {// if we clicked join
		joinFilter.classList.remove("joinSearchButtonUnselected")
		joinFilter.classList.add("joinSearchButtonSelected")
		hostFilter.classList.remove("joinSearchButtonSelected")
		hostFilter.classList.add("joinSearchButtonUnselected")
		createFilter = "join"
		window.creatingRoom = false;
		if (e.isTrusted === false) return;
		clearGamemodes()
		clearRooms()
		showRooms()
	} else { // if we clicked host
		hostFilter.classList.remove("joinSearchButtonUnselected")
		hostFilter.classList.add("joinSearchButtonSelected")
		joinFilter.classList.remove("joinSearchButtonSelected")
		joinFilter.classList.add("joinSearchButtonUnselected")
		createFilter = "host"
		window.creatingRoom = true;
		if (e.isTrusted === false) return;
		clearGamemodes()
		clearRooms()
		showGamemodes()
	}
}
joinFilter.onclick = createFilterClick.bind("host");
hostFilter.onclick = createFilterClick.bind("join");

let roomFilter = "gallery"
const galleryFilter = document.getElementById("galleryFilter")
const listFilter = document.getElementById("listFilter")
function roomFilterClick(e) {
	if (typeof this === "string") roomFilter = this;
	if (roomFilter === "list") {
		galleryFilter.classList.remove("joinSearchButtonUnselected")
		galleryFilter.classList.add("joinSearchButtonSelected")
		listFilter.classList.remove("joinSearchButtonSelected")
		listFilter.classList.add("joinSearchButtonUnselected")
		roomFilter = "gallery"
		localStorage.setItem("roomFilter", "gallery")
	} else {
		listFilter.classList.remove("joinSearchButtonUnselected")
		listFilter.classList.add("joinSearchButtonSelected")
		galleryFilter.classList.remove("joinSearchButtonSelected")
		galleryFilter.classList.add("joinSearchButtonUnselected")
		roomFilter = "list"
		localStorage.setItem("roomFilter", "list")
	}
	if (e.isTrusted === false) return;
	if (createFilter === "host") {
		clearGamemodes()
		showGamemodes()
	} else if (createFilter === "join") {
		clearRooms()
		showRooms()
	}
}
galleryFilter.onclick = roomFilterClick.bind("list");
listFilter.onclick = roomFilterClick.bind("gallery");

const defaultGamemodes = [
	{
		name: "2 TDM",
		image: "/resources/gamemodes/2tdm.webp",
		description: "Fight in an all out war against another team!",
		players: 0,
		code: "2tdm.json"
	},
	{
		name: "2 TDM Domination",
		image: "/resources/gamemodes/2tdm_dom.webp",
		description: "Fight on one of two teams to capture all the dominators first!",
		players: 0,
		code: "2dom.js"
	},
	{
		name: "2 TDM Tag",
		image: "/resources/gamemodes/2tdm_tag.webp",
		description: "Kill other players on the other team to recruit them to your team.",
		players: 0,
		code: "2tag.json"
	},
	{
		name: "2 TDM Mothership",
		image: "/resources/gamemodes/2tdm_mot.webp",
		description: "Fight on one of two teams to kill the other team's mothership!",
		players: 0,
		code: "2mot.json"
	},
	{
		name: "2 TDM Portal Mothership",
		image: "/resources/gamemodes/2potmot.webp",
		description: "Fight on one of two teams to kill the other team's mothership: Now with portals!",
		players: 0,
		code: "p2mot.json"
	},
	{
		name: "2 TDM Hell",
		image: "/resources/gamemodes/2tdmhell.webp",
		description: "Fight against the other team's army with your own! Each side has 25 bots.",
		players: 0,
		code: "2tdmhell.json"
	},
	{
		name: "4 TDM",
		image: "/resources/gamemodes/4tdm.webp",
		description: "Fight in an all out war against three other teams!",
		players: 0,
		code: "4tdm.json"
	},
	{
		name: "4 TDM Blackout",
		image: "/resources/gamemodes/4tdm_blackout.webp",
		description: "Fight in an all out war against three other teams while in the dark...",
		players: 0,
		code: "blackout4tdm.json"
	},
	{
		name: "4 TDM Domination",
		image: "/resources/gamemodes/4tdm_dom.webp",
		description: "Fight on one of four teams to capture all the dominators first!",
		players: 0,
		code: "4dom.json"
	},
	{
		name: "4 TDM Tag",
		image: "/resources/gamemodes/4tdm_tag.webp",
		description: "Kill other players on the other three teams to recruit them to your team.",
		players: 0,
		code: "4tag.json"
	},
	{
		name: "4 TDM Mothership",
		image: "/resources/gamemodes/4tdm_mot.webp",
		description: "Fight on one of four teams to destroy all of the other teams' motherships!",
		players: 0,
		code: "4mot.json"
	},
	{
		name: "Maze",
		image: "/resources/gamemodes/maze.webp",
		description: "Free for all inside a maze!",
		players: 0,
		code: "maze.js"
	},
	{
		name: "Maze TDM",
		image: "/resources/gamemodes/maze_tdm.webp",
		description: "Fight against other teams inside of a maze!",
		players: 0,
		code: "mazetdm.js"
	},
	{
		name: "Maze TDM Blackout",
		image: "/resources/gamemodes/mazetdm_blackout.webp",
		description: "Fight against other teams inside of a maze while in the dark...",
		players: 0,
		code: "blackoutmazetdm.js"
	},
	{
		name: "Cave",
		image: "/resources/gamemodes/cave.webp",
		description: "Free for all inside of a cave system! Close quarters!",
		players: 0,
		code: "cave.json"
	},
	{
		name: "Cave TDM",
		image: "/resources/gamemodes/cavetdm.webp",
		description: "Fight against other teams inside of a cave system!",
		players: 0,
		code: "cavetdm.js"
	},
	{
		name: "Cave TDM Blackout",
		image: "/resources/gamemodes/cavetdm_blackout.webp",
		description: "Fight against other teams inside of a cave system while in the dark...",
		players: 0,
		code: "blackoutcavetdm.js"
	},
	{
		name: "FFA",
		image: "/resources/gamemodes/ffa.webp",
		description: "Everyone for themselves!",
		players: 0,
		code: "ffa.json"
	},
	{
		name: "Portal FFA",
		image: "/resources/gamemodes/potffa.webp",
		description: "Everyone for themselves: Now with portals!",
		players: 0,
		code: "pffa.json"
	},
	{
		name: "Space",
		image: "/resources/gamemodes/space.webp",
		description: "Everyone for themselves: Now in space!",
		players: 0,
		code: "space.json"
	},
	{
		name: "Survival",
		image: "/resources/gamemodes/survival.webp",
		description: "Everyone for themselves but, you can't automatically level up. You gotta grind.",
		players: 0,
		code: "srvivl.json"
	},
	{
		name: "Growth",
		image: "/resources/gamemodes/growth.webp",
		description: "Everyone for themselves! The more score you have the larger and stronger you get. Get to 2 million score to unlock dreadnaughts.",
		players: 0,
		code: "growth.json"
	},
	{
		name: "Boss Rush",
		image: "/resources/gamemodes/bossrush.webp",
		description: "Defeat 75 waves of bosses. Think you or your computer can take it? Good luck!",
		players: 0,
		code: "boss.json"
	},
	{
		name: "Siege",
		image: "/resources/gamemodes/siege.webp",
		description: "Defend your sanctuaries from the horde of bosses!",
		players: 0,
		code: "siege.js"
	},
	{
		name: "Sandbox",
		image: "/resources/gamemodes/sandbox.webp",
		description: "Each player has their own arena. Test different combos here.",
		players: 0,
		code: "sbx.json"
	},
	{
		name: "Hangout",
		image: "/resources/gamemodes/hangout.webp",
		description: "Everyone is on the same team. Sit around and chat.",
		players: 0,
		code: "hangout.js"
	},
	{
		name: "Corrupt Tanks",
		image: "/resources/gamemodes/corrupted_tanks.webp",
		description: "See the unholy horrors that lay deep within the code.",
		players: 0,
		code: "crptTanks.json"
	},
	{
		name: "Void Walkers",
		image: "/resources/gamemodes/voidwalk.webp",
		description: "Travel into the beyond, past the boarders of the map. Beware the danger entities that lie far out.",
		players: 0,
		code: "vwalk.js"
	},
	{
		name: "Murica",
		image: "/resources/gamemodes/murica.webp",
		description: "WHAT THE FUCK IS A KILOMETER RAHHH 🦅🦅💥💥💥",
		players: 0,
		code: "murica.json"
	},
	{
		name: "Soccer",
		image: "/resources/gamemodes/soccer.webp",
		description: "Player soccer on one of two teams.",
		players: 0,
		code: "soccer.json"
	},
	{
		name: "Squidwards Tiki Island",
		image: "/resources/gamemodes/tiki.webp",
		description: "Vacation yayy",
		players: 0,
		code: "tiki.json"
	},
	{
		name: "Custom",
		image: "/resources/gamemodes/custom.webp",
		description: "A special gamemode reserved for modders to distinguish their rooms. By default, its a normal ffa map. Join the discord and ask for help learning to mod the game!",
		players: 0,
		code: "custom.js"
	},
]
let gamemodeEles = [];
function clearGamemodes() {
	for (let ele of gamemodeEles) ele.remove();
	gamemodeEles.length = 0;
}
function showGamemodes() {
	for (let gamemode of defaultGamemodes) {
		let template = roomFilter === "gallery" ? roomGalleryTemplate : roomListTemplate
		let ele = template.cloneNode(true)
		ele.style.display = "block";

		// Background/image
		if (gamemode.image !== "") {
			ele.style.background = `url(${gamemode.image})`
		}

		// Gamemode 
		ele.children[0].children[0].innerHTML = gamemode.name;

		// Player count
		ele.children[0].children[1].style.display = "none";

		// Room Code
		ele.children[0].children[2].style.display = "none";

		ele.onclick = function () {
			playerCount = gamemode.players;
			gamemodeName = gamemode.name;
			gamemodeImage = gamemode.image;
			gamemodeDescription = gamemode.description;
			selectedGamemode = gamemode.code;
			updateRoomInfo()
		}

		gamemodeEles.push(ele)
		template.parentElement.appendChild(ele);
	}
}

let roomEles = [];
function clearRooms() {
	for (let ele of roomEles) ele.remove();
	roomEles.length = 0;
}
async function showRooms() {
	let rooms = await multiplayer.getRooms()
	for (let room of rooms) {
		let template = roomFilter === "gallery" ? roomGalleryTemplate : roomListTemplate
		let ele = template.cloneNode(true)
		ele.style.display = "block";

		let gamemodeInfo = null;
		for (let gamemode of defaultGamemodes) {
			if (room.gamemodeCode === gamemode.code) {
				gamemodeInfo = gamemode;
				break;
			}
		}
		gamemodeInfo ??= room.gamemodeCode

		// Background/image
		if (gamemodeInfo.image) {
			ele.style.background = `url(${gamemodeInfo.image})`
		}

		// Gamemode 
		ele.children[0].children[0].innerHTML = gamemodeInfo.name || gamemodeInfo;

		// Player count
		ele.children[0].children[1].innerHTML = "Players: " + room.players

		// Room Code
		ele.children[0].children[2].innerHTML = room.id;

		ele.onclick = function () {
			playerCount = room.players;
			gamemodeName = gamemodeInfo.name || gamemodeInfo;
			gamemodeImage = gamemodeInfo.image || "";
			gamemodeDescription = gamemodeInfo.description || gamemodeInfo;
			selectedRoomId = room.id;
			updateRoomInfo()
		}

		roomEles.push(ele)
		template.parentElement.appendChild(ele);
	}
}

const joinSearch = document.getElementById("joinSearch")
joinSearch.oninput = async function () {
	const term = joinSearch.value.toLowerCase();
	if (createFilter === "host") {
		clearGamemodes()
		showGamemodes()
		for (let ele of gamemodeEles) {
			if (
				ele.children[0].children[0].innerHTML.toLowerCase().includes(term) === false &&
				ele.children[0].children[0].innerHTML.toLowerCase().replaceAll(" ", "").includes(term) === false
			) {
				ele.remove();
			}
		}
	} else if (createFilter === "join") {
		clearRooms()
		await showRooms()
		for (let ele of roomEles) {
			if (
				(ele.children[0].children[0].innerHTML.toLowerCase().includes(term) === false &&  // Gamemode Name
					ele.children[0].children[0].innerHTML.toLowerCase().replaceAll(" ", "").includes(term) === false) &&
				(ele.children[0].children[1].innerHTML.toLowerCase().includes(term) === false && // Player Count
					ele.children[0].children[1].innerHTML.toLowerCase().replaceAll(" ", "").includes(term) === false) &&
				(ele.children[0].children[2].innerHTML.toLowerCase().includes(term) === false && // Room Code
					ele.children[0].children[2].innerHTML.toLowerCase().replaceAll(" ", "").includes(term) === false)
			) {
				ele.remove()
			}
		}
	}
};


// Setup default state
(async () => {
	if (localStorage.getItem("roomFilter") === "list") {
		listFilter.click();
	} else { // "gallery" or default
		galleryFilter.click();
	}
	joinFilter.click();
	await showRooms();
	if (roomEles.length > 0) {
		roomEles[0].click(); // Join most popular room by default
	} else { // No joinable rooms
		hostFilter.click();
		clearRooms();
		showGamemodes();
		gamemodeEles[6].click() // Host default gamemode: 4tdm
	}
})();

document.getElementById("startButton").onclick = openJoinScreen

export { openJoinScreen }