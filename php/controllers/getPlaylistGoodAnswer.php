<?php

    if (empty($_POST['playlist']) || empty($_POST['song']) || (empty($_POST['artist']) && empty($_POST['music']))) {
        http_response_code(400);
        return;
    }

    require_once('../model/Model.php');

    $model = new Model();
    $artistSong = trim($_POST['artist']).' / '.trim($_POST['music']);

    $goodAnswer = $model->getLineCodeOfGoodAnswer($_POST['playlist'], $_POST['song'], $artistSong);

    if (empty($goodAnswer)) {
        http_response_code(404);
    }
