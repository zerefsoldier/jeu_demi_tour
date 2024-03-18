<?php

    require_once('../model/Model.php');

    $model = new Model();
    
    header('Content-Type: application/json');
    print(json_encode($model->getPlaylists()));
