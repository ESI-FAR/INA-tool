<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SVG plotting</title>
<style>
    .card {
        width: 100%;
        height: 100%;
        border: 1px solid black;
        margin: 20px auto;
        position: relative;
    }
</style>
</head>
<body>

<div class="card" id="svgContainer">
    <svg height="600" width="1200" xmlns="http://www.w3.org/2000/svg">
       
    </svg>

    <!-- Add a div to display the clicked node ID -->
    <hr>
<div id="clicked-node"></div>

</div>

<button onclick="addNodesAndLinks()">Add Nodes and Links</button>
<button onclick="highlightNode()">Highlight Node 1</button>

<script>
// Define nodes
const nodes = [
    { id: 'node1', x: 180, y: 100, size: '10px', color: '#ffc70f', tooltip: 'tooltip text 1' },
    { id: 'node2', x: 460, y: 50, size: '5px', color: '#0fafff', tooltip: 'tooltip text 2 medium length text' },
    { id: 'node3', x: 450, y: 70, size: '15px', color: '#ffc70f', tooltip: 'tooltip text 3' },
    { id: 'node4', x: 650, y: 200, size: '7px', color: '#0fafff', tooltip: 'tooltip text 4' }
];

// Define links
const links = [
    { source: 'node1', target: 'node2' },
    { source: 'node2', target: 'node3' },
    { source: 'node3', target: 'node4' },
    { source: 'node3', target: 'node4' }
];

function addNodesAndLinks() {
    var svgContainer = document.getElementById("svgContainer");
    var svg = svgContainer.querySelector("svg");

    // Add nodes
    nodes.forEach(function(node) {
        var newCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        newCircle.setAttribute("id", node.id);
        newCircle.setAttribute("r", node.size);
        newCircle.setAttribute("cx", node.x);
        newCircle.setAttribute("cy", node.y);
        newCircle.setAttribute("fill", node.color);
        newCircle.setAttribute("data-tooltip", node.tooltip);

        // Add tooltip on mouseover
        newCircle.addEventListener('mouseover', function() {
            var tooltip = document.createElementNS("http://www.w3.org/2000/svg", "text");
            tooltip.textContent = node.tooltip;
            tooltip.setAttribute("x", node.x + 10); // Adjust tooltip position
            tooltip.setAttribute("y", node.y - 10); // Adjust tooltip position
            tooltip.setAttribute("fill", "black");
            tooltip.setAttribute("font-size", "13px");
            svg.appendChild(tooltip);
        });

        // Remove tooltip on mouseout
        newCircle.addEventListener('mouseout', function() {
            var tooltip = svg.querySelector("text");
            if (tooltip) {
                tooltip.remove();
            }
        });

        // Add click event to display the clicked node
        newCircle.addEventListener('click', function() {
            document.getElementById("clicked-node").textContent = "Clicked Node: " + node.id;
        });

        svg.appendChild(newCircle);
    });

    // Add links
    links.forEach(function(link) {
        var sourceNode = document.getElementById(link.source);
        var targetNode = document.getElementById(link.target);

        var newLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newLine.setAttribute("x1", sourceNode.getAttribute("cx"));
        newLine.setAttribute("y1", sourceNode.getAttribute("cy"));
        newLine.setAttribute("x2", targetNode.getAttribute("cx"));
        newLine.setAttribute("y2", targetNode.getAttribute("cy"));
        newLine.setAttribute("stroke", "gray");
        newLine.setAttribute("stroke-width", "2");

        svg.insertBefore(newLine, svg.firstChild); // Insert before first child
    });
}

function highlightNode() {
    var node1 = document.getElementById("node1");
    node1.setAttribute("stroke", "green");
}
</script>

</body>
</html>
