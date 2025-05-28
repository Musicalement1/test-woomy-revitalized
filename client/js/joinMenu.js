import { openModBrowser } from "./mainmenu.js";

const closeButton = document.getElementById("gameJoinClose");
closeButton.onclick = openJoinScreen
function openJoinScreen(close) {
	let mb = document.getElementById("gameJoinScreen")
	if (close === true || mb.style.top === "0%") {
		mb.style.top = "-100%";
	} else {
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
function updateRoomInfo(reset) {
	if (reset === true) {
		gamemodeName = "Welcome!"
		gamemodeImage = ""
		gamemodeDescription = "Select a room to join other players or click create and host a room for others to join."
	}
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
updateRoomInfo(true)

const nameInput = document.getElementById("nameInput")
nameInput.oninput = function () {
	console.log("name input", nameInput.value)
}

const tokenInput = document.getElementById("tokenInput")
tokenInput.oninput = function () {
	console.log("token input", tokenInput.value)
}

const joinButton = document.getElementById("joinActionButton")
joinButton.onclick = function () {
	openModBrowser(true);
	openJoinScreen(true);
	console.log("TODO: Implement game joining/creation")
}

const joinSearch = document.getElementById("joinSearch")

let createFilter = "join";
const joinFilter = document.getElementById("joinFilter")
const hostFilter = document.getElementById("hostFilter")
function createFilterClick() {
	if (typeof this === "string") createFilter = this;
	if (createFilter === "host") {
		joinFilter.classList.remove("joinSearchButtonUnselected")
		joinFilter.classList.add("joinSearchButtonSelected")
		hostFilter.classList.remove("joinSearchButtonSelected")
		hostFilter.classList.add("joinSearchButtonUnselected")
		createFilter = "join"
	} else {
		hostFilter.classList.remove("joinSearchButtonUnselected")
		hostFilter.classList.add("joinSearchButtonSelected")
		joinFilter.classList.remove("joinSearchButtonSelected")
		joinFilter.classList.add("joinSearchButtonUnselected")
		createFilter = "host"
	}
}
joinFilter.onclick = createFilterClick.bind("host");
hostFilter.onclick = createFilterClick.bind("join");

let roomFilter = "gallery"
const galleryFilter = document.getElementById("galleryFilter")
const listFilter = document.getElementById("listFilter")
function roomFilterClick() {
	if (typeof this === "string") roomFilter = this;
	if (roomFilter === "list") {
		galleryFilter.classList.remove("joinSearchButtonUnselected")
		galleryFilter.classList.add("joinSearchButtonSelected")
		listFilter.classList.remove("joinSearchButtonSelected")
		listFilter.classList.add("joinSearchButtonUnselected")
		roomFilter = "gallery"
	} else {
		listFilter.classList.remove("joinSearchButtonUnselected")
		listFilter.classList.add("joinSearchButtonSelected")
		galleryFilter.classList.remove("joinSearchButtonSelected")
		galleryFilter.classList.add("joinSearchButtonUnselected")
		roomFilter = "list"
	}
}
galleryFilter.onclick = roomFilterClick.bind("list");
listFilter.onclick = roomFilterClick.bind("gallery");

const defaultGamemodes = [
	{
		name: "FFA",
		image: "",
		description: "Everyone for themselves!",
		players: 0,
		code: ""
	}
]
let gamemodeEles = [];
function addTiltEffect(container) {
	container.addEventListener('mousemove', function (e) {
		const rect = container.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const xPercent = (x / rect.width) - 0.5;
		const yPercent = (y / rect.height) - 0.5;

		const shadowX = xPercent * 60;
		const shadowY = yPercent * 60;

		const rotateX = yPercent * -20;
		const rotateY = xPercent * 20;

		container.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
		container.style.boxShadow = `${-shadowX}px ${-shadowY}px 20px rgba(0, 0, 0, 0.2)`;
	});

	container.addEventListener('mouseleave', function () {
		container.style.transform = `rotateX(0deg) rotateY(0deg)`;
		container.style.boxShadow = `0px 0px 0px rgba(0, 0, 0, 0.2)`;
	});
}
function showGamemodes() {
	for (let ele of gamemodeEles) ele.remove();
	gamemodeEles.length = 0;
	if (roomFilter === "gallery") {
		for (let gamemode of defaultGamemodes) {
			let ele = roomGalleryTemplate.cloneNode(true)
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
			if (gamemode.code === "") {
				ele.children[0].children[2].style.display = "none";
			}
			ele.children[0].children[2].innerHTML = gamemode.code;

			ele.onclick = function () {
				playerCount = gamemode.players;
				gamemodeName = gamemode.name;
				gamemodeImage = gamemode.image;
				gamemodeDescription = gamemode.description;
				updateRoomInfo()
			}
			addTiltEffect(ele)

			roomGalleryTemplate.parentElement.appendChild(ele);
		}
	}
}
showGamemodes()

export { openJoinScreen }