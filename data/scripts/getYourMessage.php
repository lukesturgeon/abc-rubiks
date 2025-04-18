<?php

// make sure we call this page via AJAX
// if (!array_key_exists('HTTP_X_REQUESTED_WITH', $_SERVER)) 
// 	die('You cannot access this page directly!');


header('Content-Type: application/json');


// Define database credentials (godaddy.com)
require_once('config.php');


// Create db connection
$mysqli = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);


// Once connected, we can select a database
if ($mysqli->connect_errno) {
	echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
}


// Grab message ID from AJAX and sanitize 
// $mid = mysql_real_escape_string(filter_var(trim($_GET['mid']), FILTER_SANITIZE_STRING));
$mid = $_GET['mid'];


// creat the sql query string
if ( $result = $mysqli->query("SELECT `message`,`size`,`letter_spacing` AS letterSpacing,`line_height` AS lineHeight,`angle` FROM " . DB_NAME . ".message WHERE `id` = $mid") ) {
	// return a JSON object with the message details
	$myArray = array();
	
	while($row = $result->fetch_array(MYSQL_ASSOC)) {
            $myArray[] = $row;
    }

    // return the first element (we only have 1 row)
    echo json_encode($myArray[0]);
}
else {
	echo "ERROR: Table select failed. (" . $mysqli->errno . ") " . $mysqli->error;
}


// close the DB connection
$mysqli->close();

?>