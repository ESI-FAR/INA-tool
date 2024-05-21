<?php
// Start the session
session_start();

// Check if a session variable exists to determine if it's a new session or not
if (!isset($_SESSION['visited'])) {
    // This is a new session
    $user_session_message = "Welcome to the website!";


    // Set a session variable to mark that the user has visited
    $_SESSION['visited'] = true;
} else {
    // This is not a new session
    $user_session_message = "Welcome back!";
}

// Destroy the session when the user refreshes the page or navigates away
// You can detect this using JavaScript and send an AJAX request to a PHP script to destroy the session
// Here, we'll just simulate it by providing a button to destroy the session
if (isset($_POST['destroy_session'])) {
    session_destroy();
    // Redirect to the same page to start a new session
    header("Location: ".$_SERVER['PHP_SELF']);
    exit();
}
?>






<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="INA is a digital tool developed by the eScience Center. It is designed to support the regulatory framework design process by facilitating study, analysis, and decision-making through data visualization and interaction." />
        <meta name="author" content="Netherland eScience Center - Authors and Contributors: Lo Cascio Ermanno, Ali Suvayou, van Rijn Sander - Anno Domini 2024 - Milky Way, Solar System, Earth, Europe, Natherlands, Amsterdam   " />
        <title>INA Tool - eScience</title>
        <link href="css/styles.css" rel="stylesheet" />
        <link rel="icon" href="assets/escience/escience_favicon_orange.jpg" type="image/x-icon">
        <script src="https://use.fontawesome.com/releases/v6.3.0/js/all.js" crossorigin="anonymous"></script>

        <script src="https://code.jquery.com/jquery-3.6.4.min.js" integrity="sha256-oP6HI9z1XaZNBrJURtCoUT5SUnxFr8s3BzRl+cbzUq8=" crossorigin="anonymous"></script>

        <!-- Include DataTables CSS and JS -->
        <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.24/css/jquery.dataTables.css">
        <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.24/js/jquery.dataTables.js"></script>

    </head>
    <body class="sb-nav-fixed">
        <nav class="sb-topnav navbar navbar-expand navbar-dark bg-dark">
            <!-- Navbar Brand-->
            <a class="navbar-brand ps-3" href="index.php">INA tool</a>
            <!-- Sidebar Toggle-->
            <button class="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0" id="sidebarToggle" href="#!"><i class="fas fa-bars"></i></button>

            <ul class="navbar-nav ms-auto d-flex me-3 me-lg-4">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" id="navbarDropdown" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src="assets/escience/escience_favicon.png" alt="User Image" class="user-image">
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                        <li><a class="dropdown-item" href="settings.php">Settings</a></li>
                        <li><hr class="dropdown-divider" /></li>
                        <li>
                            <a class='dropdown-item' href='#!'>
                                <form method='post'>
                                    <input type='submit' name='destroy_session' value='Reset Session'>
                                </form>
                            </a>
                        </li>


                    </ul>
                </li>
            </ul>
        </nav>

        <div id="layoutSidenav">
            <div id="layoutSidenav_nav">
                <nav class="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                    <div class="sb-sidenav-menu">
                        <div class="nav">
                            <div class="sb-sidenav-menu-heading">VIEWER</div>
                            <a class="nav-link" href="index.php">
                                <div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
                                Dashboard
                            </a>

                            <div class="sb-sidenav-menu-heading">TOOLS</div>

                            <a class="nav-link" href="help.php">
                                <div class="sb-nav-link-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-book-fill" viewBox="0 0 16 16">
                                    <path d="M8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
                                    </svg>
                                </div>
                                Help
                            </a>
                            <hr>
                            <!-- Include JavaScript code to perform operations on uplaoded file -->
                            <script src="includes/uploader.js"></script>

                            <!-- Include JavaScript code to render the flowchart based on uploaded file -->
                            <script src="includes/chart.js"></script>

                            <a class="nav-link">
                                <div class="sb-nav-link-icon">
                                    <button type="button" class="btn btn-outline-primary" onclick="openFileUpload()">
                                        <!-- Add upload svg icon -->
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-arrow-up-fill" viewBox="0 0 16 16">
                                        <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M6.354 9.854a.5.5 0 0 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 8.707V12.5a.5.5 0 0 1-1 0V8.707z"/>
                                        </svg>
                                        Upload file
                                    </button>
                                </div>
                            </a>
                            <!-- Add a hidden file input element -->
                            <input type="file" id="fileInput" style="display: none;" onchange="handleFileUpload(this.files)">


                            <!-- Include JavaScript code to perform project download operations -->
                            <script src="includes/downloader.js"></script>

                            <!-- Project download button -->
                            <a class="nav-link">
                                <div class="sb-nav-link-icon">
                                    <button type="button" class="btn btn-outline-secondary" onclick="downloadProject()">
                                        <!-- Add download svg icon -->
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
                                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                                        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
                                        </svg>
                                        Download
                                    </button>
                                </div>
                            </a>

                            <a class="nav-link">
                                <div class="sb-nav-link-icon">
                                    <button type="button" class="btn btn-outline-primary" onclick="loadDemo()">
                                        <!-- Add upload svg icon -->
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-arrow-up-fill" viewBox="0 0 16 16">
                                        <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M6.354 9.854a.5.5 0 0 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 8.707V12.5a.5.5 0 0 1-1 0V8.707z"/>
                                        </svg>
                                        load demo
                                    </button>
                                </div>
                            </a>


                        </div>
                    </div>
                    <div class="sb-sidenav-footer">
                        <div class="small">SESSION STATUS</div>
                        <?php echo $user_session_message;?>
                    </div>
                </nav>
            </div>


            <!-- Modal displaying the uploaded file -->
            <div class="modal fade" data-bs-backdrop="static" id="fileModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                <div class="modal-header">
                <h5 class="modal-title" id="fileModalLabel">Uploaded File</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" >
                    <!-- File name will be displayed here -->
                    <div class="alert alert-danger" role="alert" id="fileModalBody"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onclick = 'confirmUpload("", "")'>Confirm upload</button>
                </div>
                </div>
            </div>
            </div>




