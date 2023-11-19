// Handle mouse events for dragging
function handleMouseEvents(nodes) {
    const canvas = document.getElementById('networkCanvas');

    let draggingNode = null;

    canvas.addEventListener('mousedown', (event) => {
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;

        // Check if the mouse is over a node
        nodes.forEach((node) => {
            const distance = Math.sqrt((mouseX - node.x) ** 2 + (mouseY - node.y) ** 2);
            if (distance <= node.size) {
                draggingNode = node;
                draggingNode.isDragging = true;
            }
        });
    });

    canvas.addEventListener('mousemove', (event) => {
        if (draggingNode) {
            draggingNode.x = event.clientX - canvas.getBoundingClientRect().left;
            draggingNode.y = event.clientY - canvas.getBoundingClientRect().top;
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (draggingNode) {
            draggingNode.isDragging = false;
            draggingNode = null;
        }
    });
}