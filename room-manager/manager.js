const fasttalk = require("./fasttalk.js");
const wsLib = require("ws");

let metaData = {
  get: function(u8arr){
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
  set: function (type=0, subtype=0, data){
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
}


const shutdownMessage = "Unknown. Maybe maintenance or server restart."

const wss = new wsLib.WebSocketServer({
  port: 3001,
  maxPayload: 1024 * 1024
});

function genCode(){
    let str = `${Date.now()}`;
    str = str.substring(str.length-5);
    str += Math.random() * 1000 | 0;
    str += "0".repeat(8-str.length);
    return Number(str).toString(16);
}

const rooms = new Map();
class Room{
  constructor(ownerWs, gamemode){
    this.ownerWs = ownerWs
    this.gamemode = gamemode
    this.type = "basic"
    
    this.playerCount = 0
    this.id = genCode();
    
    this.players = new Map();
  } 
  
  addPlayer(ws){
    this.players.set(ws.data.playerId, ws)
  }
  
  removePlayer(ws, reason="You've been kicked"){
    this.players.delete(ws.data.playerId)
    // clientMessage
    ws.send(metaData.set(3, 0, fasttalk.encode(["P", reason])));
  }
  
  broadcast(msg){
    this.players.forEach((player)=>{
      player.send(msg);
    })
  }
  
  shutDown(reason="The room has been shutdown"){
    this.broadcast(metaData.set(3, 0, fasttalk.encode(["P", reason])));
    rooms.delete(this.id)
  }
}

function onWsLeave(){
  if(this.room){
    if(this.room.ownerWs === this){
      this.room.shutDown("The room owner has left the game.")
    }else{
      // WRM, playerDc
      this.room.ownerWs.send(metaData.set(1, 5, fasttalk.encode([this.data.playerId])));
    }
  }
}

wss.on('connection', function connection(ws, req) {
  console.log(req.headers.origin)

  ws.onclose = onWsLeave
  ws.onerror = onWsLeave
  
  ws.data = {
    playerId: genCode(),
    room: undefined
  }
  
  ws.on('message', function(ea) {
    try{
    let [type, subtype, e] = metaData.get(ea);
      
    switch(type){
      case 0:
        return;
      break;
      case 1: // WRM
        switch(subtype){
          case 1:
            const tempRooms = []
            
            rooms.forEach((room)=>{
              tempRooms.push({
                id: room.id,
                gamemode: room.gamemode,
                playerCount: room.playerCount,
                type: room.type
              })
            })
            // WRM, roomUpdate
            ws.send(metaData.set(1, 1, fasttalk.encode([JSON.stringify(tempRooms)])))
          break;
            
          case 2:// Room Update Players 
            e = fasttalk.decode(e);
            if(ws.room === undefined){
              ws.send(metaData.set(3, 0, fasttalk.encode(["P", "Sent a room packet while not being in a room."])));
              ws.terminate()
              return;
            }else if(ws.room.ownerWs !== ws){
              ws.room.removePlayer(ws, "Sent room owner permission level packet as the non-room owner.")
              ws.terminate()
              return;
            }else if(typeof e[0] !== "number" || e[0] > 100 || e[0]<0){
              ws.room.removePlayer(ws, "Over playercap of 100")
              ws.terminate()
              return;
            }

            ws.room.playerCount = e[0] || 0
          break;
            
          case 3: // Room Create
            e = fasttalk.decode(e);
            const gamemode = e.shift()
            const specialRoomToken = e.shift()
            
            if(typeof gamemode !== "string" || gamemode > 45){
              ws.room.removePlayer(ws, "Invalid gamemode")
              ws.terminate()
              return;
            }
            
            let room = new Room(ws, gamemode)
            
            room.addPlayer(ws)
            ws.room = room
            
            rooms.set(room.id, room)
            
            // WRM, roomCreated
            ws.send(metaData.set(1, 2, fasttalk.encode([room.id])))
            // WRM, playerJoin
            ws.send(metaData.set(1, 4, fasttalk.encode([ws.data.playerId])))
          break;
            
          case 4: // Room Join
            if(ws.room !== undefined){
              ws.send(metaData.set(3, 0, fasttalk.encode(["P", "Cannot join a room whilst already in a room."])));
              ws.terminate()
              return;
            }
            let room2 = rooms.get(fasttalk.decode(e)[0])
            if(room2){
              ws.room = room2
              room2.addPlayer(ws)
              // WRM, roomJoined
              ws.send(metaData.set(1, 3, fasttalk.encode([0])))
              // WRM, playerJoin
              ws.room.ownerWs.send(metaData.set(1, 4, fasttalk.encode([ws.data.playerId])))
              return;
            }
            
            ws.send(metaData.set(3, 0, fasttalk.encode(["P", "The requested room is unavailable."])));
            ws.terminate()
            return;
          break;
        }
      break;
      case 2: // serverMessage
        if(ws.room === undefined){
          ws.send(metaData.set(3, 0, fasttalk.encode(["P", "Sent a room packet while not being in a room."])));
          ws.terminate()
          return;
        }

        // serverMessage, nothing
        ws.room.ownerWs.send(metaData.set(2, ws.data.playerId, e))
      break;
      case 3: // clientMessage
        if(ws.room === undefined){
          ws.send(metaData.set(3, 0, fasttalk.encode(["P", "Sent a room packet while not being in a room."])));
          ws.terminate()
          return;
        }else if(ws.room.ownerWs !== ws){
          ws.room.removePlayer(ws, "Sent room owner permission level packet as the non-room owner.")
          ws.terminate()
          return;
        }
        
        const player = ws.room.players.get(subtype);
        if(!player) return;
        player.send(metaData.set(3, 0, e))
      break;
    }
    }catch(err){
      ws.send(metaData.set(3, 0, fasttalk.encode(["P", "Error handling packet."])));
      console.error(err)
      ws.terminate();
    }
  });
});

process.on('SIGTERM', () => {
  rooms.forEach((room)=>room.shutDown("There was an issue with the room manager. Error message: "+shutdownMessage))
  process.exit();
});
