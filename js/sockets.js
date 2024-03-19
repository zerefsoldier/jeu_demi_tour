class Sockets {

    constructor() {
        this.socket = io.connect("/:8081");

        this.initEventsMessageReception();
    }

    getRooms() {
        this.socket.emit("get_rooms");
    }

    createRoom(roomName, playlist) {
        this.socket.emit("create_room", JSON.stringify({roomName, playlist}))
    }

    playerAnswerGood(playerName, points) {
        this.socket.emit("player_answer", JSON.stringify({playerName, points}))
    }

    joinRoom(username, room) {
        this.socket.emit("join_room", JSON.stringify({username, room}));
    }

    initEventsMessageReception() {
        this.socket.on("get_rooms", roomsFound);
        this.socket.on("join_room", joinedRoom);
    }
}

const sockets = new Sockets();
