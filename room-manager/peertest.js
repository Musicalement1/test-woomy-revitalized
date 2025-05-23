const peerUrl = "127.0.0.1:3002"
const peerApi = "http://"+peerUrl+"/p2p"

class Peer {
	constructor() {
		this.pc = new RTCPeerConnection();
		this.dc = this.pc.createDataChannel("data");
		this.dc.onopen = () => console.log("Caller: DataChannel open");
		this.dc.onmessage = (e) => console.log("Caller received:", e.data);
		this.offer = undefined;

		this.pc.onicecandidate = (e) => {
			if (e.candidate) return;
			this.offer = JSON.stringify(this.pc.localDescription);
		};

		this.pc.createOffer().then(offer => this.pc.setLocalDescription(offer));
	}

	async joinRoom(id) {
		let res = await fetch(`${peerApi}/connect/`, {
			body: JSON.stringify({
				id: id,
				offer: this.offer
			}),
			method: "POST"
		})
		if(res.ok === false){
			window.alert("Error joining room.")
			console.error(res);
			return;
		}
		let answer = await res.json();
		this.pc.setRemoteDescription(new RTCSessionDescription(answer));
	}

	send(msg) {
		if (this.dc?.readyState === "open") this.dc.send(msg);
	}
}

class PeerManager {
	constructor() {
		this.peers = new Map();
		this.answers = new Map();
		this.ws = new WebSocket("ws://"+peerUrl)
		this.ws.onopen = () => {
			console.log("PeerManager connected to signaling server")
		}
		this.ws.onclose = (e) => {
			console.log("PeerManager signaling server connection closed", e)
		}
		this.ws.onerror = (e) => {
			console.log("PeerManager signaling server error", e)
		}
		this.ws.onmessage = (e) => {
			this.answerOffer(JSON.parse(e.data))
		}
	}

	answerOffer({reqId, offer}) {
		const peerId = this.peers.size;
		const pc = new RTCPeerConnection();

		pc.ondatachannel = (event) => {
			const dc = event.channel;

			dc.onopen = () => {
				console.log(`Receiver [${peerId}]: DataChannel open`);
			};

			dc.onmessage = (e) => {
				console.log(`Receiver [${peerId}] received:`, e.data);
			};

			this.peers.set(peerId, { pc, dc });
		};

		pc.onicecandidate = (e) => {
			if (e.candidate) return;
			this.ws.send(JSON.stringify({
				type: "answer",
				answer: this.answers.get(reqId),
				reqId: reqId
			}))
			this.answers.delete(reqId)
		};

		pc.setRemoteDescription(new RTCSessionDescription(offer)).then(() => pc.createAnswer()).then((answer)=>{
			this.answers.set(reqId, answer);
			pc.setLocalDescription(answer)
		});
	}

	sendTo(peerId, msg) {
		const peer = this.peers.get(peerId);
		if (peer?.dc?.readyState === "open") {
			peer.dc.send(msg);
		} else {
			console.warn(`Receiver: Peer "${peerId}" not ready.`);
		}
	}

	close(peerId) {
		const peer = this.peers.get(peerId);
		if (peer) {
			peer.dc?.close();
			peer.pc?.close();
			this.peers.delete(peerId);
			console.log(`Receiver: Closed peer "${peerId}"`);
		}
	}
}
