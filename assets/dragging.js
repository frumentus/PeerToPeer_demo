// Handle mouse events for dragging
var run_animated = false
function calculateMouseCanvas(event) {
    const mouserX = event.clientX - canvas.getBoundingClientRect().left
    const mouserY = event.clientY - canvas.getBoundingClientRect().top

    const canvas_px_width = canvas.getBoundingClientRect().width;
    const canvas_px_height = canvas.getBoundingClientRect().height;

    const canvas_width = canvas.width;
    const canvas_height = canvas.height;

    const mouseX = mouserX*(canvas_width/canvas_px_width)
    const mouseY = mouserY*(canvas_height/canvas_px_height)
    return {"X":mouseX,"Y":mouseY}
}

function handleMouseEvents(nodes) {
    const canvas = document.getElementById('networkCanvas');

    let draggingNode = null;

    canvas.addEventListener('mousedown', (event) => {
        run_animated = true
        const mousepos = calculateMouseCanvas(event);
        const mouseX = mousepos.X;
        const mouseY = mousepos.Y;
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
            draggingNode.isDragging = true;
            const mousepos = calculateMouseCanvas(event);
            draggingNode.x = mousepos.X;
            draggingNode.y = mousepos.Y;
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (draggingNode) {
            draggingNode.isDragging = false;
            draggingNode = null;
        }
    });
}


function handleMouseEvents_package(nodes) {
    const canvas = document.getElementById('networkCanvas');
    canvas.addEventListener('mousedown', (event) => {

        const mousepos = calculateMouseCanvas(event);
        const mouseX = mousepos.X;
        const mouseY = mousepos.Y;

        // Check if the mouse is over a node
        nodes.forEach((node) => {
            const distance = Math.sqrt((mouseX - node.x) ** 2 + (mouseY - node.y) ** 2);
            if (distance <= node.size) {

                node.emit();
                
                
            }
        });
    });
}