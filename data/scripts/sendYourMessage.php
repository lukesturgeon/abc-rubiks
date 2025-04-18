<?php

// make sure we call this page via AJAX
if (!array_key_exists('HTTP_X_REQUESTED_WITH', $_SERVER)) 
	die('You cannot access this page directly!');


// Define database credentials (godaddy.com)
require_once('config.php');


// Create db connection
$mysqli = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);


// Once connected, we can select a database
if ($mysqli->connect_errno) {
	echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}


// Grab user input from AJAX and sanitize 
// $friendEmail = mysql_real_escape_string(filter_var(trim($_POST['friendEmail']), FILTER_SANITIZE_STRING));
// $yourEmail = mysql_real_escape_string(filter_var(trim($_POST['yourEmail']), FILTER_SANITIZE_STRING));
// $userSubject = mysql_real_escape_string(filter_var(trim($_POST['subject']), FILTER_SANITIZE_STRING));
// $userMessage = mysql_real_escape_string(filter_var(trim($_POST['message']), FILTER_SANITIZE_STRING));
// $size = mysql_real_escape_string(filter_var(trim($_POST['size']), FILTER_SANITIZE_STRING));
// $letterSpacing = mysql_real_escape_string(filter_var(trim($_POST['letterSpacing']), FILTER_SANITIZE_STRING));
// $lineHeight = mysql_real_escape_string(filter_var(trim($_POST['lineHeight']), FILTER_SANITIZE_STRING));
// $angle = mysql_real_escape_string(filter_var(trim($_POST['angle']), FILTER_SANITIZE_STRING));

$friendEmail = $_POST['friendEmail'];
$yourEmail = $_POST['yourEmail'];
$userSubject = $mysqli->real_escape_string($_POST['subject']);
$userMessage = $mysqli->real_escape_string($_POST['message']);
$size = $_POST['size'];
$letterSpacing = $_POST['letterSpacing'];
$lineHeight = $_POST['lineHeight'];
$angle = $_POST['angle'];


// creat the sql query string
if ( !$mysqli->query("INSERT INTO ".DB_NAME.".message(message, size, letter_spacing, line_height, angle) 
	VALUES ('$userMessage', '$size', '$letterSpacing', '$lineHeight', '$angle')") ) {
	echo "ERROR: Table insert failed. (" . $mysqli->errno . ") " . $mysqli->error;
}
else {
	// get the ID from the message table
	$m_id = $mysqli->insert_id;

	if ( !$mysqli->query("INSERT INTO ".DB_NAME.".share(m_id, from_email, to_email, subject) 
		VALUES ('$m_id', '$yourEmail', '$friendEmail', '$userSubject')") ) {
		echo "ERROR: Table insert failed. (" . $mysqli->errno . ") " . $mysqli->error;
}
}


// close the DB connection
$mysqli->close();


// format the email
$emailSubject = 'A friend has sent you a message from abcrubiks.com';

$emailBody = $userSubject;
$emailBody .= "\n\nClick on the link below\nhttp://abcrubiks.com/?mid=" . $m_id;

/*$emailHeaders = 'From: messages@abcrubiks.com' . "\r\n";
$emailHeaders .= 'Reply-To: ' . $yourEmail . "\r\n";
$emailHeaders .= 'X-Mailer: PHP/' . phpversion();*/


// send the email
if (mail ( $friendEmail, $emailSubject, $emailBody/*, $emailHeaders*/)) {
	echo 'OK';
} 
else {
	echo 'ERROR';
}


?>