<?php
require '../Slim/Slim.php';
require 'Autoloader.php'; 
\Slim\Slim::registerAutoloader();
Autoloader::register();


$app = new \Slim\Slim(array('debug' => false, 'cookies.encrypt' => true, 'cookies.secure' => true, 'cookies.httponly' => true));


function createPasswords() {
	if (authentify(apache_request_headers()['User'], apache_request_headers()['Password'])) {
		$phpInputs = file_get_contents("php://input");
		$password = json_decode($phpInputs);
		$db = open();
		$stmt = $db->prepare("select login, password, label, url from password where label = :label");
		$stmt->bindValue(':label', $password->label, PDO::PARAM_STR);
		$stmt->execute();
		if ($stmt->rowCount() <= 0) {
			$stmt = $db->prepare("insert into password (login, password, label, url, user) values (:login, :password, :label, :url, :user)");
			$stmt->bindValue(':login', $password->login, PDO::PARAM_STR);
			$stmt->bindValue(':password', $password->password, PDO::PARAM_STR);
			$stmt->bindValue(':label', $password->label, PDO::PARAM_STR);
			$stmt->bindValue(':url', $password->url, PDO::PARAM_STR);
			$stmt->bindValue(':user', apache_request_headers()['User'], PDO::PARAM_STR);			
			$stmt->execute();
		} else {
			echo "name already exists";
			http_response_code(500);
			exit;			
		}
	} else {
		echo "auth ko";
		http_response_code(403);
		exit;
	}
}
$app->post('/passwords', createPasswords);

function listPasswords() {
	$app = \Slim\Slim::getInstance();
	if (authentify($app->request->headers->get('user'), $app->request->headers->get('password'))) {
		$db = open();
		$stmt = $db->prepare("select login, password, label, url from password where user = :user");
		$stmt->bindValue(':user', apache_request_headers()['User'], PDO::PARAM_STR);			
		$stmt->execute();
		$result = array();
		foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
			$result[] = $row;
		}
		echo json_encode($result);
	} else {
		echo "auth ko";
		http_response_code(403);
		exit;
	}
}

$app->get('/passwords', listPasswords);
$app->options('/passwords', listPasswords);

$app->put('/passwords(/:label)', function ($label) {
	if (authentify(apache_request_headers()['User'], apache_request_headers()['Password'])) {	
		$phpInputs = file_get_contents("php://input");
		$password = json_decode($phpInputs);
		$db = open();
		$stmt = $db->prepare("update password set login= :login, password=:password, url=:url where label = :label");
		$stmt->bindValue(':label', $label, PDO::PARAM_STR);
		$stmt->bindValue(':login', $password->login, PDO::PARAM_STR);
		$stmt->bindValue(':password', $password->password, PDO::PARAM_STR);
		$stmt->bindValue(':url', $password->url, PDO::PARAM_STR);
		$stmt->execute();
		$stmt = $db->prepare("select login, password, label, url from password where label = :label");
		$stmt->bindValue(':label', $label, PDO::PARAM_STR);
		$stmt->execute();
		foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
			echo json_encode($row);
			break;
		}
	} else {
		echo "auth ko";
		http_response_code(403);
		exit;
	}
});

$app->delete('/passwords(/:label)', function ($label) {
	if (authentify(apache_request_headers()['User'], apache_request_headers()['Password'])) {	
		$db = open();
		$stmt = $db->prepare("delete from password where label = :label");
		$stmt->bindValue(':label', $label, PDO::PARAM_STR);
		$nb = $stmt->execute();
		if ($nb != 1) {
			echo "number of deleted rows: ".$nb;
			http_response_code(500);
			exit;
		}
	} else {
		echo "auth ko";
		http_response_code(403);
		exit;
	}
});

$app->run();

function open() {
	return new PDO('mysql:host=localhost:3306;dbname=cgicertif;charset=utf8', 'root', 'root');
}


function authentify($user, $password) {

	$db = open();
	$stmt = $db->prepare("select used_quota from user where login = :nom ");
	$stmt->bindValue(':nom', $user, PDO::PARAM_STR);
	$stmt->execute();
	if ($stmt->rowCount() <= 0) {
		return false;
	} else if ($stmt->fetchColumn() >= 10) {
		return false;	
	} else {
	
		$stmt = $db->prepare("select * from user where login = :nom and password = :password");
		$stmt->bindValue(':nom', $user, PDO::PARAM_STR);
		$stmt->bindValue(':password', $password, PDO::PARAM_STR);
		$stmt->execute();
		if ($stmt->rowCount() > 0) {
			return true;
		} else {
			$stmt = $db->prepare("update user set used_quota= used_quota + 1 where login = :nom");
			$stmt->bindValue(':nom', $user, PDO::PARAM_STR);
			$stmt->execute();
			return false;
		}
	}
}


?>