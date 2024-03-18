<?php
	class Model{
		private $conn;
	  
		public function __construct() {
			$this->conn = new PDO('mysql:host=db5015558336.hosting-data.io;dbname=dbs12709828', 'dbu5099689', '10WaypendiO$', array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'));
		}
		
		public function getConn() {
			return $this->conn;
		}

		public function getPlaylists() {
			$request = $this->conn->query('
				SELECT code, theme, musicNumber, playlistTitle
				FROM playlists
			');

			return $request->fetchAll(PDO::FETCH_ASSOC);
		}

		public function getPlaylist($playlist) {
			$request = $this->conn->query('
				SELECT playlist, playlists.musicNumber, song
				FROM playlist_songs
				INNER JOIN playlists ON playlist_songs.playlist = code
			');

			return $request->fetchAll(PDO::FETCH_ASSOC);
		}

		public function getPlaylistAnswersSuggestion($playlist, $song) {
			$request = $this->conn->query('
				SELECT response_a, response_b, response_c
				FROM playlist_songs
				playlist = :playlist AND song = :song
			');

			return $request->fetch(PDO::FETCH_ASSOC);
		}

		public function getLineCodeOfGoodAnswer($playlist, $song, $artistSong) {
			$request = $this->conn->prepare('
				SELECT code
				FROM playlist_songs
				WHERE playlist = :playlist AND song = :song AND good_response LIKE :artistSong
			');
			$request->execute(array(
				':playlist' => $playlist,
				':song' => $song,
				':artistSong' => '%'.$artistSong.'%'
			));

			return $request->fetch(PDO::FETCH_ASSOC);
		}
	}
