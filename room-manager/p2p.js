const ws = require("ws");
const http = require('http');
const url = require('url');

const PORT = 3002;
const connections = new Map();
const rooms = new Set();

const server = http.createServer((req, res) => {
	const [api, type] = url.parse(req.url, true).pathname.split('/').filter(Boolean);
	if (api !== "p2p") {
		res.writeHead(404);
		res.end("Unsupported API");
		return;
	}

	// Handle CORS for fetch requests
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method === 'GET') {
		let data;
		switch (type) {
			case "list":
				data = Array.from(rooms);
				break;
		}

		if (data) {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify(data));
		} else {
			res.writeHead(404);
			res.end("Method does not exist");
		}
		return;
	}

	if (req.method === 'POST') {
		let body = '';
		req.on('data', chunk => body += chunk);
		req.on('end', async () => {
			let data;
			let json;
			try {
				json = JSON.parse(body);
			} catch (e) {
				res.writeHead(400);
				res.end('Invalid JSON');
				return;
			}

			switch (type) {
				case "connect":
					json.offer = JSON.parse(json.offer)
					const wsConn = connections.get(json.id);
					if (!wsConn) {
						res.writeHead(404);
						res.end("Connection not found");
						return;
					}
					data = await wsConn.sendOffer(json.offer);
					break;
			}

			if (data) {
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify(data));
			} else {
				res.writeHead(404);
				res.end("Method does not exist");
			}
		});
		return;
	}

	res.writeHead(405);
	res.end('Method not allowed');
});

// Attach WebSocket server to the same HTTP server
const wss = new ws.WebSocketServer({ server, maxPayload: 1024 * 1024 });

function genCode() {
	let str = `${Date.now()}`;
	str = str.substring(str.length - 5);
	str += Math.random() * 1000 | 0;
	str += "0".repeat(8 - str.length);
	return Number(str).toString(16);
}

wss.on('connection', function connection(ws, req) {
	ws.id = genCode();
	connections.set(ws.id, ws);
	ws.room = {
		id: ws.id,
		gamemode: "Test",
		players: 0
	};
	rooms.add(ws.room);

	const connectionRequests = new Map();
	ws.sendOffer = function (offer) {
		return new Promise((res, rej) => {
			let reqId = genCode()
			ws.send(JSON.stringify({ reqId, offer}));
			connectionRequests.set(reqId, res);
		});
	};

	ws.on('message', function (e) {
		try {
			const json = JSON.parse(e);
			switch (json.type) {
				case "answer":
					connectionRequests.get(json.reqId)(json.answer);
					connectionRequests.delete(json.reqId);
					break;
				case "info":
					ws.room.gamemode = json.gamemode || "Undefined";
					ws.room.players = Number(json.players) || 0;
					break;
				case "ping":
					break;
			}
		} catch (e) {
			console.log("Socket Error", e);
		}
	});
	ws.onclose = () => {
		connections.delete(ws.id);
		rooms.delete(ws.room);
	};
	ws.onerror = () => {
		connections.delete(ws.id);
		rooms.delete(ws.room);
	};
});

server.listen(PORT, () => {
	console.log(`🚀 Barebones HTTP + WebSocket signaling server running at http://localhost:${PORT}`);
});
