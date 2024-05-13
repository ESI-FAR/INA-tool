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


const nodes = [
    { id: 'node1', x: 200, y: 150, size: '10px', color: '#ffc70f', type: 'activation condition', tooltip: 'tooltip text 1', shape: 'polygon', points: '50,100 15,50 50,0 150,0 185,50 150,100' },
    { id: 'node2', x: 400, y: 150, size: '5px', color: '#0fafff',  type: 'attribute', tooltip: 'tooltip text 2 medium length text', shape: 'circle', radiusX: 80, radiusY: 60 }, // Add radiusX and radiusY for ellipse
    { id: 'node3', x: 600, y: 100, size: '15px', color: '#ffc70f', type: 'aim', tooltip: 'tooltip text 3', shape: 'rect', width: 170, height: 100}, // Add width and height for rectangle
    { id: 'node4', x: 900, y: 100, size: '7px', color: '#0fafff',  type: 'object', tooltip: 'tooltip text 4', shape: 'rect', width: 180, height: 100,  rx: 50, ry: 50 }, // Add width and height for rectangle

    { id: 'node5', x: 300, y: 350, size: '10px', color: '#ffc70f', type: 'activation condition', tooltip: 'tooltip text 5', shape: 'polygon', points: '50,100 15,50 50,0 150,0 185,50 150,100' },
    { id: 'node6', x: 500, y: 350, size: '5px', color: '#0fafff',  type: 'attribute', tooltip: 'tooltip text 6 medium length text', shape: 'circle', radiusX: 80, radiusY: 60 }, // Add radiusX and radiusY for ellipse
    { id: 'node7', x: 700, y: 300, size: '15px', color: '#ffc70f', type: 'aim', tooltip: 'tooltip text 7', shape: 'rect', width: 170, height: 100}, // Add width and height for rectangle
    { id: 'node8', x: 1000, y: 300, size: '7px', color: '#0fafff', type: 'object', tooltip: 'tooltip text 8', shape: 'rect', width: 180, height: 100,  rx: 50, ry: 50 }, // Add width and height for rectangle

];


// Define links
const links = [
    { source: 'node1', target: 'node2' },
    { source: 'node2', target: 'node3' },
    { source: 'node3', target: 'node4' },
    { source: 'node3', target: 'node4' },

    { source: 'node5', target: 'node6' },
    { source: 'node6', target: 'node7' },
    { source: 'node7', target: 'node8' }


];

function addNodesAndLinks() {
    var svgContainer = document.getElementById("svgContainer");
    var svg = svgContainer.querySelector("svg");

    // Add nodes
    nodes.forEach(function(node) {
        var group = document.createElementNS("http://www.w3.org/2000/svg", "g");

        var newNode;
        if (node.shape === 'polygon') {
            // Create a polygon for the node
            newNode = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            newNode.setAttribute("points", node.points);
            // Calculate centroid of the polygon
            var centroid = calculatePolygonCentroid(newNode);

            // Calculate translation needed to move the centroid to (x, y)
            var translationX = node.x - centroid.x;
            var translationY = node.y - centroid.y;

            // Apply translation to the polygon
            newNode.setAttribute("transform", "translate(" + translationX + "," + translationY + ")");
        } else if (node.shape === 'circle') {
            /// Create an ellipse for the node
            newNode = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
            newNode.setAttribute("rx", node.radiusX); // Use the horizontal radius attribute
            newNode.setAttribute("ry", node.radiusY); // Use the vertical radius attribute
            newNode.setAttribute("cx", node.x);
            newNode.setAttribute("cy", node.y);
        } else if (node.shape === 'rect') {
            // Create a rectangle for the node
            newNode = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            newNode.setAttribute("x", node.x);
            newNode.setAttribute("y", node.y);
            newNode.setAttribute("width", node.width); // Use the width attribute
            newNode.setAttribute("height", node.height); // Use the height attribute
            if (node.rx && node.ry) {
                newNode.setAttribute("rx", node.rx); // Set horizontal radius for rounded corners
                newNode.setAttribute("ry", node.ry); // Set vertical radius for rounded corners
            }
        }

        newNode.setAttribute("id", node.id);
        newNode.setAttribute("fill", node.color);
        newNode.setAttribute("data-tooltip", node.tooltip);

        // Add text inside the shape
        var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.textContent = node.type;
        text.setAttribute("fill", "white");
        text.setAttribute("font-size", "18px");
        text.setAttribute("font-family", "calibri");
        text.setAttribute("text-anchor", "middle"); // Center align the text

        var textX, textY;
        if (node.shape === 'rect') {
            if (node.rx && node.ry) {
                // Calculate center position for rectangles with rounded corners
                textX = node.x + node.rx + (node.width - 2 * node.rx) / 2;
                textY = node.y + node.ry + (node.height - 2 * node.ry) / 2;
            } else {
                // Calculate center position for rectangles without rounded corners
                textX = node.x + node.width / 2;
                textY = node.y + node.height / 2;
            }
        } else {
            // Calculate center position for other shapes
            textX = node.x;
            textY = node.y;
        }
        text.setAttribute("x", textX);
        text.setAttribute("y", textY);

        group.appendChild(newNode);
        group.appendChild(text);
        svg.appendChild(group);

        /*

        // Add tooltip on mouseover (!!!this goes in conflict with the text inside the shape at the moment)
        newNode.addEventListener('mouseover', function() {
            var tooltip = document.createElementNS("http://www.w3.org/2000/svg", "text");
            tooltip.textContent = node.tooltip;
            tooltip.setAttribute("x", node.x + 10); // Adjust tooltip position
            tooltip.setAttribute("y", node.y - 10); // Adjust tooltip position
            tooltip.setAttribute("fill", "black");
            tooltip.setAttribute("font-size", "13px");
            svg.appendChild(tooltip);
        });

        // Remove tooltip on mouseout
        newNode.addEventListener('mouseout', function() {
            var tooltip = svg.querySelector("text");
            if (tooltip) {
                tooltip.remove();
            }
        });

        */

        // Add click event to display the clicked node
        newNode.addEventListener('click', function() {
            document.getElementById("clicked-node").textContent = "Clicked Node: " + node.id;
        });

        // Make the group draggable
        group.addEventListener('mousedown', function(event) {
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
                    var centroid = calculatePolygonCentroid(newNode);
                    var deltaX = event.clientX - offsetX - centroid.x;
                    var deltaY = event.clientY - offsetY - centroid.y;
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

                updateEdges();
            }




            function stopMove() {
                document.removeEventListener('mousemove', moveNode);
                document.removeEventListener('mouseup', stopMove);
            }

            document.addEventListener('mousemove', moveNode);
            document.addEventListener('mouseup', stopMove);
        });

    });

    // Add links
    links.forEach(function(link) {
        updateEdges();
    });
}




// Function to update edge positions
function updateEdges() {
    links.forEach(function(link) {
        var sourceNode = document.getElementById(link.source);
        var targetNode = document.getElementById(link.target);

        var sourceX, sourceY, targetX, targetY;

        if (sourceNode.tagName === 'ellipse') {
            sourceX = parseFloat(sourceNode.getAttribute("cx"));
            sourceY = parseFloat(sourceNode.getAttribute("cy"));
        } else if (sourceNode.tagName === 'polygon') {
            // Get the bounding box of the polygon
            var sourceBBox = sourceNode.getBoundingClientRect();
            // Define an offset to adjust the initial edge position (empirical adjustment)
            var offsetX = 250; // Adjust this value as needed (!!! This is a little temporary hack !!!)
            var offsetY = 250; // Adjust this value as needed (!!! This is a little temporary hack !!!)
            // Calculate the center of the bounding box with the offset
            sourceX = sourceBBox.left + sourceBBox.width / 2 - offsetX;
            sourceY = sourceBBox.top + sourceBBox.height / 2 - offsetY;
        }
         else if (sourceNode.tagName === 'rect') {
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

        var line = document.querySelector(`line[data-source="${link.source}"][data-target="${link.target}"]`);
        if (!line) {
            line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("stroke", "gray");
            line.setAttribute("stroke-width", "2");
            line.setAttribute("data-source", link.source);
            line.setAttribute("data-target", link.target);
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
function highlightNode() {
    var node1 = document.getElementById("node1");
    if (node1.getAttribute("stroke") === "green") {
        node1.removeAttribute("stroke");
    } else {
        node1.setAttribute("stroke", "green");
    }
}
