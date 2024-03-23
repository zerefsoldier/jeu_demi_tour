class Sockets {

    constructor() {
        this.socket = io.connect("/:8081");

        this.initEventsMessageReception();
    }

    getRooms() {
        this.socket.emit("get_rooms");
    }

    createRoom(room, playlist, playlistTitle, username) {
        this.socket.emit("create_room", JSON.stringify({room, playlist, playlistTitle, username}))
    }

    joinRoom(username, room) {
        this.socket.emit("join_room", JSON.stringify({username, room}));
    }

    gameStart(room) {
        this.socket.emit("game_start", room);
    }

    playerAnswerGood(playerName, points) {
        this.socket.emit("player_answer", JSON.stringify({playerName, points}))
    }

    useJoker(pointsIncrement, first) {
        this.socket.emit("use_joker", JSON.stringify({pointsIncrement, first}));
    }

    initEventsMessageReception() {
        this.socket.on("get_rooms", roomsFound);
        this.socket.on("join_room", joinedRoom);
        this.socket.on("users_room_list", usersOfRoomGuessed);
        this.socket.on("game_start", launchGame);
        this.socket.on("used_joker", jokerUsed);
    }
}
