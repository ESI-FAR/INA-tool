<?php
// Include the header which contains the left menu, header
include_once 'includes/header.php';
?>

<script type='text/javascript'>
    window.rowValues = [];
</script>

            <div id="layoutSidenav_content">
                <main>
                    <div class="container-fluid px-4">
                        <h1 class="mt-4">Dashboard</h1>
                        <ol class="breadcrumb mb-4">
                            <li class="breadcrumb-item active">Dashboard</li>
                        </ol>

                        <div class="card">
                            <div class="card-body">

                            <!-- Adjust Height Slider -->
                            <div class="form-group row">

                                <div class="col-sm-2">
                                    <input type="range" class="form-range" id="heightSlider" min="100" max="1800" value="400">
                                    <span id="heightValue">400px</span>
                                </div>

                            </div>

                           <!-- Zoom Controls -->
                           <div class="row mb-3">
                                <div class="col-sm-12 d-flex justify-content-between align-items-center">
                                    <div class="zoom-controls">
                                        <button class="btn btn-primary me-2" onclick="zoomIn()">Zoom In</button>
                                        <button class="btn btn-primary me-2" onclick="zoomOut()">Zoom Out</button>
                                        <button class="btn btn-secondary" onclick="resetZoom()">Reset Zoom</button>
                                    </div>

                                    <button class="btn btn-sm btn-outline-dark" onclick="downloadProject()">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download me-1" viewBox="0 0 16 16">
                                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                                            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/>
                                        </svg>
                                        Download
                                    </button>
                                </div>
                            </div>

                            <hr>

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
                                        min-width: 1800px; /* Set a minimum width to enable horizontal scrolling */
                                        min-height: 8000px; /* Set a minimum height to enable vertical scrolling */
                                        transform-origin: 0 0; /* Set transform origin to top left corner */
                                        transform: scale(1); /* Initial scale */
                                        transition: transform 0.3s ease; /* Smooth transition for scaling */
                                    }
                                </style>

                                <hr>
                                <div id="clicked-node"></div>
                                <hr>
                                <!-- End of chart -->

                                <script>
                                    // JavaScript to handle card heigh via slider
                                    const svgContainer = document.getElementById('svgContainer');
                                    const heightSlider = document.getElementById('heightSlider');
                                    const heightValue = document.getElementById('heightValue');

                                    heightSlider.addEventListener('input', function() {
                                        const newHeight = `${this.value}px`;
                                        svgContainer.style.height = newHeight;
                                        heightValue.textContent = newHeight;
                                    });
                                </script>

                                <script>
                                    // JavaScript to handle zooming of the SVG
                                    let scale = 1; // Initial scale factor

                                    function zoomIn() {
                                        scale += 0.1;
                                        updateScale();
                                    }

                                    function zoomOut() {
                                        scale -= 0.1;
                                        updateScale();
                                    }

                                    function resetZoom() {
                                        scale = 1; // Reset scale to 1 (initial zoom level)
                                        updateScale();
                                    }

                                    function updateScale() {
                                        const svg = document.querySelector('#svgContainer svg');
                                        svg.style.transform = `scale(${scale})`;
                                    }
                                </script>



                            </div>
                        </div>
                        <hr>
                        <div class="card mb-4">
                            <div class="card-header">
                                <i class="fas fa-table me-1"></i>
                                DataTable
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
                                                // Extract the 'title' property from the object
                                                $title = isset($column['title']) ? $column['title'] : '';
                                                if (!empty($title)) {
                                                    echo "<th>$title</th>";
                                                }
                                            }
                                            echo "</tr>";
                                            echo "</thead>";

                                            // Build Table body

                                            echo "<tbody>";

                                            // Loop through each row to populate the table body
                                            foreach ($_SESSION['Rows'] as $row) {
                                                echo "<tr>";
                                                // Loop through each column value in the row
                                                foreach ($row as $columnValue) {
                                                    echo "<td>$columnValue</td>";
                                                }
                                                echo "</tr>";
                                            }
                                            echo "</tbody>";
                                            echo "</table>";
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