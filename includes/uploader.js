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
    "Id",
    "Statement Type",
    "Attribute",
    "Deontic",
    "Aim",
    "Direct Object",
    "Type Of Direct Object",
    "Indirect Object",
    "Type Of Indirect Object",
    "Activation Condition",
    "Execution Constraint",
    "Or Else",
];


// Initialise a global namespace variable 'INA' to store global variables during the session
window.INA = {};
INA.statements;

// Check table and initialize session variable to handle file upload properly
function checkPreviousSessions() {
    // Get the table element by its ID
    let table = document.getElementById('tableData');

    // Check if the table element exists
    if (!table) {
        console.error('Table with id "tableData" not found.');
        return;
    }

    // Get the tbody element, if it exists
    let tbody = table.getElementsByTagName('tbody')[0];

    // Check if the tbody exists and if it has rows
    let isEmpty = !tbody || tbody.rows.length === 0;

    // Output the result
    sessionState = !isEmpty;
}

// -- Open the user dialog to select a file onclick of the button on the left menu
function openFileUpload() {

    checkPreviousSessions();

    if(sessionState === true){

        var modalHtml = `
            <div class="modal fade" id="dynamicModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel"><i class="fas fa-exclamation-triangle"></i> Open session</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                    <p>You have an open session. Destroy the session before uploading a new file. Your data will be lost.</p>
                    </div>
                    <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <form method='post'>
                        <input type='submit' class="btn btn-danger" name='destroy_session' value='Reset Session'>
                    </form>

                    </div>
                </div>
                </div>
            </div>
            `;

    document.getElementById('upload_alert').innerHTML = modalHtml;

    var dynamicModal = new bootstrap.Modal(document.getElementById('dynamicModal'));
    dynamicModal.show();
        return;
    }

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
            let lines = content.split('\n');
            INA.columnNames = lines[0].replace('\r', '').split(',');
            INA.columnNames = INA.columnNames.map(name => toTitleCase(name));
            let rowValues = lines.slice(1).map(row => row.split(','));

            // Add an ID column in front if not already present
            if (!INA.columnNames.includes('Id')) {
                INA.columnNames.unshift("Id");
                rowValues = rowValues.map((row, index) => [(index + 1)].concat(row));
            }

            INA.statements = [];
            rowValues.forEach(row => {
                // Map row attributes to their respective values
                let entries = INA.columnNames.map((attribute, idx) => {
                    return [attribute, row[idx]];
                });
                INA.statements.push(Object.fromEntries(entries));
            });

            checkColumnNames(INA.columnNames);
        } else {
            // Display an error message if not a CSV file
            displayErrorMessage('Invalid file content. Please select a valid CSV file.');
        }
    };

    reader.readAsText(file);
}

// Transform string to Title Case. Source: https://stackoverflow.com/a/196991/1044698
function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
  }

function checkColumnNames(columnNames) {

    // Define the names accepted for the columns
    let expectedNames = new Set(expectedColumnNames);
    let missingColumns = expectedNames.difference(new Set(columnNames));

    // Alert with the missing column names
    if (missingColumns.size > 0) {        const errorMessage = "Missing column names: <i>" + Array.from(missingColumns).join(", ") + "</i>";
        displayErrorMessage(errorMessage);
    }

}

// Function to confirm upload and fill rows in an existing table
function confirmUpload(uploadedColumnNames, uploadedRowValues) {
    if (!uploadedColumnNames) {
        uploadedColumnNames = INA.columnNames;
    }
    if (!uploadedRowValues) {
        uploadedRowValues = INA.statements;
    }

    populateTable(uploadedColumnNames, uploadedRowValues);
    addNodesAndLinks(uploadedRowValues);
}


function storeDatainSession() {

    // Send the generated table data to PHP script via AJAX
    $.ajax({
        url: 'includes/store_session_data.php',
        method: 'POST',
        data: {
            Columns: INA.columnNames,
            Statements: INA.statements
        },
        success: function (response) {
            console.log('Session data stored successfully');
            sessionState = true;
        },
        error: function (xhr, status, error) {
            console.error('Error storing session data:', error);
        }
    });
}


document.addEventListener("DOMContentLoaded", function() {
    loaderStarter();
});

function loaderStarter() {
    // Start the loader and remove the text in quoteBlock
    let loader = document.getElementById("loader");
    let quoteBlock = document.getElementById("quoteBlock");
    quoteBlock.setAttribute("hidden", "true");
    // Show the loader
    loader.removeAttribute("hidden");

    // Add an event listener for the window's load event to hide the loader once the page is fully loaded
    window.addEventListener('load', function () {
        loader.setAttribute("hidden", "true");
    });
}

function populateTable(uploadedColumnNames, uploadedStatementObjects) {

    // Clear the existing table content
    $('#tableData').empty();

    let columnsArray = uploadedColumnNames.map(columnName => {
        return {title: columnName}
    })

    // This guy set the columns. More info at: https://datatables.net/
    let dataTable = $('#tableData').DataTable({
        columns: columnsArray // Set the columns based on the given array
    });

    let uploadedRowValues = [];
    uploadedStatementObjects.forEach(statementObj => {
        let row = uploadedColumnNames.map(column => statementObj[column]);
        uploadedRowValues.push(row);
    });

    // Set the table rows
    dataTable.rows.add(uploadedRowValues).draw();

    // Store table data in session
    storeDatainSession();
}
