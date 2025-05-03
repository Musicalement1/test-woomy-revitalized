import { global } from "/js/global.js"
import { logger } from "/js/debug.js"
import { config } from "./config.js";

const util = {};
util._submitToLocalStorage = function (name) {
	localStorage.setItem(name + "Value", document.getElementById(name).value);
	localStorage.setItem(name + "Checked", document.getElementById(name).checked);
	return 0;
};
util._retrieveFromLocalStorage = function (name) {
	try {
		document.getElementById(name).value = localStorage.getItem(name + "Value");
		document.getElementById(name).checked = localStorage.getItem(name + "Checked") === "true";
	} catch (err) {

	}
	return 0;
};
util._handleLargeNumber = function (x, giveZero = false) {
	let cullZeroes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	if (cullZeroes && x == 0) return giveZero ? "0" : "";
	if (x < Math.pow(10, 3)) return "" + x.toFixed(0);
	if (x < Math.pow(10, 6)) return (x / Math.pow(10, 3)).toFixed(2) + "k";
	if (x < Math.pow(10, 9)) return (x / Math.pow(10, 6)).toFixed(2) + "m";
	if (x < Math.pow(10, 12)) return (x / Math.pow(10, 9)).toFixed(2) + "b";
	if (x < Math.pow(10, 15)) return (x / Math.pow(10, 12)).toFixed(2) + "t";
	if (x < Math.pow(10, 18)) return (x / Math.pow(10, 15)).toFixed(2) + "qd";
	if (x < Math.pow(10, 21)) return (x / Math.pow(10, 18)).toFixed(2) + "qt";
	if (x < Math.pow(10, 24)) return (x / Math.pow(10, 21)).toFixed(2) + "sx";
	if (x < Math.pow(10, 27)) return (x / Math.pow(10, 24)).toFixed(2) + "sp";
	if (x < Math.pow(10, 30)) return (x / Math.pow(10, 27)).toFixed(2) + "o";
	if (x < Math.pow(10, 33)) return (x / Math.pow(10, 30)).toFixed(2) + "n";
	if (x > 1e38) return "Infinity";
	if (isNaN(x)) return "NaN";
	return (x / Math.pow(10, 33)).toFixed(2) + "d";
};
util._fixNumber = number => !Number.isFinite(number) ? 0 : number;
util._cleanString = (string, length = -1) => {
	if (typeof string !== "string") {
		return "";
	}
	string = string.replace(/[\u0000\uFDFD\u202E\uD809\uDC2B\x00\x01\u200b\u200e\u200f\u202a-\u202e\ufdfd\ufffd-\uffff]/g, "").trim();
	if (length > -1) {
		string = string.slice(0, length);
	}
	return string;
}
util._formatTime = function (x, abbv = false) {
	let seconds = x % 60;
	x /= 60;
	x = Math.floor(x);
	let minutes = x % 60;
	x /= 60;
	x = Math.floor(x);
	let hours = x % 24;
	x /= 24;
	x = Math.floor(x);
	let days = x,
		y = "";

	function parse(z, text) { //+=
		if (z) y = y + (y === "" ? "" : (abbv ? " " : ", ")) + z + (abbv ? "" : " ") + text + (z > 1 ? (abbv ? "" : "s") : "");
	}
	parse(days, abbv ? "d" : "day");
	parse(hours, abbv ? "h" : "hour");
	parse(minutes, abbv ? "m" : "minute");
	parse(seconds, abbv ? "s" : "second");
	if (y === "") y = abbv ? "0 s" : "less than a second";
	return y;
};
util._addArticle = function (string) { //aeiouAEIOU
	return (/[aeiouxAEIOUX]/.test(string[0]) ? "an " + string : "a " + string);
};
util._formatLargeNumber = function (x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
util._pullJSON = async function (filename, responseType = "json", filetypeOverride) {
	let request = new XMLHttpRequest(),
		url = await getFullURL(servers[global._selectedServer], false) + "json/" + filename + (filetypeOverride !== undefined ? filetypeOverride : ".json") + "?a=" + Date.now();
	logger.info("Loading JSON from " + url);
	request.responseType = responseType;
	return new Promise(function (resolve, reject) {
		request.open("GET", url);
		request.onload = function () {
			resolve(request.response);
			logger.info("JSON load complete.");
		};
		request.onerror = function () {
			reject(request.statusText);
			logger.warn("JSON load failed!");
			logger.norm(request.statusText);
		};
		request.send();
	});
};
util._getRatio = () => Math.max(global._screenWidth, 16 * global._screenHeight / 9) / _player._renderv;
util._getScreenRatio = () => Math.max(global._screenWidth, 16 * global._screenHeight / 9) / global._screenSize;
util._getSpecialNameInfoById = id => [
	["#2e6d9b", "#579acb", `'Merienda', cursive`, 1],
	["#E673C4", "#ff00d0", `"Courier New", Courier, monospace`, 1],
	["#EE8833", "#784216", `coffee`, 1]
][id];


// TODO: Add to rendering file
function resizeEvent(e) {
	if(!global._canvas) return
	let scale = window.devicePixelRatio;
	scale *= [0.2, 0.5, 0.75, 1, 0.08][["Very Low (35%)", "Low (50%)", "Medium (75%)", "High (100%)", "PixelMode (8%)"].indexOf(config.resolutionScale)];
	global._canvas._cv.width = global._screenWidth = window.innerWidth * scale;
	global._canvas._cv.height = global._screenHeight = window.innerHeight * scale;
	global._ratio = scale;
	if(!global.mobile)document.getElementById('gameCanvas').focus();
	global._screenSize = Math.min(1920, Math.max(window.innerWidth, 1280));
}


export { util, resizeEvent }