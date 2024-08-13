<?php

// This code is needed to keep the uploaded data alive during app navigation.
// The information uplaoded by the user is stored into a php session variable.
// The session lasts for 1440 secs by default. This can be increased or reduced.

session_start();

// Check if table data is received via POST
if(isset($_POST['Columns'])) {
    // Store the received table data in session variable
    $_SESSION['Columns'] = $_POST['Columns'];
    $_SESSION['Statements'] = $_POST['Statements'];
    $_SESSION['Connections'] = $_POST['Connections'];
    $_SESSION['ProjectName'] = $_POST['ProjectName'];
} else {
    echo "No data received";
}


?>
