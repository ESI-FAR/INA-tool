<?php

// This code is needed to keep the uploaded data alive during app navigation.
// The information uplaoded by the user is stored into a php session variable.
// The session lasts for 1440 secs by default. This can be increased or reduced.

session_start();

// Check if table data is received via POST
if(isset($_POST['TableColumns'])) {
    // Store the received table data in session variable
    $_SESSION['Columns'] = $_POST['TableColumns'];
    $_SESSION['Rows'] = $_POST['TableRows'];
    
} else {
    echo "No data received";
}


?>
