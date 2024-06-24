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
            type: 'activationCondition',
            points: [[60,120], [18,60], [60,0], [180,0], [222,60], [180,120]],
        },
        {
            id: 2,
            x: 120*2.3, y: 30,
            shape: 'circle',
            type: 'attribute',
            radiusX: 48 * 2,  // Adjusted radiusX for 2 times bigger
            radiusY: 36 * 1.7,  // Adjusted radiusY for 2 times bigger
        },
        {
            id: 3,
            x: 240*1.7, y: -30,
            shape: 'rect',
            type: 'aim',
            width: 100 * 2,   // Adjusted width for 2 times bigger
            height: 60 * 2,   // Adjusted height for 2 times bigger
        },
        {
            id: 4,
            x: 420*1.5, y: -30,
            shape: 'rect',
            type: 'directObject',
            width: 110 * 2,   // Adjusted width for 2 times bigger
            height: 60 * 2,   // Adjusted height for 2 times bigger
            rx: 30 * 2,       // Adjusted rx for 2 times bigger
            ry: 30 * 2,       // Adjusted ry for 2 times bigger
        },
        {
            id: 5,
            x: 240*1.65, y: 120,
            shape: 'rect',
            type: 'executionConstraint',
            width: 110 * 2,   // Adjusted width for 2 times bigger
            height: 60 * 2,   // Adjusted height for 2 times bigger
            rx: 30 * 2,       // Adjusted rx for 2 times bigger
            ry: 30 * 2,       // Adjusted ry for 2 times bigger
        },
        {
            id: 6,
            x: 420*1.5, y: 120,
            shape: 'rect',
            type: 'indirectObject',
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


const colors = { formal: '#5896E8', informal: '#EDBA2F' }

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
    let svgContainer = document.getElementById("svgContainer");
    let svg = svgContainer.querySelector("svg");

    const rowHeight = 300;
    const startDrawingAt = { x: 75, y: 30 };

    // Add nodes and links for each row
    rowValues.forEach(function (row, rowIndex) {

        // Map row attributes to their respective values
        let entries = rowAttributes.map((attribute, idx) => {
            return [attribute, row[idx]];
        });
        let rowObj = Object.fromEntries(entries);

        // Calculate y offset for this row
        let yOffset = startDrawingAt.y + (rowIndex * rowHeight);

        // Create a group for the row
        let rowGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        svg.appendChild(rowGroup);

        // Create groups for nodes and edges within the row group
        let nodesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        let edgesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        rowGroup.appendChild(nodesGroup); // Append nodes group first
        rowGroup.appendChild(edgesGroup); // Append edges group second

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
            newNode.setAttribute("fill", colors[rowObj.statementType]); // Use rowObj.statementType to get the correct color
            newNode.setAttribute("stroke", "lightgray");
            newNode.setAttribute("stroke-width", "2");
            newNode.setAttribute("id", `${row[0]}_${template_node.id}`);

            // Append the new node to the nodes group
            nodesGroup.appendChild(newNode);

            // Add text to the node
            let textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
            let textX = nodeX, textY = nodeY;

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

            // Adjust text position for polygons and rectangles
            if (template_node.shape === 'polygon') {
                // Calculate polygon center as average of vertex coordinates
                let points = template_node.points.map(point => {
                    let [px, py] = point;
                    return { x: px + nodeX, y: py + nodeY };
                });

                let totalX = 0, totalY = 0;
                points.forEach(point => {
                    totalX += point.x;
                    totalY += point.y;
                });

                let centerX = totalX / points.length;
                let centerY = totalY / points.length;

                textX = centerX-70;
                textY = centerY-30; // Adjust vertical position as needed
            }

            textElement.setAttribute("x", textX);
            textElement.setAttribute("y", textY);
            textElement.setAttribute("fill", "black");
            textElement.setAttribute("font-size", "10px");
            textElement.setAttribute("text-anchor", "middle");
            textElement.setAttribute("alignment-baseline", "middle");

            // Wrap text if longer than 20 characters
            if (textContent.length > 20) {
                let words = textContent.split(' ');
                let line = '';
                let lineNumber = 0;
                let lineHeight = 10; // Adjust as needed
                let maxLineLength = 25; // Maximum characters per line

                words.forEach(function (word, index) {
                    let testLine = line + word + ' ';
                    if (testLine.length > maxLineLength) {
                        // Create tspan for current line
                        let tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                        tspan.setAttribute("x", textX);
                        tspan.setAttribute("y", textY + lineHeight * lineNumber);
                        tspan.textContent = line;
                        textElement.appendChild(tspan);
                        line = word + ' ';
                        lineNumber++;
                    } else {
                        line = testLine;
                    }
                });

                // Add the last line
                let tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                tspan.setAttribute("x", textX);
                tspan.setAttribute("y", textY + lineHeight * lineNumber);
                tspan.textContent = line;
                textElement.appendChild(tspan);
            } else {
                // If text is short, just add it as a single tspan
                textElement.textContent = textContent;
            }

            nodesGroup.appendChild(textElement);
        });

        // Add edges to the edges group after nodes
        updateEdges(row[0], edgesGroup); // Pass edgesGroup instead of rowGroup

        // Enable dragging of the entire row group
        let isDragging = false;
        let startX, startY;
        let startTransform;

        rowGroup.addEventListener('mousedown', function (event) {
            isDragging = true;
            startX = event.clientX;
            startY = event.clientY;
            startTransform = getTransform(rowGroup);

            event.stopPropagation(); // Prevent nodes from receiving this event
        });

        window.addEventListener('mousemove', function (event) {
            if (!isDragging) return;

            let dx = event.clientX - startX;
            let dy = event.clientY - startY;

            rowGroup.setAttribute('transform', `translate(${startTransform.translateX + dx}, ${startTransform.translateY + dy})`);
        });

        window.addEventListener('mouseup', function (event) {
            if (isDragging) {
                isDragging = false;
            }
        });
    });
}

function updateEdges(rowID, edgesGroup) {
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

        // Find the first shape node within the current row group
        let rowGroup = edgesGroup.parentNode; // Get the row group containing edges and nodes
        let firstShape = rowGroup.querySelector("ellipse, polygon, rect");

        // Insert the line before the first shape node in the current row group
        if (firstShape) {
            firstShape.parentNode.insertBefore(line, firstShape);
        } else {
            // If no shape is found, append the line to the end of the edges group
            edgesGroup.appendChild(line);
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
        let translateMatch = transform.match(/translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/);
        if (translateMatch) {
            return {
                translateX: parseFloat(translateMatch[1]),
                translateY: parseFloat(translateMatch[2])
            };
        }
    }
    return { translateX: 0, translateY: 0 };
}
