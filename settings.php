<?php
// Include the header which contains the left menu, header
include_once 'includes/header.php'; 
?>
            <div id="layoutSidenav_content">
                <main>
                    <div class="container-fluid px-4">
                        <h1 class="mt-4">Settings</h1>
                        <ol class="breadcrumb mb-4">
                            <li class="breadcrumb-item"><a href="index.php">Dashboard</a></li>
                            <li class="breadcrumb-item active">Settings</li>
                        </ol>
                        <div class="card mb-4">
                            <div class="card-body">
                                
                                current session timeout is 
                                
                                <?php
                                echo ini_get("session.gc_maxlifetime");
                                ?>

                                seconds


                            </div>
                        </div>
                    </div>
                </main>
                
                <?php
                // Include the footer 
                include_once 'includes/footer.php'; 
                ?>
