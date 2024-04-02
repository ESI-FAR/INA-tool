<?php
// Include the header which contains the left menu, header
include_once 'includes/header.php'; 
?>

            <div id="layoutSidenav_content">
                <main>
                    <div class="container-fluid px-4">
                        <h1 class="mt-4">Dashboard</h1>
                        <ol class="breadcrumb mb-4">
                            <li class="breadcrumb-item active">Dashboard</li>
                        </ol>
                        <div class="card">
                            <div class="card-body">
                       
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

                                
                                <!-- End of chart -->

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