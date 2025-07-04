const wsLib = require("ws");
const http = require("http")

const server = http.createServer((req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "http://dev.localhost:3000");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
	// Handle preflight request
	if (req.method === "OPTIONS") {
		res.writeHead(204); // No Content
		res.end();
		return;
	}

	console.log(req.url, req.method)
	if (req.url === "/") {
		res.writeHead(200, { "Content-Type": "text/html" });
		res.end(`<h1>Room Manager Server is Running</h1>`);
		return;
	} else if (req.url === "/list") {
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
	} else if (req.url === "/join") {
		if (req.method !== "POST") {
			res.writeHead(405, { "Content-Type": "application/text" })
			res.end("Invalid method. Use POST.")
			return;
		}
		let body = "";
		req.on("data", chunk => body += chunk);
		req.on("end", () => {
			try {
				const { roomId, peerId } = JSON.parse(body);

				if (!peerId) {
					res.writeHead(400, { "Content-Type": "application/text" });
					res.end("You must include a peerID when joining");
					return;
				}

				const room = rooms.get(roomId);
				if (!room) {
					res.writeHead(404, { "Content-Type": "application/text" });
					res.end("That room doesn't exist, refresh the joinable rooms and try again.");
					return;
				}

				// Send the peerId to the room host over WebSocket
				room.ws.send(JSON.stringify({
					type: "playerJoin",
					data: peerId
				}));

				// Return success response
				res.writeHead(200);
				res.end();

			} catch (err) {
				console.error(err);
				res.writeHead(500, { "Content-Type": "application/json" });
				res.end(JSON.stringify({
					type: "status",
					data: "Internal server error"
				}));
			}
		});
		return;
	} else {
		res.writeHead(404);
		res.end("Not found");
		return;
	}
});

server.listen(3002, () => {
	console.log("Room Manager server listening on port 3002");
});


const wss = new wsLib.WebSocketServer({
	server: server,
	maxPayload: 1024 * 1024
});

function genCode() {
	let str = `${Date.now()}`;
	str = str.substring(str.length - 5);
	str += Math.random() * 1000 | 0;
	str += "0".repeat(8 - str.length);
	return Number(str).toString(16);
}

const rooms = new Map();

class Room {
	constructor(ws) {
		this.ws = ws;
		this.id = genCode()
		this.gamemodeCode = "4tdm.json"
		this.players = 1;
		rooms.set(this.id, this)
	}
	removeFromRooms() {
		rooms.delete(this.id)
	}
}

wss.on('connection', function connection(ws, req) {
	let type = req.url.split("/")[1];

	switch (type) {
		case "host":
			let room = new Room(ws);
			ws.on("close", room.removeFromRooms.bind(room))
			ws.on("message", (msg)=>{
				try{
					const { players, gamemodeCode } = JSON.parse(msg.toString());
					room.players = Number(players) || 0
					room.gamemodeCode = `${gamemodeCode}`.substring(0, 25)
				}catch(err){
					console.log("Error updating room information", err)
				}
			})
			ws.send(JSON.stringify({
				type: "hostRoomId",
				data: room.id
			}))
			break;
		default:
			// No other methods should be used
			ws.terminate()
			break;
	}
})

process.on('SIGTERM', () => {
	rooms.forEach((room) => room.shutDown("There was an issue with the room manager. Error message: " + shutdownMessage))
	process.exit();
});
