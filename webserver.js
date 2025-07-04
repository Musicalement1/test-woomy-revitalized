// =================================================================
// 1. DEPENDENCIES - All requires from both servers
// =================================================================
const http = require("http");
const wsLib = require("ws");
const fs = require("node:fs");
const path = require("node:path");

const PORT = 80;

// =================================================================
// 2. SERVER A LOGIC - Room Management and WebSockets
// =================================================================

const rooms = new Map();

function genCode() {
	let str = `${Date.now()}`;
	str = str.substring(str.length - 5);
	str += Math.random() * 1000 | 0;
	str += "0".repeat(8 - str.length);
	return Number(str).toString(16);
}

class Room {
	constructor(ws) {
		this.ws = ws;
		this.id = genCode();
		this.gamemodeCode = "4tdm.json";
		this.players = 1;
		rooms.set(this.id, this);
	}
	removeFromRooms() {
		console.log(`Room ${this.id} closed.`);
		rooms.delete(this.id);
	}
}

// =================================================================
// 3. COMBINED SERVER CREATION
// =================================================================

// The main request handler that decides what to do with each request
const handleRequest = (req, res) => {
	const url = new URL(req.url, `http://${req.headers.host}`);
	const pathname = url.pathname;

	console.log(`[Request] ${req.method} ${pathname}`);

	// --- API ROUTING (from Server A) ---
	// We check for specific API paths first.
	if (pathname.startsWith("/api/")) {
		// Set CORS headers for all API responses
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type");

		// Handle preflight OPTIONS request for CORS
		if (req.method === "OPTIONS") {
			res.writeHead(204); // No Content
			res.end();
			return;
		}

		if (pathname === "/api/list") {
			res.writeHead(200, { "Content-Type": "application/json" });
			const list = [];
			for (let [id, room] of rooms) {
				list.push({
					id: id,
					gamemodeCode: room.gamemodeCode,
					players: room.players
				});
			}
			res.end(JSON.stringify(list));
			return;

		} else if (pathname === "/api/join") {
			if (req.method !== "POST") {
				res.writeHead(405, { "Content-Type": "text/plain" });
				res.end("Invalid method. Use POST.");
				return;
			}
			let body = "";
			req.on("data", chunk => body += chunk);
			req.on("end", () => {
				try {
					const { roomId, peerId } = JSON.parse(body);
					if (!peerId) {
						res.writeHead(400, { "Content-Type": "text/plain" });
						res.end("You must include a peerID when joining");
						return;
					}
					const room = rooms.get(roomId);
					if (!room) {
						res.writeHead(404, { "Content-Type": "text/plain" });
						res.end("That room doesn't exist.");
						return;
					}
					// Send the peerId to the room host over WebSocket
					room.ws.send(JSON.stringify({ type: "playerJoin", data: peerId }));
					res.writeHead(200, { "Content-Type": "text/plain" });
					res.end("Join request sent to host.");
				} catch (err) {
					console.error("Error in /api/join:", err);
					res.writeHead(500, { "Content-Type": "text/plain" });
					res.end("Internal server error.");
				}
			});
			return;

		} else if (pathname === "/api/status") {
            // A simple status endpoint instead of the old root "/" one
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "Room Manager is running" }));
            return;
        }

	}

	// --- STATIC FILE SERVING (from Server B) ---
	// If the request is not an API call, we fall back to serving static files.
	
    // If the requested URL is '/', serve index.html
	const requestedPath = pathname === '/' ? '/client/index.html' : pathname;
	const filePath = path.join(__dirname, requestedPath);

	// Basic security: prevent accessing files outside the project directory
	if (!filePath.startsWith(__dirname)) {
		res.writeHead(403, { 'Content-Type': 'text/plain' });
		res.end('Forbidden');
		return;
	}

	fs.readFile(filePath, (err, data) => {
		if (err) {
			if (err.code === 'ENOENT') {
				// If file not found in root, try looking in /client/
				const clientFilePath = path.join(__dirname, 'client', pathname);
				if (filePath !== clientFilePath) { // Avoid infinite loop
					fs.readFile(clientFilePath, (clientErr, clientData) => {
						if (clientErr) {
							res.writeHead(404, { 'Content-Type': 'text/plain' });
							res.end('Not Found');
						} else {
							sendFile(res, clientFilePath, clientData);
						}
					});
				} else {
					res.writeHead(404, { 'Content-Type': 'text/plain' });
					res.end('Not Found');
				}
			} else {
				res.writeHead(500, { 'Content-Type': 'text/plain' });
				res.end(`Server Error: ${err.message}`);
			}
		} else {
			sendFile(res, filePath, data);
		}
	});
};

// Helper function to send a file with the correct content type
function sendFile(res, filePath, data) {
	const ext = path.extname(filePath);
	let contentType = 'text/plain';
	const mimeTypes = {
		'.html': 'text/html',
		'.css': 'text/css',
		'.js': 'text/javascript',
		'.json': 'application/json',
		'.png': 'image/png',
		'.jpg': 'image/jpeg',
		'.gif': 'image/gif',
		'.svg': 'image/svg+xml',
	};
	contentType = mimeTypes[ext] || contentType;
	res.writeHead(200, { 'Content-Type': contentType });
	res.end(data);
}

// Create the single HTTP server with our combined handler
const server = http.createServer(handleRequest);


// =================================================================
// 4. WEBSOCKET SERVER ATTACHMENT
// =================================================================

// Attach the WebSocket server to our single HTTP server
const wss = new wsLib.WebSocketServer({
	server: server,
	maxPayload: 1024 * 1024
});

wss.on('connection', function connection(ws, req) {
	// The path for WebSocket connections is determined by the client
	// e.g., ws://your.server.com/host
	const type = req.url.split("/")[1];
	console.log(`[WebSocket] Connection attempt for type: ${type}`);

	switch (type) {
		case "host":
			let room = new Room(ws);
			console.log(`New room hosted with ID: ${room.id}`);

			ws.on("close", room.removeFromRooms.bind(room));
			ws.on("message", (msg) => {
				try {
					const { players, gamemodeCode } = JSON.parse(msg.toString());
					if (players !== undefined) room.players = Number(players) || 0;
					if (gamemodeCode) room.gamemodeCode = `${gamemodeCode}`.substring(0, 25);
				} catch (err) {
					console.log("Error updating room information:", err);
				}
			});

			ws.send(JSON.stringify({
				type: "hostRoomId",
				data: room.id
			}));
			break;
		default:
			// If the WebSocket connection type is unknown, terminate it.
			console.log(`[WebSocket] Unknown connection type "${type}". Terminating.`);
			ws.terminate();
			break;
	}
});


// =================================================================
// 5. START THE SERVER
// =================================================================

server.listen(PORT, () => {
	console.log(`🚀 Combined server running on ${PORT}`);
	console.log(`   - Serving static files from: ${path.join(__dirname, 'client')}`);
	console.log(`   - API endpoints available at /api/*`);
    console.log(`   - WebSocket connections available for hosts at /host`);
});