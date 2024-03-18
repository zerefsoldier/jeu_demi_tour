<?php

    if (empty($_GET['playlisyt'])) {
        http_response_code(401);
        return;
    }

    require_once('../model/Model.php');

    $model = new Model();
    
    header('Content-Type: application/json');
    print(json_encode($model->getPlaylist($_GET['playlist'])));
