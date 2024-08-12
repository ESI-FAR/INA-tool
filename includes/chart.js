// chart.js  - ANNO DOMINI 2024 - eScience Center, AMS
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

The chart.js contains all the functions to render the svg flowchart based on data uploaded.
The operations executed here are:
    1. Generate the nodes and links arrays
    2. Create the nodes and set all the required attributes
    3. Generata the links

*/

// Define nodes following the template
const row_template = {
    nodes: [
        {
            id: 1,
            x: 0, y: 0,
            shape: 'polygon',
            type: 'Activation Condition',
            points: [[60,120], [18,60], [60,0], [180,0], [222,60], [180,120]],
            centroid: {x: 120, y: 60},
        },
        {
            id: 2,
            x: 120*2.3, y: 30,
            shape: 'circle',
            type: 'Attribute',
            radiusX: 48 * 2,  // Adjusted radiusX for 2 times bigger
            radiusY: 36 * 1.7,  // Adjusted radiusY for 2 times bigger
        },
        {
            id: 3,
            x: 240*2, y: -30,
            shape: 'rect',
            type: 'Aim',
            width: 100 * 2,   // Adjusted width for 2 times bigger
            height: 60 * 2,   // Adjusted height for 2 times bigger
        },
        {
            id: 4,
            x: 420*1.7, y: -30,
            shape: 'rect',
            type: 'Direct Object',
            width: 110 * 2,   // Adjusted width for 2 times bigger
            height: 60 * 2,   // Adjusted height for 2 times bigger
            rx: 30 * 2,       // Adjusted rx for 2 times bigger
            ry: 30 * 2,       // Adjusted ry for 2 times bigger
        },
        {
            id: 5,
            x: 240*1.95, y: 120,
            shape: 'rect',
            type: 'Execution Constraint',
            width: 110 * 2,   // Adjusted width for 2 times bigger
            height: 60 * 2,   // Adjusted height for 2 times bigger
            rx: 30 * 2,       // Adjusted rx for 2 times bigger
            ry: 30 * 2,       // Adjusted ry for 2 times bigger
        },
        {
            id: 6,
            x: 420*1.7, y: 120,
            shape: 'rect',
            type: 'Indirect Object',
            width: 110 * 2,   // Adjusted width for 2 times bigger
            height: 60 * 2,   // Adjusted height for 2 times bigger
            rx: 30 * 2,       // Adjusted rx for 2 times bigger
            ry: 30 * 2,       // Adjusted ry for 2 times bigger
        },
    ],
    links: [
        { source: 1, target: 2 },
        { source: 2, target: 3 },
        { source: 3, target: 4 },
        { source: 5, target: 3 },
        { source: 4, target: 6 },
    ],
};

const colors = { formal: '#009DDD', informal: '#FFB213' }
const fontSize = 14;

// Add connection drawing state variables to global INA namespace
INA.isDrawingConnection = false;
INA.isDeletingConnection = false;
INA.startShapeId = null;
INA.connectionColor = null;
INA.scale = 1; // Initial scale factor

function zoomIn() {
    INA.scale += 0.1;
    updateScale();
}

function zoomOut() {
    INA.scale -= 0.1;
    updateScale();
}

function resetZoom() {
    INA.scale = 1; // Reset scale to 1 (initial zoom level)
    updateScale();
}

function updateScale() {
    const svg = document.querySelector('#svgContainer svg');
    svg.style.transform = `scale(${INA.scale})`;
}

function addNodesAndLinks(statementObjects) {
    let svgContainer = document.getElementById("svgContainer");
    let svg = svgContainer.querySelector("svg");
    let connectionGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    connectionGroup.setAttribute('id', 'connectionGroup');
    svg.appendChild(connectionGroup); // All inter-staement connections must render behind statements

    const rowHeight = 300;
    const startDrawingAt = { x: 75, y: 30 };

    // Add nodes and links for each row
    statementObjects.forEach(function (rowObj, rowIndex) {

        // Calculate y offset for this row
        let yOffset = startDrawingAt.y + (rowIndex * rowHeight);

        // Create a group for the row
        let rowGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

        // Add id to enable dragging of connected lines further
        rowGroup.setAttribute("id", rowObj.Id);
        // Initialize empty transform for detection by getParentTransform
        rowGroup.setAttribute("transform", "translate(0, 0)")

        svg.appendChild(rowGroup);

        // Create groups for nodes and edges within the row group
        let nodesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        let edgesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        rowGroup.appendChild(edgesGroup); // Append edges group first
        rowGroup.appendChild(nodesGroup); // Append nodes group second

        // Add nodes to the nodes group
        row_template.nodes.forEach(function (template_node) {
            if (!rowObj[template_node.type]) {
                return;
            }

            let newNode;
            let nodeX = template_node.x + startDrawingAt.x;
            let nodeY = template_node.y + yOffset;
            let textContent = rowObj[template_node.type];

            if (template_node.shape === 'polygon') {
                // Create a polygon for the node
                newNode = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                // Adjust points based on row position
                let points = template_node.points.map(point => {
                    let [px, py] = point;
                    return `${px + nodeX - 70},${py + nodeY - 30}`;
                }).join(' ');
                newNode.setAttribute("points", points);
            } else if (template_node.shape === 'circle') {
                // Create an ellipse for the node
                newNode = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
                newNode.setAttribute("cx", nodeX);
                newNode.setAttribute("cy", nodeY);
                newNode.setAttribute("rx", template_node.radiusX);
                newNode.setAttribute("ry", template_node.radiusY);
            } else if (template_node.shape === 'rect') {
                // Create a rectangle for the node
                newNode = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                newNode.setAttribute("x", nodeX);
                newNode.setAttribute("y", nodeY);
                newNode.setAttribute("width", template_node.width);
                newNode.setAttribute("height", template_node.height);

                if (template_node.rx && template_node.ry) {
                    newNode.setAttribute("rx", template_node.rx);
                    newNode.setAttribute("ry", template_node.ry);
                }
            }

            // Set common attributes for all shapes
            newNode.setAttribute("fill", colors[rowObj["Statement Type"]]); // Use rowObj.statementType to get the correct color
            newNode.setAttribute("stroke", "lightgray");
            newNode.setAttribute("stroke-width", "2");
            newNode.setAttribute("id", `${rowObj.Id}_${template_node.id}`);

            // Add event listener for right-click context menu
            newNode.addEventListener('contextmenu', function (event) {
                event.preventDefault();
                showContextMenu(event, newNode);
            });



            // Append the new node to the nodes group
            nodesGroup.appendChild(newNode);

            // Add text to the node
            let textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
            let textX = nodeX, textY = nodeY;

            // Adjust text position for polygons and rectangles
            if (template_node.shape === 'rect') {
                if (template_node.rx && template_node.ry) {
                    // Calculate center position for rectangles with rounded corners
                    textX += template_node.rx + (template_node.width - 2 * template_node.rx) / 2;
                    textY += template_node.ry + (template_node.height - 2 * template_node.ry) / 2;
                } else {
                    // Calculate center position for rectangles without rounded corners
                    textX += template_node.width / 2;
                    textY += template_node.height / 2;
                }
            } else if (template_node.shape === 'polygon') {
                // Calculate center position based on polygon centroid
                textX += template_node.centroid.x - 70;
                textY += template_node.centroid.y - 30;
            }

            textElement.setAttribute("x", textX);
            textElement.setAttribute("y", textY);
            textElement.setAttribute("fill", "black");
            textElement.setAttribute("font-size", `${fontSize}px`);
            textElement.setAttribute("text-anchor", "middle");
            textElement.setAttribute("alignment-baseline", "middle");
            textElement.setAttribute("style", "user-select: none;");

            // Wrap text if too long
            setTextWithLineWrap(textContent, textX, textY, textElement);

            nodesGroup.appendChild(textElement);
        });

        let statementID = createStatementIDText(yOffset, rowObj);
        nodesGroup.appendChild(statementID);

        // Add edges to the edges group after nodes
        updateEdges(rowObj, edgesGroup);

        // Enable dragging of the entire row group
        let isDragging = false;
        let startX, startY;
        let startTransform, connectionStartPositions;

        rowGroup.addEventListener('mousedown', function (event) {
            isDragging = true;
            startX = event.clientX;
            startY = event.clientY;
            startTransform = getTransform(rowGroup);

            // Get the row number of the dragged group
            let rowNumber = rowGroup.id;

            // Select all <line> elements with the attributes data-start-row-id and data-end-row-id
            let lines = document.querySelectorAll('line[data-start-row-id][data-end-row-id]');
            connectionStartPositions = [];
            lines.forEach(line => {
                let connectionStartPosition = determineConnectionStartPosition(line, rowNumber);
                if (connectionStartPosition) connectionStartPositions.push(connectionStartPosition);
            });

            event.stopPropagation(); // Prevent nodes from receiving this event
        });

        window.addEventListener('mousemove', function (event) {
            if (!isDragging) return;

            let dx = (event.clientX - startX) / INA.scale;
            let dy = (event.clientY - startY) / INA.scale;

            // Move the dragged group
            rowGroup.setAttribute('transform', `translate(${startTransform.translateX + dx}, ${startTransform.translateY + dy})`);
            connectionStartPositions.forEach(connectionStartPosition => {
                updateConnection(connectionStartPosition, dx, dy);
            });
        });

        window.addEventListener('mouseup', function (event) {
            if (isDragging) {
                isDragging = false;
            }
        });
    });
}

function createStatementIDText(yOffset, rowObj) {
    let textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElement.setAttribute("x", 30);
    textElement.setAttribute("y", yOffset - 10);
    textElement.setAttribute("fill", "black");
    textElement.setAttribute("font-size", `${fontSize}px`);
    textElement.setAttribute("text-anchor", "middle");
    textElement.setAttribute("font-weight", "bold");
    textElement.setAttribute("alignment-baseline", "middle");
    textElement.setAttribute("style", "user-select: none;");
    textElement.textContent = rowObj["Statement Type"] == "formal" ? `F${rowObj.Id}` : `I${rowObj.Id}`;
    return textElement;
}

function determineConnectionStartPosition(line, rowNumber) {
    let lineID = line.getAttribute('id');
    let startShape = line.getAttribute('data-start-row-id');
    let endShape = line.getAttribute('data-end-row-id');
    let connectionStartPosition;

    // Extract the row number from the start and end shape ids
    let startRow = startShape.split('_')[0];
    let endRow = endShape.split('_')[0];

    // Prepare line start or end point to be moved, depending on which statement is moved
    if (startRow == rowNumber) {
        connectionStartPosition = {
            id: lineID,
            num: 1,
            x: parseFloat(line.getAttribute('x1')),
            y: parseFloat(line.getAttribute('y1')),
        };
    } else if (endRow == rowNumber) {
        // Translate line: add dx to x2 and dy to y2
        connectionStartPosition = {
            id: lineID,
            num: 2,
            x: parseFloat(line.getAttribute('x2')),
            y: parseFloat(line.getAttribute('y2')),
        };
    } else {
        return null;  // return 'null' if this connection is not associated with the statement being moved
    }
    return connectionStartPosition;
}

function updateConnection(connectionStartPosition, dx, dy) {
    line = document.getElementById(connectionStartPosition.id);
    line.setAttribute(`x${connectionStartPosition.num}`, connectionStartPosition.x + dx);
    line.setAttribute(`y${connectionStartPosition.num}`, connectionStartPosition.y + dy);
}

function setTextWithLineWrap(textContent, textX, textY, textElement) {
    if (textContent.length <= 20) {
        // If text is short, just add it as a single tspan
        textElement.textContent = textContent;
        return;
    }

    let words = textContent.split(' ');
    let line = '';
    const lineHeight = 1.2;  // Adjust this for line spacing
    const maxLineLength = 23; // Maximum characters per line
    let lines = [];

    words.forEach(word => {
        let testLine = line + word + ' ';
        if (testLine.length > maxLineLength) {
            lines.push(line);
            line = word + ' ';
        } else {
            line = testLine;
        }
    });
    lines.push(line);  // Ensure last line is added too

    // Each line moves up by half the number of lines, adjusted for adding lineHeight
    const lineOffset = (lines.length - 1) / 2;
    lines.forEach(function (line, lineNumber) {
        // Create tspan for each line
        let tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspan.setAttribute("x", textX);
        tspan.setAttribute("y", textY + (fontSize * lineHeight) * (lineNumber - lineOffset));
        tspan.setAttribute("alignment-baseline", "middle")
        tspan.textContent = line;
        textElement.appendChild(tspan);
    });

}

function updateEdges(rowObj, edgesGroup) {
    let rowID = rowObj.Id;
    row_template.links.forEach(function (link) {
        let sourceNode = document.getElementById(`${rowID}_${link.source}`);
        let targetNode = document.getElementById(`${rowID}_${link.target}`);

        if (!sourceNode || !targetNode) {
            return;
        }

        // Determine target node center
        let [sourceX, sourceY] = determineCenter(sourceNode);
        let [targetX, targetY] = determineCenter(targetNode);

        // Create or update line element
        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("stroke", "gray");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("data-source", `${rowID}_${link.source}`);
        line.setAttribute("data-target", `${rowID}_${link.target}`);

        line.setAttribute("x1", sourceX);
        line.setAttribute("y1", sourceY);
        line.setAttribute("x2", targetX);
        line.setAttribute("y2", targetY);

        // Append the line to the edges group
        edgesGroup.appendChild(line);

        // Add deontic text between second and third nodes
        if (link.source === 2 && link.target === 3) {
            // Check if deonticValue is not empty
            let deonticValue = rowObj.Deontic;
            if (deonticValue !== "") {

                let textElement = document.createElementNS("http://www.w3.org/2000/svg", "text"); // Create a new SVG text element

                // Calculate the midpoint of the line connecting source and target nodes
                let midX = (sourceX + targetX) / 2;
                let midY = (sourceY + targetY) / 2 - 6; // Slightly adjust the y-position to avoid overlap

                // Set attributes for the text element
                textElement.setAttribute("x", midX);  // Set the x-coordinate to the midpoint
                textElement.setAttribute("y", midY);  // Set the y-coordinate to the midpoint
                textElement.setAttribute("fill", "gray");  // Set the text color to gray
                textElement.setAttribute("font-size", `${fontSize}px`);  // Set the font size
                textElement.setAttribute("font-weight", "bold");  // Set the font weight to bold
                textElement.setAttribute("text-anchor", "middle");  // Center the text horizontally
                textElement.setAttribute("alignment-baseline", "middle");  // Center the text vertically
                textElement.setAttribute("style", "user-select: none;");
                textElement.textContent = deonticValue;  // Set Text

                // Append the text element to the edges group in the SVG
                edgesGroup.appendChild(textElement);
            }
        }
    });
}

function determineCenter(node) {
    let nodeX, nodeY;
    if (node.tagName === 'ellipse') {
        nodeX = parseFloat(node.getAttribute("cx"));
        nodeY = parseFloat(node.getAttribute("cy"));
    } else if (node.tagName === 'polygon') {
        // Calculate polygon centroid
        let points = node.getAttribute("points").split(' ').map(point => {
            let [px, py] = point.split(',');
            return { x: parseFloat(px), y: parseFloat(py) };
        });
        let centroid = calculatePolygonCentroid(points);

        nodeX = centroid.x;
        nodeY = centroid.y;
    } else if (node.tagName === 'rect') {
        nodeX = parseFloat(node.getAttribute("x")) + parseFloat(node.getAttribute("width")) / 2;
        nodeY = parseFloat(node.getAttribute("y")) + parseFloat(node.getAttribute("height")) / 2;
    }
    return [nodeX, nodeY];
}

function calculatePolygonCentroid(points) {
    let centroid = { x: 0, y: 0 };
    let area = 0;

    for (let i = 0; i < points.length; i++) {
        let current = points[i];
        let next = points[(i + 1) % points.length];
        let crossProduct = (current.x * next.y) - (current.y * next.x);
        area += crossProduct;
        centroid.x += (current.x + next.x) * crossProduct;
        centroid.y += (current.y + next.y) * crossProduct;
    }

    area /= 2;
    centroid.x /= (6 * area);
    centroid.y /= (6 * area);

    return centroid;
}

// Helper function to get current transform of the node
function getTransform(node) {
    let transform = node.getAttribute('transform');
    if (transform) {
        let translateMatch = transform.match(/translate\(\s*([^\s,)]+), ([^\s,)]+)/);
        if (translateMatch) {
            return {
                translateX: parseFloat(translateMatch[1]),
                translateY: parseFloat(translateMatch[2])
            };
        }
    }
    return { translateX: 0, translateY: 0 };
}


// ShowContextMenu function to initiate the drawing process
function showContextMenu(event, node) {
    // Create or get the context menu
    let contextMenu = document.getElementById('contextMenu');
    if (!contextMenu) {
        contextMenu = document.createElement('div');
        contextMenu.id = 'contextMenu';
        contextMenu.className = 'dropdown-menu';
        document.body.appendChild(contextMenu);
    }

    // Set the position and show the menu
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.top = `${event.pageY}px`;
    contextMenu.style.display = 'block';
    contextMenu.classList.add('show');

    // Add options to the context menu
    contextMenu.innerHTML = `
        <a class="dropdown-item" href="#" id="drawGreenConnection">Draw Green Connection</a>
        <a class="dropdown-item" href="#" id="drawPurpleConnection">Draw Purple Connection</a>
        <a class="dropdown-item" href="#" id="drawRedConnection">Draw Red Connection</a>
        <a class="dropdown-item" href="#" id="deleteConnection">Delete Connection</a>
    `;

    // Handle menu option clicks
    document.getElementById('drawGreenConnection').onclick = function () { startDrawConnection('green') };
    document.getElementById('drawPurpleConnection').onclick = function () { startDrawConnection('purple') };
    document.getElementById('drawRedConnection').onclick = function () { startDrawConnection('red') };

    function startDrawConnection (color) {
        contextMenu.style.display = 'none';
        contextMenu.classList.remove('show');
        // Start the drawing process
        INA.isDrawingConnection = true;
        INA.startShapeId = node.id;
        INA.connectionColor = color;
        console.log('Draw Connection clicked for node', node.id);
    };

    document.getElementById('deleteConnection').onclick = function () {
        contextMenu.style.display = 'none';
        contextMenu.classList.remove('show');
        // Implement the logic to delete a connection
        INA.isDeletingConnection = true;
        INA.startShapeId = node.id;
        console.log('Delete Connection clicked for node', node.id);
    };

    // Hide the context menu when clicking outside
    window.addEventListener('click', function hideContextMenu(event) {
        if (event.target !== contextMenu && !contextMenu.contains(event.target)) {
            contextMenu.style.display = 'none';
            contextMenu.classList.remove('show');
            window.removeEventListener('click', hideContextMenu);
        }
    });
}

// Report the transform attribute of the first parent to have one
function getParentTransform(node) {
    while (!node.getAttribute('transform')) {
        node = node.parentNode;
    }
    return getTransform(node);
}


// Add event listener for double-click to select the destination node and draw the line
document.addEventListener('click', function(event) {
    if (INA.isDrawingConnection) {
        drawConnection(event);
    } else if (INA.isDeletingConnection) {
        deleteConnection(event);
    }
});

function drawConnection(event) {
    let destinationNode = event.target;
    let destinationShapeId = destinationNode.id;

    if (destinationNode.tagName !== 'ellipse' && destinationNode.tagName !== 'polygon' && destinationNode.tagName !== 'rect') {
        return;
    }

    console.log('Selected destination node:', destinationShapeId);
    let startNode = document.getElementById(INA.startShapeId);
    let [startX, startY] = determineCenter(startNode);
    let startTransform = getParentTransform(startNode);
    let [endX, endY] = determineCenter(destinationNode);
    let destinationTransform = getParentTransform(destinationNode);

    // Create a line element and append it to the SVG
    let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("stroke", INA.connectionColor);
    line.setAttribute("stroke-width", "5");
    line.setAttribute("x1", startX + startTransform.translateX);
    line.setAttribute("y1", startY + startTransform.translateY);
    line.setAttribute("x2", endX + destinationTransform.translateX);
    line.setAttribute("y2", endY + destinationTransform.translateY);

    // Convert startShapeId and destinationShapeId to numbers
    let startRowIdNum = parseInt(INA.startShapeId, 10);
    let destinationRowIdNum = parseInt(destinationShapeId, 10);

    // Check if the conversion was successful
    if (isNaN(startRowIdNum) || isNaN(destinationRowIdNum)) {
        console.error("Invalid startShapeId or destinationShapeId");
    }

    // Set the attributes with the updated values
    line.setAttribute("data-start-row-id", startRowIdNum);
    line.setAttribute("data-end-row-id", destinationRowIdNum);
    line.setAttribute("id", "connector_" + startRowIdNum + "-" + destinationRowIdNum);
    line.setAttribute("start-shape-id_", INA.startShapeId);
    line.setAttribute("end-shape-id_", destinationShapeId);

    // Append the line to the edges group or svg container
    connectionGroup.appendChild(line);

    // Reset the drawing state
    INA.isDrawingConnection = false;
    INA.startShapeId = null;
    INA.connectionColor = null;
}

function deleteConnection(event) {
    let destinationNode = event.target;
    let destinationShapeId = destinationNode.id;

    if (destinationNode.tagName !== 'ellipse' && destinationNode.tagName !== 'polygon' && destinationNode.tagName !== 'rect') {
        return;
    }

    let startRowIdNum = parseInt(INA.startShapeId, 10);
    let destinationRowIdNum = parseInt(destinationShapeId, 10);

    line = document.getElementById(`connector_${startRowIdNum}-${destinationRowIdNum}`);
    // If no such line, try finding a line the other way around
    if (!line) {
        line = document.getElementById(`connector_${destinationRowIdNum}-${startRowIdNum}`);
    }

    if (line) {
        line.remove();

        // Reset the drawing state
        INA.isDeletingConnection = false;
        INA.startShapeId = null;
    }
}
