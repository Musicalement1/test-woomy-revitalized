window.iceServers = [
	{ url: 'stun:stun.l.google.com:19302' },
];
window.iceServers.fetchTurnCredentials = async function() {
  try {
    const response = await fetch('/api/get-turn-credentials');
    if (!response.ok) {
      throw new Error(`Failed to fetch TURN credentials: ${response.statusText}`);
    }
    const turnConfig = await response.json();
    console.log("Successfully fetched TURN credentials.");
    return [turnConfig];
  } catch (error) {
    console.error("Could not get TURN credentials, continuing without them.", error);
    return []; // Return null so the connection can proceed without TURN
  }
}
class PeerWrapper {
	constructor(iceServersParam) {
		const servers = window.iceServers.concat(iceServersParam)
		this.peer = new Peer({config:{
			iceServers: servers,
			iceTransportPolicy: "relay"
		}});
		this.conn = null;
		this.id = null;
		this.onmessage = undefined;
		this.onclose = undefined;

		this.initialized = new Promise((resolve, reject) => {
			this.peer.on('open', id => {
				this.id = id;
				resolve();
			});
			this.peer.on('error', (err)=>{
				console.log("Error initlaizing peer")
				reject(err)
			});
		});

		this._readyResolve = null;
		this.ready = new Promise(res => this._readyResolve = res);

		this.peer.on('connection', conn => this._handleConnection(conn));
	}

	_handleConnection(conn) {
		conn.on('open', () => {
			this.conn = conn;
			this._setupConn(conn);
			this._readyResolve?.();
		});
		conn.on('error', console.error);
	}

	connectTo(targetId) {
		const conn = this.peer.connect(targetId);
		return new Promise((resolve, reject) => {
			conn.on('open', () => {
				this.conn = conn;
				this._setupConn(conn);
				this._readyResolve?.();
				resolve();
			});
			conn.on('error', reject);
		});
	}

	_setupConn(conn) {
		conn.on('data', data => {
			//console.log(`[Peer ${this.id}] Received:`, data)
			if(this.onmessage) this.onmessage(data)
		});
		conn.on('close', () => {
			console.log(`[Peer ${this.id}] Connection closed`);
			if (this.conn === conn) this.conn = null;
			if(this.onclose) this.onclose()
		});
	}

send(data) {
	if (this.conn?.open) {
		const dc = this.conn.dataChannel; // Access the raw WebRTC data channel
		const highWaterMark = 4 * 1024 * 1024; // 4MB threshold
		const checkInterval = 100; // ms

		const trySend = () => {
			if (dc.bufferedAmount < highWaterMark) {
				this.conn.send(data);
				// console.log(`[Peer ${this.id}] Sent:`, data);
			} else {
				setTimeout(trySend, checkInterval);
			}
		};

		trySend();
	} else {
		console.warn(`[Peer ${this.id}] No open connection`);
	}
}


	destroy() {
		this.conn?.close();
		this.peer.destroy();
		console.log(`[Peer ${this.id}] Destroyed`);
	}
}

export { PeerWrapper }