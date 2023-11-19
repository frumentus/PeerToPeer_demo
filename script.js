var id_package_count = 0
var package_speed = 4
var run_animated = false
var size_modifier = 2





class InfoPackage {
    constructor(node,node1,node2,info_package,conpar) {
        this.node1 = node1
        this.node2 = node2
        this.conpar = conpar
        this.progress = 0.5
        this.size = 5
        this.direction = 0
        this.speed = 1

        this.info_package = info_package;
        if (node === this.node1) {
            if (this.posdirection && this.runningInfo) {return}
            this.posdirection = true
            this.progress = 0
        } else {
            if (!this.posdirection && this.runningInfo) {return}
            this.posdirection = false
            this.progress = 1
        }

        this.runningInfo = true
    }

    drawInfo() {
        if (this.runningInfo) {
            const canvas = document.getElementById('networkCanvas');
            const ctx = canvas.getContext('2d');

            const dx = this.node2.x-this.node1.x;
            const dy = this.node2.y-this.node1.y;

            const xpos = this.node1.x+dx* this.progress ;
            const ypos = this.node1.y+dy* this.progress ;



            ctx.beginPath();
            ctx.arc(xpos, ypos, this.size*size_modifier, 0, 2 * Math.PI);
            ctx.fillStyle = this.info_package.color;
            ctx.fill();

            

            if(this.posdirection) {
                this.progress += 0.001*this.speed*package_speed
                if(this.progress > 1) {
                    this.runningInfo = false;
                    this.conpar.removeInp(this);
                    this.node2.notify(this.node1,this.info_package);
                }
            } else {
                this.progress -= 0.001*this.speed*package_speed
                if(this.progress < 0) {
                    this.runningInfo = false;
                    this.conpar.removeInp(this);
                    this.node1.notify(this.node2,this.info_package);
                }
            }

        }

    }

}


class Connection {
    constructor (node1, node2) {
        this.node1 = node1
        this.node2 = node2

        

        this.InPctive = []


    }
    inCon(node) {
        return this.node1 == node || this.node2 == node
    }

    removeInp(InP) {
        this.InPctive = this.InPctive.filter(item => item !== InP);
    }

    startanimation(node,info_package) {
        const InP = new InfoPackage(node,this.node1,this.node2,info_package,this)
        this.InPctive.push(InP)
    }
    drawInfo() {
        this.InPctive.forEach((InP) => {
            InP.drawInfo();
        })
    }

    drawLine() {
        const canvas = document.getElementById('networkCanvas');
        const ctx = canvas.getContext('2d');
    
        ctx.beginPath();
        ctx.moveTo(this.node1.x, this.node1.y);
        ctx.lineTo(this.node2.x, this.node2.y);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2*size_modifier;
        ctx.stroke();
    }
}

var connections = []


class Node {
    constructor(x, y, color, size, _name) {
        this._name = _name;
        this.dragging = false;
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.connections = [];
        this.marked = false

        this.maxRepelDistance = 200; 
        this.repelForceFactor = 0.4; 
        this.conForceFactor = 0.2; 

        this.inforate = 1; 

        this.infostorage = []
                   //chances executed every 5s
    }
    drawNode(node) {
        const canvas = document.getElementById('networkCanvas');
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        if(this.marked) {
            ctx.arc(node.x, node.y, node.size+2*size_modifier, 0, 2 * Math.PI);
            ctx.fillStyle = '#000000';
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
        ctx.fill();
     
        

    }

    connectTo(otherNode) {
        const con = new Connection(this,otherNode)
        this.connections.push(con);
        otherNode.connections.push(con);
        if (!connections.includes(con)){
            connections.push(con);
        }
        con.drawLine()
    }

    isConnectedTo(otherNode) {
        
        this.connections.forEach((con) => {
            if(con.node1 == otherNode || con.node2 == otherNode) {
                return true
            }
        }) 
    }

    runanimation() {
        this.connections.forEach((con) => {
            
            con.startanimation(this)
        })
    }

    notify(fromnode,info_package) {
        if(!this.infostorage.includes(info_package.id)) {
            this.infostorage.push(info_package.id)
            this.propagate(fromnode,info_package)
        }
    }   

    propagate(fromnode,info_package) {
        this.connections.forEach((con) => {
            if(!con.inCon(fromnode)) {
                con.startanimation(this,info_package)
            }
        })
    }

    emit() {
        id_package_count += 1
        const info_package = {"id":id_package_count,"content":"new Block","color":this.color,"receivedfrom":"node1"}
        this.infostorage.push(info_package.id)
        this.propagate(undefined,info_package)
        this.marked = true;
        setTimeout(() => {this.marked = false;},300)
    }
    

}



function addNode(x, y, color, size, _name) {
    const canvas = document.getElementById('networkCanvas');
    const ctx = canvas.getContext('2d');

    const newNode = new Node(x, y, color, size, _name);

    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    return newNode;
}




function updateNodes_con(node) {


    // Apply repellant force between nodes
    node.connections.forEach((Con) => {
        const otherNode = Con.node1 === node ? Con.node2 : Con.node1 

        const dx = otherNode.x - node.x;
        const dy = otherNode.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        var maxRepelDistance = Math.max(node.maxRepelDistance,otherNode.maxRepelDistance)
        var conForceFactor = node.conForceFactor + otherNode.conForceFactor

        // const repelForce = (maxRepelForce / Math.pow(distance, 2)) * Math.min(1, maxRepelDistance / distance)
        const repelForce = conForceFactor * (maxRepelDistance - distance) / maxRepelDistance;
        // const repelForce = 0.1;

        const forceX = ((dx / distance) * repelForce * otherNode.size/20);
        const forceY = ((dy / distance) * repelForce * otherNode.size/20);

        // Update node position based on repellant force

        node.x -= forceX;
        node.y -= forceY;


    });
}

function updateNodes_repel(node,nodes) {
    // const maxRepelDistance = 100; // Maximum distance for repellant force
    // const repelForceFactor = 0.3; // Repellant force factor

    // Apply repellant force between nodes
    nodes.forEach((otherNode) => {
        if(node !== otherNode) {
            const dx = otherNode.x - node.x;
            const dy = otherNode.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            var maxRepelDistance = Math.max(node.maxRepelDistance,otherNode.maxRepelDistance)
            var repelForceFactor = node.repelForceFactor + otherNode.repelForceFactor

            if( distance < maxRepelDistance) {
            // const repelForce = (maxRepelForce / Math.pow(distance, 2)) * Math.min(1, maxRepelDistance / distance)
            const repelForce = repelForceFactor * (maxRepelDistance - distance) / maxRepelDistance;
            // const repelForce = 0.1;

            const forceX = ((dx / distance) * repelForce * otherNode.size/20);
            const forceY = ((dy / distance) * repelForce * otherNode.size/20);

            node.x -= forceX;
            node.y -= forceY;

            }
        }

    });
}

function updateNodes(nodes) {
    const canvas = document.getElementById('networkCanvas');
    // const repelForce = 0.1;
    

    //(((-x+40)/(40)))^(2 a)*20

    // console.log(nodes)
    //add notes animation and only animate when change in system
    nodes.forEach((node) => {
        if (!node.dragging) {



            updateNodes_con(node)
            updateNodes_repel(node,nodes)

            
            // updateNodes_con(node)

            // Update node position within canvas bounds
            node.x = Math.max(node.size, Math.min(canvas.width - node.size, node.x));
            node.y = Math.max(node.size, Math.min(canvas.height - node.size, node.y));
        }
    });
}

function animate(nodes) {
    const canvas = document.getElementById('networkCanvas');
    const ctx = canvas.getContext('2d');
    function animateFrame() {

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update 
        if( run_animated) {
            updateNodes(nodes);
        }
        

        // Draw connections
        nodes.forEach((node) => {
            node.connections.forEach((con) => {
                con.drawLine();
                con.drawInfo();

            });
        });

        //draw nodes
        nodes.forEach((node) => {
            node.drawNode(node)
        });

        

        // Request the next animation frame
        requestAnimationFrame(animateFrame);
    }

    // Start the animation
    animateFrame();
}

async function roleforInfo(nodes) {
    nodes.forEach((node) => {
        if (Math.random() < node.inforate) {
            node.runanimation();  
        }
    })
    setTimeout(() => this.roleforInfo(nodes),500*Math.random())
}



async function random_packeds_send(nodes) {
    const nodesIndex = Math.floor(Math.random() * nodes.length);
    const node = nodes[nodesIndex];
    node.emit()
    setTimeout(() => this.random_packeds_send(nodes),500*Math.random()+id_package_count*100)
}

// Example usage:
// Assuming you have addNode and connectTo functions

// Create nodes with different colors
function calculateCircleCoordinates(radius, angle, centerX, centerY) {
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y };
}
const canvas = document.getElementById('networkCanvas');
// Create nodes with different colors
const numNodes = 15;
const circleRadius = Math.min(canvas.width,canvas.height)/2*0.8;
const centerX = canvas.width/2;
const centerY = canvas.height/2;

const nodes = [];

// Array of colors
const nodeColors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#d35400', '#34495e', '#e67e22', '#c0392b'];


// Create nodes evenly distributed on a circle
for (let i = 0; i < numNodes; i++) {
    const angle = (i / numNodes) * 2 * Math.PI;
    const { x, y } = calculateCircleCoordinates(circleRadius, angle, centerX, centerY);
    const colorIndex = Math.floor(Math.random() * nodeColors.length);
    const color = nodeColors[colorIndex];
    const node = addNode(x, y, color, 20*size_modifier, "Node " + (i + 1));
    nodes.push(node);
}

// Connect nodes randomly
for (let i = 0; i < nodes.length; i++) {
    const currentNode = nodes[i];
    const numConnections = Math.floor(Math.random() * 5) + 1; // Randomly connect to 1 to 3 other nodes

    for (let j = 0; j < numConnections; j++) {
        const randomIndex = Math.floor(Math.random() * nodes.length);
        const connectedNode = nodes[randomIndex];

        // Avoid self-connections and duplicate connections
        if (connectedNode !== currentNode && !currentNode.isConnectedTo(connectedNode)) {
            currentNode.connectTo(connectedNode);
        }
    }
}

// Start the animation with all nodes
animate(nodes);
// roleforInfo(nodes);
// handleMouseEvents(nodes);
document.addEventListener("resize",() => {
    handleMouseEvents_package(nodes);

})
handleMouseEvents_package(nodes);
// setTimeout(() => random_packeds_send(nodes),5000);
// random_packeds_send(nodes)
