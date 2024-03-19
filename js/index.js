let themeSongs = [];
let currentThemeSongGuess = 0;
let timerId = null;
let pointsNumber = 0;
let playerName = null;

function initMode() {
    $(".mode").bind("click", changeMode);
}

function isMultiplayer() {
    return  $(".mode.selected").attr("data-mode") == "2";
}

function changeMode(evt) {
    $(".mode.selected").removeClass("selected");
    $(evt.currentTarget).addClass("selected");

    const mode = $(evt.currentTarget).attr("data-mode");

    if (mode == "1") {
        $("#rooms").html("");
        initPlaylists();
    } else {
        sockets.getRooms();
    }
}

async function getPlaylists() {
    const request = await fetch("/php/controllers/getPlaylists.php");
    const response = await request.json();

    return response;
}

async function initPlaylists() {
    const response = await getPlaylists();
    
    $("#playlists").html(Mustache.to_html($("#playlistThemeTemplate").html(), response));
    $(".playlist").bind("click", playlistChoosed);
}

async function playlistChoosed(evt) {
    themeSongs = await getPlaylistSongs($(evt.currentTarget).attr("data-code"));

    initPlaylistHeader();
    $("#playlistSuits").html(Mustache.to_html($("playlistSongsTemplate").html(), themeSongs[currentThemeSongGuess]));
}

async function getPlaylistSongs(playlistCode) {
    const request = await fetch(`/php/controllers/getPlaylists.php?playlisyt=${playlistCode}`);
    const response = await request.json();

    return response;
}

function initPlaylistHeader() {
    $("#playlists").addClass("d-none");

    $("#playlistHeader").html(Mustache.to_html($("#initPlaylistHeader").html(), {
        currentMusicNumber: currentThemeSongGuess + 1,
        musicNumber: themeSongs[currentThemeSongGuess].musicNumber,
        song: themeSongs[currentThemeSongGuess].song,
        pointsNumber
    }));

    $("#help").bind("click", help);
    $("#playlistHeaderForm").on("submit", formSent);
    $(".playlist").unbind("click", playlistChoosed);

    reduceTimer();
}

async function help() {
    const request = await fetch({
        url: "/php/controllers/getPlaylistAnswerSuggestion.php",
        method: "POST",
        body: createHelpFormData()
    });
    const response = await request.json();
    
    $("#playlistSuits").html(Mustache.to_html($("#playlistSuggestionAnswer").html(), response));
    $(".answerSuggestion").bind("click", answerSuggestionClicked);
}

function answerSuggestionClicked(evt) {
    $(".answerSuggestion").unbind("click", answerSuggestionClicked);

    const responseParts = $(evt.currentTarget).text().split("/");
    $(evt.currentTarget).find("artist:eq(0)").text(responseParts[0]);
    $(evt.currentTarget).find("music:eq(0)").text(responseParts[1]);
    $("#playlistHeaderForm").submit();
}

function formSent(evt) {
    evt.preventDefault();

    fetch({
        url: "/php/controllers/getPlaylistGoodAnswer.php",
        method: "POST",
        body: createFormData(evt)
    }).then(() => {
        // En cas de succès gérer les points etc...
        currentThemeSongGuess++;
        pointsNumber += getPointsIncrement();
        
        initPlaylistHeader();
        $(".answerSuggestion").remove();

        if (isMultiplayer()) sockets.playerAnswerGood(playerName, pointsNumber);
    }).catch(() => {
        // En cas de défaite réinitialiser les champs
        $(evt.currentTarget).find("artist:eq(0)").text("");
        $(evt.currentTarget).find("music:eq(0)").text("");
    });
}

function getPointsIncrement() {
    if ($(".answerSuggestion").length == 0) return 1;

    const artist = $(evt.currentTarget).find("artist:eq(0)");
    const music = $(evt.currentTarget).find("music:eq(0)");

    if (artist.length == 0 || music.length == 0) return 2;
    else if (artist.length > 0 && music.length > 0) return 3;
}

function createFormData(evt) {
    var fd = new FormData();
    fd.append("playlist", themeSongs[currentThemeSongGuess].playlist);
    fd.append("song", themeSongs[currentThemeSongGuess].song);
    fd.append("artist", $(evt.currentTarget).find("artist:eq(0)").text().trim());
    fd.append("music", $(evt.currentTarget).find("music:eq(0)").text().trim());

    return fd;
}

function createHelpFormData() {
    var fd = new FormData();
    fd.append("playlist", themeSongs[currentThemeSongGuess].playlist);
    fd.append("song", themeSongs[currentThemeSongGuess].song);

    return fd;
}

function reduceTimer(basicCounter = 89) {
    if (basicCounter > 0) {
        timerId = setTimeout(() => {
            $("#timer").style(`border: ${basicCounter}px solid red`);

            reduceTimer(--basicCounter);
        }, 1000);
    } else launchNextSongToGuess();
}

function launchNextSongToGuess() {
    clearTimeout(timerId);

    currentThemeSongGuess++;
    initPlaylistHeader();
}

initMode();
initPlaylists();

// Sockets events

async function roomsFound(rooms) {
    const playlists = await getPlaylists();
    $("#rooms")
        .html(Mustache.to_html($("#roomCreateTemplate").html(), playlists))
        .append(Mustache.to_html($("#roomsTemplates").html(), rooms));

    $("#roomToCreate").bind("submit", createPersonnalRoom);
    $(".room").bind("click", chooseRoom);
}

function askUsername() {
    const username = prompt("Entrez votre nom de joueur ici");
    
    playerName = username;
    return username;
}

function createPersonnalRoom() {
    const roomName = $("#roomToCreate input[type='text']:eq(0)").val();
    const playlist = $("#playlistsRoom").find(":selected").val();
    const username = askUsername();

    sockets.createRoom(roomName, playlist, username);
}

async function chooseRoom(evt) {
    const username = askUsername();

    sockets.joinRoom(username, $(evt.currentTarget).attr("data-room"));
    themeSongs = await getPlaylistSongs($(evt.currentTarget).attr("data-playlist"));
}

function joinedRoom(users) {
   $("#roomUsers").html(Mustache.to_html($("#usersOnlineTemplate".html(), users)));
}
