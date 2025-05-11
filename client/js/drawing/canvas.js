import { global } from "../global.js";
import { config } from "../config.js";
import {
	color,
	setColor,
	themes,
	specialColors,
	mixColors,
	getColor,
	getColorDark,
	getZoneColor,
	setColors,
	setColorsUnmix,
	setColorsUnmixB,
	hslToColor
} from "../colors.js"

let c = global._canvas._cv;
let ctx = c.getContext("2d");
ctx.imageSmoothingEnabled = false;

function _clearScreen(clearColor, alpha) {
	ctx.fillStyle = clearColor;
	ctx.globalAlpha = alpha;
	ctx.fillRect(0, 0, global._screenWidth, global._screenHeight);
	ctx.globalAlpha = 1;
}
const measureText = (() => {
	return (text, fontSize, twod = false, font = config.fontFamily) => {
		fontSize += config.fontSizeBoost - 8.75;
		ctx.font = (config.fontFamily === "Ubuntu" ? "bold" : "") + ' ' + fontSize + 'px ' + font;
		return (twod) ? {
			width: ctx.measureText(text).width,
			height: fontSize
		} : ctx.measureText(text).width;
	};
})();
const drawText = (function draw(text, x, y, size, fill, align = 'left', center = false, fade = 1, stroke = false, context = ctx, font = config.fontFamily) {
	let xx = 0;
	let yy = 0;
	size += config.fontSizeBoost - 8.75;
	let offset = size / 5;
	let ratio = 1;
	let transform = null;
	context.getTransform && (transform = ctx.getTransform(), ratio = transform.d, offset *= ratio);
	if (ratio !== 1) size *= ratio;
	context.font = (config.fontFamily === "Ubuntu" ? "bold" : "") + " " + size + 'px ' + font;
	let dim = ctx.measureText(text, false, font);
	// Redraw it
	switch (align) {
		case 'left':
			xx = offset;
			break;
		case 'center':
			xx = (dim.width + 2 * offset) / 2;
			break;
		case 'right':
			xx = (dim.width + 2 * offset) - offset;
	}
	yy = (size + 2 * offset) / 2;
	// Draw it
	context.lineWidth = ((size + 1) / config.fontStrokeRatio);
	context.font = (config.fontFamily === "Ubuntu" ? "bold" : "") + ' ' + size + 'px ' + font;
	context.textAlign = align;
	context.textBaseline = 'middle';
	context.strokeStyle = stroke ? stroke : color.black;
	context.fillStyle = fill;
	context.save();
	if (ratio !== 1) {
		context.scale(1 / ratio, 1 / ratio);
	}
	context.lineCap = 'miter';
	context.lineJoin = 'round';
	context.strokeText(text, xx + Math.round((x * ratio) - xx), yy + Math.round((y * ratio) - yy * (center ? 1 : 1.5)));
	context.fillText(text, xx + Math.round((x * ratio) - xx), yy + Math.round((y * ratio) - yy * (center ? 1 : 1.5)));
	context.restore();
});

function drawGuiRect(x, y, length, height, stroke = false) {
	if (stroke) ctx.strokeRect(x, y, length, height);
	else ctx.fillRect(x, y, length, height);
}

function drawGuiRoundRect(x, y, width, height, radius = 5, fill = true, stroke = false) {
	if (typeof radius === 'number') {
		radius = {
			tl: radius,
			tr: radius,
			br: radius,
			bl: radius
		};
	} else {
		let defaultRadius = {
			tl: 0,
			tr: 0,
			br: 0,
			bl: 0
		};
		for (let side in defaultRadius) radius[side] = radius[side] || defaultRadius[side];
	}
	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();
	if (fill) ctx.fill();
	if (stroke) {
		ctx.globalAlpha = 1;
		ctx.stroke();
	}
}

function drawGuiCircle(x, y, radius, stroke = false) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	stroke ? ctx.stroke() : ctx.fill();
}

function drawGUIPolygon(x, y, radius, sides, stroke = false) {
	ctx.beginPath();
	for (let i = 0; i < sides; i++) {
		let a = (Math.PI * 2 / sides) * i - Math.PI / 2;
		if (i === 0) ctx.moveTo(x + Math.cos(a) * radius, y + Math.sin(a) * radius);
		else ctx.lineTo(x + Math.cos(a) * radius, y + Math.sin(a) * radius);
	}
	ctx.closePath();
	stroke ? ctx.stroke() : ctx.fill();
}

function drawGuiLine(x1, y1, x2, y2) {
	ctx.beginPath();
	ctx.lineTo(Math.round(x1) + .5, Math.round(y1) + .5);
	ctx.lineTo(Math.round(x2) + .5, Math.round(y2) + .5);
	ctx.closePath();
	ctx.stroke();
}

function drawBar(x1, x2, y, width, color) {
	ctx.beginPath();
	ctx.lineTo(x1, y);
	ctx.lineTo(x2, y);
	ctx.lineWidth = width;
	ctx.strokeStyle = color;
	ctx.closePath();
	ctx.stroke();
}

export { ctx, drawBar, drawGUIPolygon, drawGuiCircle, drawGuiLine, drawGuiRect, drawGuiRoundRect, drawText, measureText, _clearScreen }