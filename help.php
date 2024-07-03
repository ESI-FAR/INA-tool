<?php
// Include the header which contains the left menu, header
include_once 'includes/header.php';
?>

            <style>
            .code-box {
                position: relative;
                background-color: #f0f0f0;
                padding: 10px;
                border-radius: 6px;
                margin-bottom: 20px;
            }
            pre {
                white-space: pre-wrap;
                word-wrap: break-word;
                font-family: Consolas, monospace;
                margin: 0;
            }
            .copy-button {
                position: absolute;
                top: 5px;
                right: 20px; /* Adjust as needed */
                padding: 5px 10px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            .copy-button:hover {
                background-color: #0056b3;
            }
            .copy-icon {
                margin-left: 5px;
            }
            </style>
            <div id="layoutSidenav_content">
                <main>
                    <div class="container-fluid px-4">
                        <h1 class="mt-4">Help</h1>
                        <ol class="breadcrumb mb-4">
                            <li class="breadcrumb-item"><a href="index.php">Dashboard</a></li>
                            <li class="breadcrumb-item active">Help</li>
                        </ol>
                        <div class="card mb-4">
                            <div class="card-body">
                            <h1>Welcome to INA TOOL</h1>
                                <h3>Dashboard Overview</h3>
                                <ul>This is the central hub where you can view the istitutional statements visualization and manage your data.</ul>

                                <h3>Upload your File & Template</h3>
                                <ul>
                                You can upload only <i>.csv</i> or <i>.txt</i> files. Please, use this <a href="Institutional_statement_template - INA.txt" download>template</a>. Alternatively, the file must respect the columns ordering and naming described below:

                               <div class="code-box">
                                    <pre>"ID", "Statement Type", "Attribute", "Deontic", "Aim", "Direct Object", "Type of Direct Object", "Indirect Object", "Type of Indirect Object", "Activation Condition", "Execution Constraint", "Or Else"</pre>
                               </div>
                                </ul>

                                <h3>Interacting with Visualizations</h3>
                                <ul>
                                    <li><strong>Dragging:</strong> Press key left and start dragging the statement.</li>
                                    <li><strong>Zoom:</strong> Use zoom buttons functionalities to explore charts.</li>
                                    <li><strong>Draw inter-statements connection:</strong><br>
                                    1. Right click on the starting shape of a statement;<br>
                                    2. From the context menu select <i>Draw connection</i>;<br>
                                    3. Left click on the destination shape.
                                    </li>
                                    <li><strong>Table Filtering:</strong> Write text in the search box of the table to focus on specific data subsets.</li>
                                    <li><strong>Export:</strong> Download your webview as PNG image by clicking the <i><i class="fa-solid fa-file-arrow-down"></i> download PNG</i> button at the top right side on the canvas.</li>
                                </ul>

                                <h3>Install a Local Version of the Software</h3>
                                <ul>
                                Please, visit the <a href='https://github.com/ESI-FAR/INA-tool' target='blank'>github</a> repository and follow the installation instructions.
                                </ul>

                                <h3>Support and Discussion</h3>
                                <ul>
                                    If you encounter issues not covered here, or you want to share some ideas, please use the <a href='https://github.com/ESI-FAR/INA-tool/discussions/landing'>github</a> repository.
                                </ul>

                            </div>
                        </div>
                    </div>
                </main>

                <?php
                // Include the footer
                include_once 'includes/footer.php';
                ?>
