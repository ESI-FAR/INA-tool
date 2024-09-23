// downloader.js  - ANNO DOMINI 2024 - eScience Center, AMS
// Authors - Ermanno Lo Cascio, Suvayu Ali, Sander van Rijn

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

The downloader.js enables the generation and download of the .PNG version of the flowchart.
It generate a .PNG of the current webview.
*/
function downloadPNG() {
    if (!INA.statements.length >= 1) {
        alert("No image to download");
        return;
    }

    resetZoom();
    // Get the SVG element
    const svgElement = document.querySelector('#svgContainer svg');

    // Create a new Canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Get the bounding box of the SVG element
    const bbox = svgElement.getBBox();

    // Define a margin
    const margin = 40; // Adjust if needed

    // Define the scale factor to increase resolution (e.g., 2x for double resolution)
    const scaleFactor = 2;

    // Set canvas dimensions to the SVG bounding box dimensions plus margin, scaled by the scale factor
    canvas.width = (bbox.width + margin * 2) * scaleFactor;
    canvas.height = (bbox.height + margin * 2) * scaleFactor;

    // Create a new Image object
    const img = new Image();

    // Convert SVG to a data URL
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = function() {
        // Clear the canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Scale the drawing context to increase resolution
        context.scale(scaleFactor, scaleFactor);

        // Draw the SVG image onto the canvas with a margin, adjusted for scaling
        context.drawImage(img, margin / scaleFactor, margin / scaleFactor);
        URL.revokeObjectURL(url);

        // Convert canvas to a PNG data URL
        const pngData = canvas.toDataURL('image/png');

        // Create a download link and trigger a download
        const downloadLink = document.createElement('a');
        downloadLink.href = pngData;

        // Add time stamp to the file name for the link
        const formattedDateTime = getTimestampString();
        downloadLink.download =  formattedDateTime + '_' + INA.projectName + '.png';

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    img.src = url;
}

function downloadProject() {
    let object = {
        'projectName': INA.projectName,
        'statements': INA.statements,
        'connections': INA.connections,
        'downloadDate': new Date(),
    };

    const json = JSON.stringify(object);
    const blob = new Blob([json],{ type:'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${INA.projectName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function getTimestampString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}


function downloadCSV() {
    const columnNames = INA.columnNames;  
    const statements = INA.statements;    

    // Validation: Check if columnNames or statements are empty
    if (!columnNames || columnNames.length === 0 || !statements || statements.length === 0) {
        alert("No data found.");
        return;  // Exit the function if no data
    }

    // Start CSV content with column names (header row)
    let csvContent = columnNames.join(",") + "\n";

    // Loop through each statement object
    statements.forEach(statement => {
        // For each statement, create a row by joining values in the same order as the column names
        let row = columnNames.map(col => {
            // Handle undefined or null values, and escape commas if needed
            const value = statement[col] ? statement[col] : '';
            return `"${value.toString().replace(/"/g, '""')}"`;  // Escape quotes
        }).join(",");
        csvContent += row + "\n";
    });

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create a link to trigger the download
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);

    // Add time stamp to the file name for the link
    const formattedDateTime = getTimestampString();
    link.setAttribute("download", formattedDateTime + "_statements.csv");

    // Append the link to the body (not displayed) and trigger a click
    document.body.appendChild(link);
    link.click();

    // Clean up by removing the link
    document.body.removeChild(link);
}

// Helper function to generate a timestamp string for file naming
function getTimestampString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}
