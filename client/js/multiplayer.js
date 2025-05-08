import { global } from "/js/global.js"
import { fasttalk } from "./fasttalk.js";

window.addMetaData = function (type=0, subtype=0, data){
    let arr = [];
    if(typeof(subtype) === "string"){
        arr = [type, 255]
        let i = 0;
        for(let i = 0; i < subtype.length; i++){
            arr.push(subtype.charCodeAt(i));
        }
        arr.push(0);
    }else{
        arr.push(type, subtype)
    }
    let u8arr = new Uint8Array(data.length + arr.length);
    u8arr.set(arr);
    u8arr.set(data, arr.length)
    return u8arr
}
window.getMetaData = function(u8arr){
    u8arr = new Uint8Array(u8arr);
    if(u8arr[1] === 255){
      let str = "";
      let i = 2;
      while(u8arr[i] !== 0){
        str += String.fromCharCode(u8arr[i++]);
      }
      return [u8arr[0], str, u8arr.slice(i+1)]
    }
    return [u8arr[0], u8arr[1], u8arr.slice(2)]
  },

window.creatingRoom = true;
window.connectedToWRM = false
window.roomManager = new WebSocket((window.location.protocol.includes("s")?"wss":"ws")+"://woomy-room-manager.glitch.me")
window.roomManager.onopen = ()=>{
  window.roomManager.binaryType = "arraybuffer"
  window.connectedToWRM = true
  console.log("Connected to WRM")
  setInterval(()=>{
    let data = new Uint8Array(2);
    data[0] = 0;
    data[1] = 1;
    window.roomManager.send(data);//ping
  }, 60000)
}

window.roomManager.onclose = () => {
  alert("Disconnected from the room manager most likely due to inactivity, please reload to reconnect!")
}

window.serverWorkerSetup = function () {
  window.serverWorker.postMessage({
    type: "startServer",
    server: {
      suffix: window.servers[global._selectedServer].rivetGamemode,
      gamemode: window.servers[global._selectedServer].serverGamemode,
    }
  });
  window.serverWorker.onmessage = function (msgEvent) {
    const data = msgEvent.data;
    switch (data.type) {
      case "clientMessage":
        // clientMessage, string
        window.roomManager.send(window.addMetaData(3, data.playerId, fasttalk.encode(data.data)));
      break;
      case "serverStarted":
        window.connectSocketToServer()
      break;
      case "updatePlayers":
        // WRM, RoomUpdatePlayers
        window.roomManager.send(window.addMetaData(1, 2, fasttalk.encode([data.data])))
      break;
      case "serverStartText":
        window.loadingTextStatus = data.text
        window.loadingTextTooltip = data.tip
      break;
    }
  };
}

window.WebSocket = (url, roomHost) => {
    return {
        set onmessage(v){
            window.clientMessage = v
        },
        set onopen(v) {
            v()
        },
        send: (e)=>{
            window.roomManager.send(window.addMetaData(2, 0, fasttalk.encode(e)))
        }
    }
}

window.roomManager.onmessage = (ea) => {
  let [type, subType, e] = window.getMetaData(ea.data);
  e = fasttalk.decode(e)
  
  switch(type){
    case 1: // WRM
      switch(subType){
        case 1: // Room Update
          window.onWRMRoomUpdate(JSON.parse(e[0]))
        break;
        case 2: // Room Created
          window.selectedRoomId = e[0]
        break;
        case 3: // Room Joined
          window.onRoomJoined()
        break;
        case 4: // Player Join
          window.serverWorker.postMessage({type:"playerJoin", playerId:e[0]})
        break;
        case 5: // Player disconnect
          window.serverWorker.postMessage({type:"playerDc", playerId:e[0]})
        break;
      }
    break;
      
    case 2: // Server Message
      window.serverWorker.postMessage({type:"serverMessage", data: [subType, e]})
    break;
      
    case 3: // Client Message
      window.clientMessage(e)
    break;
  }
}

