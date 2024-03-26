<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Network Chart - PoC</title>
<style>
    body {
        font-family: Arial, sans-serif;
    }
    #chartcontainer {
        width: 400px;
        height: 300px;
        position: relative;
    }
    .node {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #3498db;
        position: absolute;
    }
    .link {
        stroke: #3498db;
        stroke-width: 2px;
    }

    .highlighted {
        background-color: lightgray !important;
    }

</style>
</head>
<body>

<div id="chartcontainer">
    
    <svg id="network-svg-container" width="1200" height="1400"></svg>
    <hr>
    <div id='clicked_node'></div>
</div>

<!-- Add a div to display the clicked node ID -->
<div id="clicked-node"></div>
<hr>

<script>
    // Define nodes and links
    const nodes = [
        { id: 'node1', x: 180, y: 100, size: '30px', color: '#ffc70f', tooltip: 'tooltip text 1' },
        { id: 'node2', x: 200, y: 50, size: '50px', color: '#0fafff', tooltip: 'tooltip text 2 medium length text' },
        { id: 'node3', x: 350, y: 100, size: '15px', color: '#ffc70f', tooltip: 'tooltip text 3' },
        { id: 'node4', x: 650, y: 200, size: '50px', color: '#0fafff', tooltip: 'tooltip text 4' }
    ];
    const links = [
        { source: 'node1', target: 'node2' },
        { source: 'node2', target: 'node3' },
        { source: 'node3', target: 'node4' },
        { source: 'node3', target: 'node4' }
    ];

    // Create nodes
    function createNodes() {
        const chartContainer = document.getElementById('chartcontainer');
        
        nodes.forEach(node => {
            const divNode = document.createElement('div');
            const className = 'node ' + node.id; // Dynamically create CSS class name
            
            divNode.setAttribute('class', className);
            divNode.setAttribute('id', node.id);
            divNode.style.left = `${node.x}px`;
            divNode.style.top = `${node.y}px`;

            divNode.style.width = node.size; // Apply size
            divNode.style.height = node.size; // Apply size
            divNode.style.backgroundColor = node.color; // Apply color

            // Add tooltip
            divNode.addEventListener('mouseover', () => {
                const tooltip = document.createElement('div');
                tooltip.setAttribute('class', 'tooltip');
                tooltip.textContent = node.tooltip;
                tooltip.style.position = 'absolute';
                tooltip.style.left = `${node.x + 60}px`; // Adjust tooltip position
                tooltip.style.top = `${node.y}px`; // Adjust tooltip position
                chartContainer.appendChild(tooltip);
            });

            divNode.addEventListener('mouseout', () => {
                const tooltip = document.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });

            // Add click event listener
            divNode.addEventListener('click', () => {
                const clickedNodeDiv = document.getElementById('clicked-node');
                clickedNodeDiv.textContent = `Clicked Node: ${node.id}`;
            });

            chartContainer.appendChild(divNode);
        });
    }

    // Call the function to create nodes
    createNodes();

    // Draw links
    const svgContainer = document.getElementById('network-svg-container');
    
    links.forEach(link => {
        const sourceNode = document.getElementById(link.source);
        const targetNode = document.getElementById(link.target);

        const x1 = sourceNode.offsetLeft + sourceNode.offsetWidth / 2;
        const y1 = sourceNode.offsetTop + sourceNode.offsetHeight / 2;
        const x2 = targetNode.offsetLeft + targetNode.offsetWidth / 2;
        const y2 = targetNode.offsetTop + targetNode.offsetHeight / 2;

        const linkElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        linkElement.setAttribute('class', 'link');
        linkElement.setAttribute('x1', x1);
        linkElement.setAttribute('y1', y1);
        linkElement.setAttribute('x2', x2);
        linkElement.setAttribute('y2', y2);

        svgContainer.appendChild(linkElement);

        console.log(svgContainer);

    });

    // Function to highlight node 2 and connected edges
    function highlightNode() {
        alert("Ciao");
        
    }
</script>

<!-- Add button to trigger node highlighting -->
<button onclick='highlightNode()'>Highlight Node 2</button>

</body>
</html>
