// uploader.js  - ANNO DOMINI 2024 - eScience Center, AMS
// Authors - Ermanno Lo Cascio, Suvayu Ali, Sander van Rijn, Ole Mussmann

/*
                              o
          ######    #######  ###   ######    ####     ##   #######  #########
######    ##       ##        ###   ##        ## ##    ##  ##        ##
#    ##   ##       ##        ###   ##        ##  ##   ##  ##        ##
######    #######  ##        ###   ######    ##   ##  ##  ##        #########
#              ##  ##        ###   ##        ##    #####  ##        ##
######    #######  ########  ###   #######   ##     ####  ########  #########   Center Amsterdam
-----------------------------------------------------------------------------

// NOTES

The uploader.js contains all the functions to execute the data uploading process.
The operations executed here are:
    1. Open the modal dialog to select the file from the local
    2. Validations and feedback to user
    3. Table creation
    4. Data storage in PHP SESSION
*/


// -- Open the user dialog to select a file onclick of the button on the left menu
function openFileUpload() {
    // Trigger the click event of the hidden file input
    document.getElementById('fileInput').click();
}


// File handling and Preliminary check on file type
function handleFileUpload(files) {

    // Check if any file is selected
    if (files.length > 0) {
        // Check the file type
        var fileName = files[0].name;
        var fileType = getFileType(fileName);

        if (fileType === 'csv' || fileType === 'txt') {
            // Display the modal
            $('#fileModal').modal('show');
            var fileModalBody = document.getElementById("fileModalBody");

            // Change class to alert-primary
             fileModalBody.classList.remove("alert-danger");
             fileModalBody.classList.add("alert-primary");

            // Get the file name and display it in the modal
            fileModalBody.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg> File Name: ' + fileName;
            check_file_content();
        } else {
            // Provide negatice feedback to user
            var fileModalBody = document.getElementById("fileModalBody");
            // Change class to alert-danger
            fileModalBody.classList.remove("alert-primary");
            fileModalBody.classList.add("alert-danger");

            // Display an error message in the modal
            displayErrorMessage('Invalid file type. Please select a CSV or TXT file.');
        }
    }


}

function getFileType(fileName) {
    // Extract the file extension
    var fileExtension = fileName.split('.').pop().toLowerCase();
    return fileExtension;
}

function displayErrorMessage(message) {

     // Display error message in the modal
    document.getElementById('fileModalBody').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle" viewBox="0 0 16 16"><path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/><path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/></svg> Error: ' + message;
    $('#fileModal').modal('show');
}


function check_file_content() {

    // Flag is positive, proceed with file content checking...
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];

    // Use FileReader to read the file content
    var reader = new FileReader();
    reader.onload = function (e) {
        var content = e.target.result;

        // Check if the file content has comma as a separator
        if (content.includes(',')) {
            // Extract column names
            columnNames = content.split('\n')[0].split(',');

            // Rows and columns are properly separated, check columns names
            check_columns_names(columnNames);

            // Extract and log each row
            rowValues = content.split('\n').slice(1).map(row => row.split(','));

            // Call the display functions
            displayColumnNames(columnNames);
            displayRows();
        } else {
            // Display an error message if not a CSV file
            displayErrorMessage('Invalid file content. Please select a valid CSV file.');
        }
    };

    reader.readAsText(file);


}



function check_columns_names(columnNames) {

    // Define the names accepted for the columns
    const expectedColumnNames = new Set([
        "Statement Type",
        "Attribute",
        "Deontic",
        "Aim",
        "Direct Object",
        "Type of Direct Object",
        "Indirect Object",
        "Type of Indirect Object",
        "Activation Condition",
        "Execution constraint",
        "Or else\r"

    ]);

    var unrecognizedColumns = new Set(columnNames).difference(expectedColumnNames);

    // Now you have all unrecognized column names in the 'unrecognizedColumns' array
    console.log("Unrecognized columns:", unrecognizedColumns);
    // Alert the name of the column which is not recognized
    // Display an error message if not a CSV file
    if (unrecognizedColumns.length > 0) {
        const errorMessage = "Unrecognized column names: <i>" + unrecognizedColumns.join(", ") + "</i>";
        displayErrorMessage(errorMessage);
    }

}


// Initialise global variables to store row values
var rowValues = [];

// Function to display column names in the preliminary table (the one in the modal) with types
function displayColumnNames(columnNames) {
    // Prepend "ID" column by default
    columnNames.unshift("ID");

    var columnNamesDiv = document.getElementById('column_names');
    columnNamesDiv.innerHTML = '<h3>Column Names:</h3>';

    // Create a table element
    var tableElement = document.createElement('table');

    // Set fixed widths for each column
    var columnNameWidth = '200px';
    var typeWidth = '150px';
    var selectWidth = '100px';
    var reportWidth = '250px'; // Width for the new "Report" column

    // Create table headers
    var headerRow = tableElement.insertRow(0);

    var columnNameHeader = headerRow.insertCell(0);
    columnNameHeader.innerHTML = '<b>Column</b>';
    columnNameHeader.style.width = columnNameWidth;

    var typeHeader = headerRow.insertCell(1);
    typeHeader.innerHTML = '<b>Type</b>';
    typeHeader.style.width = typeWidth;

    var selectHeader = headerRow.insertCell(2);
    selectHeader.innerHTML = '<b>Import</b>';
    selectHeader.style.width = selectWidth;

    // Add header for the new "Report" column
    var reportHeader = headerRow.insertCell(3);
    reportHeader.innerHTML = '<b>Report</b>';
    reportHeader.style.width = reportWidth;

    // Iterate through columnNames and create rows with checkboxes, types, and report cells
    columnNames.forEach(function (name, index) {
        var checkboxId = 'checkbox_' + index;

        // Create a new row
        var row = tableElement.insertRow(index + 1);

        // Add column name to the first cell
        var columnNameCell = row.insertCell(0);
        columnNameCell.innerHTML = name;
        columnNameCell.style.width = columnNameWidth;

        // Determine the type of the value in the column (you may need to customize this part)
        var type = determineColumnType(name); // Execute type analysis
        // Add type information to the second cell
        var typeCell = row.insertCell(1);
        typeCell.innerHTML = type;
        typeCell.style.width = typeWidth;

        // Create checkbox and label elements
        var checkboxElement = document.createElement('input');
        checkboxElement.type = 'checkbox';
        checkboxElement.id = checkboxId;
        // Checked checkboxes by default
        checkboxElement.checked = true;

        // Add checkbox to the third cell
        var selectCell = row.insertCell(2);
        selectCell.appendChild(checkboxElement);
        selectCell.style.width = selectWidth;


        var reportContent = inspectRowsContent(name); // Pass the column and do extra analysis if needed
        var reportCell = row.insertCell(3);
        reportCell.innerHTML = reportContent; // Pass result of the inspectRowsContent() analysis
        reportCell.style.width = reportWidth;
    });

    // Append the table to the columnNamesDiv
    columnNamesDiv.appendChild(tableElement);
}



// Function to determine the type of the column (customize this function based on your needs)
function determineColumnType(columnName) {
    // Implement logic to determine the type based on the columnName
    // work in progress...
    return "xyz";
}


function inspectRowsContent(columnName) {
    // Implement logic to analyse the rows content for columnName
    // work in progress... (to be discussed, probably not needed)


    return "NA";
}


// Function to display rows
function displayRows() {
    var rowsValuesDiv = document.getElementById('rows_values');
    rowsValuesDiv.innerHTML = '<h3>Row Values:</h3><ul>' +
        rowValues.map((row, index) => '<li>' + (index + 1) + ', ' + row.join(', ') + '</li>').join('') + '</ul>';

    // Update rowValues array to include ID values for each row
    var rowsWithID = rowValues.map((row, index) => [(index + 1)].concat(row));
    rowValues = rowsWithID;
}





// Function to confirm upload and fill rows in an existing table
function confirmUpload() {


    // Initialize an array to hold selected column names
    var selectedColumns = [];

    // Iterate through the checkboxes and add selected column names to the array
    columnNames.forEach(function (name, index) {
        var checkboxId = 'checkbox_' + index;
        var checkboxElement = document.getElementById(checkboxId);

        // Check if the checkbox is selected
        if (checkboxElement.checked) {
            // Add the column name to the selectedColumns array
            selectedColumns.push(name);
        }
    });

    // Call setTableHeaders function with the selected column names
    setTableHeaders(selectedColumns);

    function setTableHeaders(columnNames) {

        // Execute loaderStarter
        loaderStarter()

        function loaderStarter(){
            // Start the loader and remove the text in quoteBlock
            var loader = document.getElementById("loader");
            var quoteBlock = document.getElementById("quoteBlock");
            quoteBlock.setAttribute("hidden", "true");
            // Show the loader and the quote block
            loader.removeAttribute("hidden");
            // Hide the loader and the quote block after 3 seconds
            setTimeout(function() {
                loader.setAttribute("hidden", "true");

            }, 5000);

        }



        // Clear the existing table content
        $('#tableData').empty();


        // Get the length of columnNames list
        var numColumns = columnNames.length;
        // Initialize an array to hold column definitions
        var columnsArray = [];
        // Set up columns based on the provided columnNames length
        for (var i = 0; i < numColumns; i++) {
            columnsArray.push({
                title: columnNames[i] // Set the column name using the provided columnNames length
            });
        }


        console.log(rowValues);

        // This guy set the columns. More info at: https://datatables.net/
        var dataTable = $('#tableData').DataTable({
            columns: columnsArray // Set the columns using the generated array

        });

        // Set the table rows
       dataTable.rows.add(rowValues).draw();

       // Store table data in session
       storeDatainSession(columnsArray);
    }


    // Now we need to store the session data into a php variable via Javascript
    function storeDatainSession(columnsArray){

        // Send the generated table data to PHP script via AJAX
        $.ajax({
            url: 'includes/store_session_data.php',
            method: 'POST',
            data: { TableColumns: columnsArray,
                    TableRows: rowValues

                  },
            success: function(response) {
                console.log('Session data stored successfullyy');
            },
            error: function(xhr, status, error) {
                console.error('Error storing session data:', error);
            }
        });
    }

}






