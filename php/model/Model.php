<?php
	class Model{
		private $conn;
	  
		public function __construct() {
			$this->conn = new PDO('mysql:host=127.0.01;port=3306;dbname=reverse_blindtest', 'reverse_blindtest_user', '10WaypendiO$', array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'));
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
				SELECT playlist, playlists.musicNumber, song, song_type
				FROM playlist_songs
				INNER JOIN playlists ON playlist_songs.playlist = code
			');

			return $request->fetchAll(PDO::FETCH_ASSOC);
		}

		public function getPlaylistAnswersSuggestion($playlist, $song) {
			$request = $this->conn->prepare('
				SELECT response_a, response_b, response_c
				FROM playlist_songs
				WHERE playlist = :playlist AND song = :song
			');
			$request->execute(array(
				':playlist' => $playlist,
				':song' => $song
			));

			return $request->fetch(PDO::FETCH_ASSOC);
		}

		public function getLineCodeOfGoodAnswer($playlist, $song, $artistSong) {
			$request = $this->conn->prepare('
				SELECT *
				FROM playlist_songs
				WHERE playlist = :playlist AND song = :song AND good_answer LIKE :artistSong
			');
			$request->execute(array(
				':playlist' => $playlist,
				':song' => $song,
				':artistSong' => '%'.$artistSong.'%'
			));

			return $request->fetch(PDO::FETCH_ASSOC);
		}

		public function getJokerCodes() {
			$request = $this->conn->query('SELECT code FROM jokers');

			return $request->fetchAll(PDO::FETCH_ASSOC);
		}

		public function getJoker($code) {
			$request = $this->conn->prepare('SELECT code, type, first, title, desxcription FROM jokers WHERE code = :code');
			$request->execute(array(':code' => $code));

			return $request->fetch(PDO::FETCH_ASSOC);
		}
	}
