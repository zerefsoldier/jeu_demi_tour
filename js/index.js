let themeSongs = [];
let currentThemeSongGuess = 0;
let timerId = null;
let pointsNumber = 0;

async function init() {
    const request = await fetch("/php/controllers/getPlaylists.php");
    const response = await request.json();

    $("#playlists").html(Mustache.to_html($("#playlistThemeTemplate").html(), response));
    $(".playlist").bind("click", playlistChoosed);
}

async function playlistChoosed(evt) {
    const playlistCode = $(evt.currentTarget).attr("data-code");
    const request = await fetch(`/php/controllers/getPlaylists.php?playlisyt=${playlistCode}`);

    themeSongs = await request.json();

    initPlaylistHeader();
    $("#playlistSuits").html(Mustache.to_html($("playlistSongsTemplate").html(), themeSongs[currentThemeSongGuess]));
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
        const pointsIncreasement = $(".answerSuggestion").length == 0 ? 2 : 1;
        currentThemeSongGuess++; pointsNumber += pointsIncreasement;
        
        initPlaylistHeader();
        $(".answerSuggestion").remove();
    }).catch(() => {
        // En cas de défaite réinitialiser les champs
        $(evt.currentTarget).find("artist:eq(0)").text("");
        $(evt.currentTarget).find("music:eq(0)").text("");
    });
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

init();
