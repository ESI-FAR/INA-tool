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

const expectedColumnNames = [
    "ID",
    "Statement Type",
    "Attribute",
    "Deontic",
    "Aim",
    "Direct Object",
    "Type of Direct Object",
    "Indirect Object",
    "Type of Indirect Object",
    "Activation Condition",
    "Execution Constraint",
    "Or Else",
];


// Initialise global variables to store row values
var rowValues = [];


// -- Open the user dialog to select a file onclick of the button on the left menu
function openFileUpload() {
    // Trigger the click event of the hidden file input
    document.getElementById('fileInput').click();
}


// File handling and Preliminary check on file type
function handleFileUpload(files) {

    // Check if any file is selected
    if (files.length <= 0) { return; }

    // Check the file type
    let fileName = files[0].name;
    let fileType = getFileType(fileName);

    if (fileType !== 'csv' && fileType !== 'txt') {
        // Provide negatice feedback to user
        let fileModalBody = document.getElementById("fileModalBody");
        // Change class to alert-danger
        fileModalBody.classList.remove("alert-primary");
        fileModalBody.classList.add("alert-danger");

        // Display an error message in the modal
        displayErrorMessage('Invalid file type. Please select a CSV or TXT file.');
        return;
    }

    // Display the modal
    $('#fileModal').modal('show');
    let fileModalBody = document.getElementById("fileModalBody");

    // Change class to alert-primary
    fileModalBody.classList.remove("alert-danger");
    fileModalBody.classList.add("alert-primary");

    // Get the file name and display it in the modal
    fileModalBody.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/></svg> File Name: ' + fileName;
    checkFileContent();
}

function getFileType(fileName) {
    // Extract the file extension
    let fileExtension = fileName.split('.').pop().toLowerCase();
    return fileExtension;
}

function displayErrorMessage(message) {
    // Display error message in the modal
    document.getElementById('fileModalBody').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle" viewBox="0 0 16 16"><path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/><path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/></svg> Error: ' + message;
    $('#fileModal').modal('show');
}

function checkFileContent() {
    let fileInput = document.getElementById('fileInput');
    let file = fileInput.files[0];

    // Use FileReader to read the file content
    let reader = new FileReader();
    reader.onload = function (e) {
        let content = e.target.result;

        // Check if the file content has comma as a separator
        if (content.includes(',')) {
            columnNames = content.split('\n')[0].split(',');
            checkColumnNames(columnNames);

            // Extract and log each row
            rowValues = content.split('\n').slice(1).map(row => row.split(','));

            // Add an ID column in front
            columnNames.unshift("ID");
            let rowsWithID = rowValues.map((row, index) => [(index + 1)].concat(row));

            rowValues = rowsWithID;
            window.rowValues = rowsWithID;
        } else {
            // Display an error message if not a CSV file
            displayErrorMessage('Invalid file content. Please select a valid CSV file.');
        }
    };

    reader.readAsText(file);
}


function checkColumnNames(columnNames) {

    // Define the names accepted for the columns
    let expectedNames = new Set(expectedColumnNames);
    let unrecognizedColumns = new Set(columnNames).difference(expectedNames);

    // Now you have all unrecognized column names in the 'unrecognizedColumns' array
    console.log("Unrecognized columns:", unrecognizedColumns);
    // Alert the name of the column which is not recognized
    // Display an error message if not a CSV file
    if (unrecognizedColumns.length > 0) {
        const errorMessage = "Unrecognized column names: <i>" + unrecognizedColumns.join(", ") + "</i>";
        displayErrorMessage(errorMessage);
    }

}


function loadDemo() {
    confirmUpload(
        ["ID", "Statement Type", "Attribute", "Deontic", "Aim", "Direct Object", "Type of Direct Object", "Indirect Object", "Type of Indirect Object", "Activation Condition", "Execution Constraint", "Or Else\r"],
        [
            [1, "formal", "VROMI minister", "must", "order", "infrastructure dept to execute clean-up", "animate", "", "", "if necessary after a storm event", "", "\r"],
            [2, "informal", "Governor", "", "requests", "financial aid", "inanimate", "from Dutch Kingdom", "animate", "if requested by Prime minister", "", "\r"],
            [3, "formal", "Property owners", "must", "insure", "their properties", "inanimate", "", "", "", "", "\r"],
            [4, "informal", "NGOs", "", "help", "", "", "", "", "if requested by inhabitants", "in reconstruction", "\r"],
            [5, "formal", "VROMI infrastructure dept.", "must", "clean", "gutters", "inanimate", "", "", "", "before June (start hurricane season)", "\r"],
            [6, "formal", "ACER", "must", "update", "the recommendations", "inanimate", "", "", "", "at least once every two years", ""]
        ]
    )

}


// Function to confirm upload and fill rows in an existing table
function confirmUpload(uploadedColumnNames, uploadedRowValues) {
    if (!uploadedColumnNames) {
        uploadedColumnNames = columnNames;
    }
    if (!uploadedRowValues) {
        uploadedRowValues = rowValues;
    }

    populateTable(uploadedColumnNames, uploadedRowValues);
    addNodesAndLinks(uploadedRowValues);
}


function storeDatainSession(columnsArray) {

    // Send the generated table data to PHP script via AJAX
    $.ajax({
        url: 'includes/store_session_data.php',
        method: 'POST',
        data: {
            TableColumns: columnsArray,
            TableRows: rowValues
        },
        success: function (response) {
            console.log('Session data stored successfullyy');
        },
        error: function (xhr, status, error) {
            console.error('Error storing session data:', error);
        }
    });
}


function populateTable(uploadedColumnNames, uploadedRowValues) {

    // Execute loaderStarter
    loaderStarter()

    function loaderStarter() {
        // Start the loader and remove the text in quoteBlock
        let loader = document.getElementById("loader");
        let quoteBlock = document.getElementById("quoteBlock");
        quoteBlock.setAttribute("hidden", "true");
        // Show the loader and the quote block
        loader.removeAttribute("hidden");
        // Hide the loader and the quote block after 3 seconds
        setTimeout(function () {
            loader.setAttribute("hidden", "true");

        }, 5000);

    }

    // Clear the existing table content
    $('#tableData').empty();

    // Get the length of columnNames list
    let numColumns = uploadedColumnNames.length;
    // Initialize an array to hold column definitions
    let columnsArray = [];
    // Set up columns based on the provided columnNames length
    for (let i = 0; i < numColumns; i++) {
        columnsArray.push({
            title: uploadedColumnNames[i] // Set the column name using the provided columnNames length
        });
    }

    // This guy set the columns. More info at: https://datatables.net/
    let dataTable = $('#tableData').DataTable({
        columns: columnsArray // Set the columns using the generated array

    });

    // Set the table rows
    dataTable.rows.add(uploadedRowValues).draw();

    // Store table data in session
    storeDatainSession(columnsArray);
}
