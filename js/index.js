(() => {
    let themeSongs = [];
    let currentThemeSongGuess = 0;
    let timerId = null;
    let pointsNumber = 0;
    let playerName = null;
    let joker = null;

    function isMultiplayer() {
        return  $(".mode.selected").attr("data-mode") == "2";
    }

    function resetSoloPlayer() {
        $("#rooms, #roomUsers").html("");
        $("#playlists").removeClass("d-none");
        $("#playlistHeader, #playlistSuits").html("");

        initPlaylists();
    }

    function resetMultiplayer() {
        $("#playlists").html("");
        sockets.getRooms();
    }

    function initMode() {
        $(".mode").bind("click", changeMode);
    }

    function changeMode(evt) {
        $(".mode.selected").removeClass("selected");
        $(evt.currentTarget).addClass("selected");

        const mode = $(evt.currentTarget).attr("data-mode");

        if (mode == "1") resetSoloPlayer();
        else resetMultiplayer();
    }

    function initGame() {
        $("#modes").removeClass("d-none");
        initPlaylists();
    }

    async function initPlaylists() {
        $("#informationPanel").remove();
        const response = await getPlaylists();
        
        $("#playlists").html(Mustache.to_html($("#playlistThemeTemplate").html(), response));
        $(".playlist").bind("click", playlistChoosed);
    }

    async function getPlaylists() {
        const request = await fetch("/php/controllers/getPlaylists.php");
        const response = await request.json();

        return response;
    }

    async function playlistChoosed(evt) {
        themeSongs = await getPlaylistSongs($(evt.currentTarget).attr("data-code"));

        initPlaylistHeader();
        $("#playlistSuits").html(Mustache.to_html($("playlistSongsTemplate").html(), themeSongs[currentThemeSongGuess]));
    }

    async function getPlaylistSongs(playlistCode) {
        const request = await fetch(`/php/controllers/getPlaylist.php?playlisyt=${playlistCode}`);
        const response = await request.json();

        return response;
    }

    function initPlaylistHeader() {
        $("#playlists").addClass("d-none");
        $(".playlist").unbind("click", playlistChoosed);

        $("#playlistHeader").html(Mustache.to_html($("#initPlaylistHeader").html(), {
            currentMusicNumber: currentThemeSongGuess + 1,
            musicNumber: themeSongs[currentThemeSongGuess].musicNumber,
            song: themeSongs[currentThemeSongGuess].song,
            pointsNumber
        }));

        if (!isMultiplayer()) launchTimerAndHelp();
    }

    function launchTimerAndHelp() {
        $("#help").bind("click", help);
        $("#playlistHeaderForm").on("submit", formSent);
        reduceTimer();
    }

    async function help() {
        const request = await fetch("/php/controllers/getPlaylistAnswerSuggestion.php", {
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
        $("#playlistHeaderForm .artist:eq(0)").val(responseParts[0]);
        $("#playlistHeaderForm .music:eq(0)").val(responseParts[1]);
        $("#playlistHeaderForm").submit();
    }

    function getPercentage(val1, val2) {
        return val1 / val2 * 100;
    }

    async function launchNextOrEndGame() {
        const progressionPercentage = getPercentage(currentThemeSongGuess + 1, themeSongs.length).toFixed(0);
        if (isMultiplayer() && (progressionPercentage == 25 || progressionPercentage == 50 || progressionPercentage == 75)) {
            const request = await fetch("/php/controllers/getJoker.php");
            joker = await request.json();
            displayJoker();
        } else {
            joker = null;
            $("#joker").addClass("d-none");
        }

        if (currentThemeSongGuess == themeSongs.length) endGame();
        else launchNextSongToGuess();
    }

    function displayJoker(joker) {
        $("#joker").html(Mustache.to_html($("#jokerTemplate").html(), joker));
        $("#joker").removeClass("d-none");
    }

    function formSent(evt) {
        evt.preventDefault();

        fetch("/php/controllers/getPlaylistGoodAnswer.php", {
            method: "POST",
            body: createFormData(evt)
        }).then(response => {
            if (response.ok) {
                const pointsIncrement = getPointsIncrement(evt);
                pointsNumber += pointsIncrement;

                $("#pointsNumber").text(pointsNumber);
                $(".answerSuggestion").remove();

                if (isMultiplayer()) {
                    sockets.playerAnswerGood(playerName, pointsNumber);
                    if (joker?.type == "4") sockets.useJoker(pointsIncrement, joker.first);
                }
                launchNextOrEndGame();
            }

            if ($(".answerSuggestion").length != 0) {
                $(".answerSuggestion").remove();
                launchNextOrEndGame();
            }
        }).catch(() => {
            // En cas de mauvaise transmission, possibilité de faire un truc
        });
    }

    function getPointsIncrement(evt) {
        if ($(".answerSuggestion").length != 0) return 1;

        const artist = $(evt.currentTarget).find(".artist:eq(0)").val();
        const music = $(evt.currentTarget).find(".music:eq(0)").val();

        if (artist.length == 0 || music.length == 0) return 2;
        else if (artist.length > 0 && music.length > 0) return 3;
    }

    function createFormData(evt) {
        var fd = new FormData();
        fd.append("playlist", themeSongs[currentThemeSongGuess].playlist);
        fd.append("song", themeSongs[currentThemeSongGuess].song);
        fd.append("artist", $(evt.currentTarget).find(".artist:eq(0)").val().trim());
        fd.append("music", $(evt.currentTarget).find(".music:eq(0)").val().trim());

        return fd;
    }

    function createHelpFormData() {
        var fd = new FormData();
        fd.append("playlist", themeSongs[currentThemeSongGuess].playlist);
        fd.append("song", themeSongs[currentThemeSongGuess].song);

        return fd;
    }

    function reduceTimer(basicCounter = 129) {
        if (basicCounter > 0) {
            timerId = setTimeout(() => {
                $("#timer").css( "width", `${basicCounter}px`);

                reduceTimer(--basicCounter);
            }, 1000);
        } else launchNextSongToGuess();
    }

    function launchNextSongToGuess() {
        clearTimeout(timerId);
        $("#playlistHeaderForm .artist:eq(0)").val("");
        $("#playlistHeaderForm .music:eq(0)").val("");

        currentThemeSongGuess++;
        initPlaylistHeader();
    }

    function endGame() {
        pointsNumber = 0;
        currentThemeSongGuess = 0;
        clearTimeout(timerId);

        if (!isMultiplayer()) resetSoloPlayer();
        else resetMultiplayer();
    }

    initMode();
    $("#downloadPlaylists").click(initGame);

    // Sockets events

    async function roomsFound(rooms) {
        const playlists = await getPlaylists();
        $("#rooms")
            .html(Mustache.to_html($("#roomCreateTemplate").html(), playlists))
            .append(Mustache.to_html($("#roomsTemplates").html(), JSON.parse(rooms)));

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
        const playlistTitle = $("#playlistsRoom").find(":selected").attr("data-title");
        const username = askUsername();

        sockets.createRoom(roomName, playlist, playlistTitle, username);
        initPlaylistHeader();
        document.getElementById("audioGuessSong").pause();

        $("#launchMultiplayer").bind("click", () => {
            setTimeout(() => {
                document.getElementById("audioGuessSong").play();
                launchTimerAndHelp();
            }, 20);

            sockets.gameStart(roomName);
            $(this).remove();
        });
    }

    async function chooseRoom(evt) {
        const username = askUsername();

        sockets.joinRoom(username, $(evt.currentTarget).attr("data-room"));
        themeSongs = await getPlaylistSongs($(evt.currentTarget).attr("data-playlist"));

        initPlaylistHeader();
        document.getElementById("audioGuessSong").pause();
    }

    function usersOfRoomGuessed(users) {
        $("#roomUsers").append(Mustache.to_html($("#usersOnlineTemplate".html(), JSON.parse(users))));
    }

    function joinedRoom(user) {
        $("#roomUsers").append(Mustache.to_html($("#usersOnlineTemplate".html(), [user])));
    }

    function launchGame() {
        document.getElementById("audioGuessSong").play();
        launchTimerAndHelp();
    }

    function jokerUsed(pointsIncrement, first) {
        pointsNumber -= pointsIncrement;

        if (first) joker = null;
    }

    const sockets = Object.freeze(new Sockets());
})();
