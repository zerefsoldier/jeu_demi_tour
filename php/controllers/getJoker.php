<?php

    require_once('../model/Model.php');

    $model = new Model();

    $jokersCodes = $model->getJokerCodes();
    $randCode = $jokersCodes[rand(0, count($jokersCodes))];

    header('Content-Type: application/json');
    print(json_encode($model->getJoker($randCode)));
