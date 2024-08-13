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
        <meta name="author" content="Netherland eScience Center - Authors and Contributors: Ermanno Lo Cascio, Suvayu Ali, Sander van Rijn - Anno Domini 2024 - Milky Way, Solar System, Earth, Europe, Netherlands, Amsterdam" />
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
                                    <i class="fa-solid fa-book-open"></i>
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
                                        <i class="fa-solid fa-file-arrow-up"></i>
                                        Upload file
                                    </button>
                                </div>
                            </a>
                            <!-- Add a hidden file input element -->
                            <input type="file" id="fileInput" style="display: none;" onchange="handleFileUpload(this.files)">


                            <!-- Include JavaScript code to perform project download operations -->
                            <script src="includes/downloader.js"></script>

                            <!-- PNG download button -->
                            <a class="nav-link">
                                <div class="sb-nav-link-icon">
                                    <button type="button" class="btn btn-outline-secondary" onclick="downloadPNG()">
                                        <i class="fa-solid fa-file-image"></i>
                                        Download PNG
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




