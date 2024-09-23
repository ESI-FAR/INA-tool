<?php
// Include the header which contains the left menu, header
include_once 'includes/header.php';
?>


            <div id="layoutSidenav_content">
                <main>
                    <div class="container-fluid px-4">
                        <h1 class="mt-4">Dashboard</h1>
                        <div class="card">
                            <div class="card-body">

                            <!-- Zoom Controls -->
                            <div class="row mb-3">
                                <div class="col-sm-12 d-flex justify-content-between align-items-center">
                                    <div class="zoom-controls">
                                        <button class="btn btn-primary btn-sm" onclick="zoomIn()">Zoom In</button>
                                        <button class="btn btn-primary btn-sm" onclick="zoomOut()">Zoom Out</button>
                                        <button class="btn btn-secondary btn-sm" onclick="resetZoom()">Reset Zoom</button>
                                    </div>

                                    <button class="btn btn-sm btn-outline-dark" onclick="downloadPNG()">
                                        <i class="fa-solid fa-file-image"></i>
                                        Download PNG
                                    </button>
                                </div>
                            </div>

                            <hr>

                            <!-- Uploader alert -->
                            <div id="upload_alert"></div>

                            <!-- Spinner loader -->
                                <div class="d-flex justify-content-center align-items-center" >
                                    <div class="spinner-border text-warning" id="loader" role="status" hidden>
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                                <blockquote id="quoteBlock" class="blockquote mb-0">
                                    <p>Upload data to display chart</p>
                                    <footer class="blockquote-footer">Powered by <cite title="Source Title">eScience Center Amsterdam</cite></footer>
                                </blockquote>

                                <!-- Chart here -->
                                <div id="svgContainer" style="overflow-y: scroll; height:400px;">
                                    <svg xmlns="http://www.w3.org/2000/svg"></svg>
                                </div>
                                <style>
                                    /* Added custom CSS for the svgContainer */
                                    #svgContainer {
                                        overflow: auto;
                                        max-width: 100%; /* Adjust as needed */
                                    }

                                    /* Added styles for the inner svg */
                                    #svgContainer svg {
                                        min-width: 4000px; /* Set a minimum width to enable horizontal scrolling */
                                        min-height: 8000px; /* Set a minimum height to enable vertical scrolling */
                                        transform-origin: 0 0; /* Set transform origin to top left corner */
                                        transform: scale(1); /* Initial scale */
                                        transition: transform 0.3s ease; /* Smooth transition for scaling */
                                    }
                                </style>
                                <!-- End of chart -->
                            </div>
                        </div>
                        <hr>
                        <div class="card mb-4">
                        <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <i class="fas fa-table me-1"></i>
                            DataTable
                        </div>
                        <div>
                            <!-- Download CSV Button -->
                             
                            <button class="btn btn-sm btn-outline-dark" onclick = "downloadCSV()">
                            <i class="fa-solid fa-file-csv"></i>    
                            Download as CSV</button>
                        </div>
                        
                    </div>

                            <div class="card-body">
                                <div style="overflow-x: auto;">
                                    <?php
                                    // Check if the session variable is set and not empty
                                    if (isset($_SESSION['Columns']) && !empty($_SESSION['Columns'])) {
                                        // Check if $_SESSION['Columns'] is an array
                                        if (is_array($_SESSION['Columns'])) {
                                            // If it's an array, you need to loop through it to display each element
                                            echo "<table id='tableData' class='display' style='min-width: 100%'>";

                                            // Must re-initilize the table to retrieve jQuery features from https://datatables.net/
                                            echo "<script> $(document).ready(function() {
                                                $('#tableData').DataTable();
                                                });
                                            </script>";


                                            echo "<thead>";
                                            echo "<tr>";
                                            foreach ($_SESSION['Columns'] as $column) {
                                                if (!empty($column)) {
                                                    echo "<th>$column</th>";
                                                }
                                            }
                                            echo "</tr>";
                                            echo "</thead>";

                                            // Build Table body

                                            echo "<tbody>";

                                            // Loop through each statement to populate the rows of the table body
                                            foreach ($_SESSION['Statements'] as $statement) {
                                                echo "<tr>";
                                                // Loop through each column value in the statement
                                                foreach ($_SESSION['Columns'] as $column) {
                                                    echo "<td>$statement[$column]</td>";
                                                }
                                                echo "</tr>";
                                            }
                                            echo "</tbody>";
                                            echo "</table>";

                                            // Render chart: statements and connections
                                            echo "<script>document.getElementById('quoteBlock').hidden = true;</script>";
                                            $statements = json_encode($_SESSION['Statements']);
                                            $connections = json_encode($_SESSION['Connections']);
                                            $projectName = json_encode($_SESSION['ProjectName']);
                                            echo "<script>renderOnLoad($statements, $connections, $projectName)</script>";


                                        }
                                    } else {
                                        echo "<table id='tableData' class='display' style='width:100%'></table>";
                                        // echo "<p>No table data available.</p>";
                                    }
                                    ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>


                <?php
                // Include the footer
                include_once 'includes/footer.php';
                ?>