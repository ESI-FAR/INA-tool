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
            id: 1, x: 0, y: 30, color: '#ffc70f', shape: 'polygon', type: 'activationCondition',
            points: '30,60 9,30 30,0 90,0 111,30 90,60',
        },
        {
            id: 2, x: 120, y: 30, color: '#0fafff', shape: 'circle', type: 'attribute',
            size: '5px', radiusX: 48, radiusY: 36,
        },
        {
            id: 3, x: 240, y: 0, color: '#ffc70f', shape: 'rect', type: 'aim',
            width: 100, height: 60,
        },
        {
            id: 4, x: 420, y: 0, color: '#0fafff', shape: 'rect', type: 'directObject',
            width: 110, height: 60, rx: 30, ry: 30,  // rx/ry for rounded corners
        },
        {
            id: 5, x: 240, y: 90, color: '#0fafff', shape: 'rect', type: 'executionConstraint',
            width: 110, height: 60, rx: 30, ry: 30,  // rx/ry for rounded corners
        },
        {
            id: 6, x: 420, y: 90, color: '#0fafff', shape: 'rect', type: 'indirectObject',
            width: 110, height: 60, rx: 30, ry: 30,  // rx/ry for rounded corners
        },
    ],
    links: [
        { source: 1, target: 2 },
        { source: 2, target: 3 },  // include deontic info here
        { source: 3, target: 4 },
        { source: 5, target: 3 },
        { source: 4, target: 6 },
    ],
};

const colors = { formal: '#99cc00', informal: '#f4b183' }

const rowAttributes = [
    "id",
    "statementType",
    "attribute",
    "deontic",
    "aim",
    "directObject",
    "typeOfDirectObject",
    "indirectObject",
    "typeOfIndirectObject",
    "activationCondition",
    "executionConstraint",
    "orElse"
];

function addNodesAndLinks(rowValues) {
    var svgContainer = document.getElementById("svgContainer");
    var svg = svgContainer.querySelector("svg");

    const rowHeight = 180;
    const rowX = 75, rowY = 30;

    // Add nodes
    rowValues.forEach(function (row, i) {
        entries = rowAttributes.map((attribute, idx) => {
            return [attribute, row[idx]];
        });
        row = Object.fromEntries(entries);
        row_template.nodes.forEach(function (template_node) {

            if (!row[template_node.type]) {
                return;
            }

            var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
            var newNode;
            var x = template_node.x + rowX;
            var y = template_node.y + rowY + (i * rowHeight);
            if (template_node.shape === 'polygon') {
                // Create a polygon for the node
                newNode = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                newNode.setAttribute("points", template_node.points);
                // Calculate centroid of the polygon
                var centroid = calculatePolygonCentroid(newNode);

                // Calculate translation needed to move the centroid to (x, y)
                var translationX = x - centroid.x;
                var translationY = y - centroid.y;

                // Apply translation to the polygon
                newNode.setAttribute("transform", "translate(" + translationX + "," + translationY + ")");
            } else if (template_node.shape === 'circle') {
                /// Create an ellipse for the node
                newNode = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
                newNode.setAttribute("rx", template_node.radiusX); // Use the horizontal radius attribute
                newNode.setAttribute("ry", template_node.radiusY); // Use the vertical radius attribute
                newNode.setAttribute("cx", x);
                newNode.setAttribute("cy", y);
            } else if (template_node.shape === 'rect') {
                // Create a rectangle for the node
                newNode = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                newNode.setAttribute("x", x);
                newNode.setAttribute("y", y);
                newNode.setAttribute("width", template_node.width); // Use the width attribute
                newNode.setAttribute("height", template_node.height); // Use the height attribute
                if (template_node.rx && template_node.ry) {
                    newNode.setAttribute("rx", template_node.rx); // Set horizontal radius for rounded corners
                    newNode.setAttribute("ry", template_node.ry); // Set vertical radius for rounded corners
                }
            }

            newNode.setAttribute("id", `${row.id}_${template_node.id}`);
            newNode.setAttribute("fill", colors[row.statementType]);
            newNode.setAttribute("stroke", "black")

            // Add text inside the shape
            var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            var textContent = row[template_node.type];
            if (textContent.length >= 17) {
                textContent = textContent.slice(0, 14) + "...";
            }
            text.textContent = textContent;
            text.setAttribute("fill", "black");
            text.setAttribute("font-size", "12px");
            text.setAttribute("font-family", "calibri");
            text.setAttribute("text-anchor", "middle"); // Center align the text

            var textX = x, textY = y;
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
            }
            text.setAttribute("x", textX);
            text.setAttribute("y", textY);

            group.appendChild(newNode);
            group.appendChild(text);
            svg.appendChild(group);

            // Make the group draggable
            group.addEventListener('mousedown', function (event) {
                var offsetX, offsetY;

                if (newNode.tagName === 'ellipse') {
                    offsetX = event.clientX - parseFloat(newNode.getAttribute("cx"));
                    offsetY = event.clientY - parseFloat(newNode.getAttribute("cy"));
                } else if (newNode.tagName === 'polygon') {
                    var bbox = newNode.getBoundingClientRect();
                    offsetX = event.clientX - bbox.left;
                    offsetY = event.clientY - bbox.top;
                } else if (newNode.tagName === 'rect') {
                    offsetX = event.clientX - parseFloat(newNode.getAttribute("x"));
                    offsetY = event.clientY - parseFloat(newNode.getAttribute("y"));
                }

                function moveNode(event) {
                    if (newNode.tagName === 'ellipse') {
                        newNode.setAttribute("cx", event.clientX - offsetX);
                        newNode.setAttribute("cy", event.clientY - offsetY);
                        // Update text position for ellipse
                        text.setAttribute("x", parseFloat(newNode.getAttribute("cx")));
                        text.setAttribute("y", parseFloat(newNode.getAttribute("cy")));
                    } else if (newNode.tagName === 'polygon') {
                        var bbox = newNode.getBoundingClientRect();
                        var deltaX = event.clientX - offsetX - bbox.x;
                        var deltaY = event.clientY - offsetY - bbox.y;
                        // Update polygon points
                        var points = newNode.points;
                        var numPoints = points.numberOfItems;
                        for (var i = 0; i < numPoints; i++) {
                            points.getItem(i).x += deltaX;
                            points.getItem(i).y += deltaY;
                        }
                        // Update text position for polygon
                        text.setAttribute("x", parseFloat(text.getAttribute("x")) + deltaX);
                        text.setAttribute("y", parseFloat(text.getAttribute("y")) + deltaY);

                    } else if (newNode.tagName === 'rect') {
                        newNode.setAttribute("x", event.clientX - offsetX);
                        newNode.setAttribute("y", event.clientY - offsetY);
                        // Update text position for rectangle
                        text.setAttribute("x", parseFloat(newNode.getAttribute("x")) + parseFloat(newNode.getAttribute("width")) / 2);
                        text.setAttribute("y", parseFloat(newNode.getAttribute("y")) + parseFloat(newNode.getAttribute("height")) / 2);
                    }

                    updateEdges(row.id);
                }

                function stopMove() {
                    document.removeEventListener('mousemove', moveNode);
                    document.removeEventListener('mouseup', stopMove);
                }

                document.addEventListener('mousemove', moveNode);
                document.addEventListener('mouseup', stopMove);
            });

        });

        updateEdges(row.id);
    });
}


// Function to update edge positions
function updateEdges(rowID) {
    row_template.links.forEach(function (link) {
        var sourceNode = document.getElementById(`${rowID}_${link.source}`);
        var targetNode = document.getElementById(`${rowID}_${link.target}`);

        if (!sourceNode || !targetNode) {
            return;
        }

        var sourceX, sourceY, targetX, targetY;

        if (sourceNode.tagName === 'ellipse') {
            sourceX = parseFloat(sourceNode.getAttribute("cx"));
            sourceY = parseFloat(sourceNode.getAttribute("cy"));
        } else if (sourceNode.tagName === 'polygon') {
            // Get the bounding box of the polygon
            var sourceBBox = sourceNode.getBoundingClientRect();
            // Define an offset to adjust the initial edge position (empirical adjustment)
            var offsetX = 275; // Adjust this value as needed (!!! This is a little temporary hack !!!)
            var offsetY = 225; // Adjust this value as needed (!!! This is a little temporary hack !!!)
            // Calculate the center of the bounding box with the offset
            sourceX = sourceBBox.left + sourceBBox.width / 2 - offsetX;
            sourceY = sourceBBox.top + sourceBBox.height / 2 - offsetY;
        } else if (sourceNode.tagName === 'rect') {
            sourceX = parseFloat(sourceNode.getAttribute("x")) + parseFloat(sourceNode.getAttribute("width")) / 2;
            sourceY = parseFloat(sourceNode.getAttribute("y")) + parseFloat(sourceNode.getAttribute("height")) / 2;
        }

        if (targetNode.tagName === 'ellipse') {
            targetX = parseFloat(targetNode.getAttribute("cx"));
            targetY = parseFloat(targetNode.getAttribute("cy"));
        } else if (targetNode.tagName === 'polygon') {
            var targetBBox = targetNode.getBoundingClientRect();
            targetX = targetBBox.left + targetBBox.width / 2;
            targetY = targetBBox.top + targetBBox.height / 2;
        } else if (targetNode.tagName === 'rect') {
            targetX = parseFloat(targetNode.getAttribute("x")) + parseFloat(targetNode.getAttribute("width")) / 2;
            targetY = parseFloat(targetNode.getAttribute("y")) + parseFloat(targetNode.getAttribute("height")) / 2;
        }

        var line = document.querySelector(`line[data-source="${rowID}_${link.source}"][data-target="${rowID}_${link.target}"]`);
        if (!line) {
            line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("stroke", "gray");
            line.setAttribute("stroke-width", "2");
            line.setAttribute("data-source", `${rowID}_${link.source}`);
            line.setAttribute("data-target", `${rowID}_${link.target}`);
        }

        line.setAttribute("x1", sourceX);
        line.setAttribute("y1", sourceY);
        line.setAttribute("x2", targetX);
        line.setAttribute("y2", targetY);

        // Find the first shape node (ellipse, polygon, or rect)
        var firstShape = document.querySelector("svg ellipse, svg polygon, svg rect");

        // Insert the line before the first shape node
        if (firstShape) {
            firstShape.parentNode.insertBefore(line, firstShape);
        } else {
            // If no shape is found, append the line to the end of the SVG
            document.querySelector("svg").appendChild(line);
        }
    });
}


// Function to calculate polygon centroid
function calculatePolygonCentroid(polygon) {
    var points = polygon.points;
    var numPoints = points.numberOfItems;
    var x = 0, y = 0;

    for (var i = 0; i < numPoints; i++) {
        x += points.getItem(i).x;
        y += points.getItem(i).y;
    }

    x /= numPoints;
    y /= numPoints;

    return { x: x, y: y };
}


// Function to highlight node1
function highlightNode(nodeID) {
    var node1 = document.getElementById(nodeID);
    if (node1.getAttribute("stroke") === "green") {
        node1.removeAttribute("stroke");
    } else {
        node1.setAttribute("stroke", "green");
    }
}
