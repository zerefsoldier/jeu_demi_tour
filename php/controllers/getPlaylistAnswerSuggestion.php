<?php
    if (empty($_POST['playlist']) || empty($_POST['song'])) {
        http_response_code(400);
        return;
    }

    require_once('../model/Model.php');

    $model = new Model();
    print(json_encode($model->getPlaylistAnswersSuggestion($_POST['playlist'], $_POST['song'])));
