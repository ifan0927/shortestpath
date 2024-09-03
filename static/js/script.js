const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const matrixElement = document.getElementById('matrix');
const start_button = document.getElementById('start_button');
const end_button = document.getElementById('end_button');

let circles = [];
let edges = [];
let isDragging = false;
let startCircle = null;
let adjacencyMatrix = [];
let selected = 0;
let temp_node;
var start_node = false;
var end_node = false;
var check = [-1, -1];
var id = 0;
const radius = 20;

// 設置 Canvas 的內部尺寸為 1200x600
function setCanvasSize() {
    canvas.width = 1200;
    canvas.height = 600;
}

// 調整 Canvas 的顯示尺寸以適應視口
function resizeCanvas() {
    // 根據容器大小調整 Canvas 顯示尺寸
    const container = canvas.parentElement;
    const ratio = Math.min(container.clientWidth / 1200, container.clientHeight / 600);
    canvas.style.width = `${1200 * ratio}px`;
    canvas.style.height = `${600 * ratio}px`;
}

// 初始設置 Canvas 尺寸
setCanvasSize();
resizeCanvas();

// 當窗口大小變化時重新調整 Canvas 顯示尺寸
window.addEventListener('resize', resizeCanvas);

// 將 Canvas 內部坐標轉換為顯示坐標
function getCanvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    return { x, y };
}

function showError(message) {
    var modalBody = document.getElementById('modal-body');
    var errorModal = new bootstrap.Modal(document.getElementById('errorModal'));

    modalBody.textContent = message;
    errorModal.show();

    setTimeout(function() {
        errorModal.hide();
    }, 3000); // 3秒後自動隱藏
}

function drawCircle(circle) {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = circle.color;
    ctx.lineWidth = 2; 
    ctx.stroke(); 
    if (circle.id != -1) {
        ctx.fillStyle = 'black'; 
        ctx.font = '18px Arial'; 
        ctx.textAlign = 'center'; 
        ctx.textBaseline = 'middle'; 
        ctx.fillText(circle.id, circle.x, circle.y);
    }
}

function drawEdge(edge) {
    ctx.beginPath();
    ctx.moveTo(edge.start.x, edge.start.y);
    ctx.lineTo(edge.end.x, edge.end.y);
    ctx.strokeStyle = edge.color;
    ctx.stroke();
    
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    const midX = (edge.start.x + edge.end.x) / 2;
    const midY = (edge.start.y + edge.end.y) / 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(edge.weight, midX, midY);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    circles.forEach(drawCircle);
    edges.forEach(drawEdge);
    updateMatrix();
}

function updateMatrix() {
    const size = circles.length;
    adjacencyMatrix = Array.from({ length: size }, () => Array(size).fill(-1));
    
    for (let i = 0; i < size; i++) {
        adjacencyMatrix[i][i] = 0;
    }
    
    edges.forEach(edge => {
        const startIndex = edge.start.id;
        const endIndex = edge.end.id;
        if (startIndex !== -1 && endIndex !== -1) {
            adjacencyMatrix[startIndex][endIndex] = edge.weight;
            adjacencyMatrix[endIndex][startIndex] = edge.weight; 
        }
    });
}

canvas.addEventListener('click', (event) => {
    const { x, y } = getCanvasCoordinates(event);
    
    const red_radius = 10;
    const padding = 30;
    const color = 'black';
    
    if (isDragging) {
        const endCircle = circles.find(c => Math.hypot(c.x - x, c.y - y) < c.radius);
        if (endCircle && endCircle !== startCircle) {
            
            let weight = parseFloat(prompt('Enter weight for the edge:'));
            if (isNaN(weight) || weight <= 0) {
                showError('Please enter a valid positive number for the weight.');
                return;
            }

            edges = edges.filter(edge => !(edge.start.id === startCircle.id && edge.end.id === endCircle.id));
            edges.push({ start_circle: startCircle.id, end_circle: endCircle.id, start: startCircle, end: endCircle, weight, color });
            draw();
        } else {
            showError('no end node found!');
            end_button.innerText = "Click to put end node!";
            start_button.innerText = "Click to put start node!";
            selected = 0;
            draw();
        }
        isDragging = false;
        startCircle = null;
    } else {
        const existingCircle = circles.find(c => Math.hypot(c.x - x, c.y - y) < c.radius + padding);
        if (!existingCircle) {
            if (start_node) {
                const s_node = circles.find(c => c.s == 1);
                if (s_node) {
                    s_node.color = "black";
                    s_node.start = 0;
                }
                circles.push({ id: id, x, y, radius, color: "blue", s: 1, e: 0 });
                check[0] = id; 
                start_node = false;
                start_button.innerText = "Click to put start node!";
            } else if (end_node) {
                const e_node = circles.find(c => c.e == 1);
                if (e_node) {
                    e_node.color = "black";
                    e_node.end = 0;
                }
                circles.push({ id: id, x, y, radius, color: "orange", s: 0, e: 1 }); 
                check[1] = id; 
                end_node = false;
                end_button.innerText = "Click to put end node!";
            } else {
                circles.push({ id: id, x, y, radius, color: color, s: 0, e: 0 }); 
            }
            id++;
        } else {
            circles.push({ id: -1, x: existingCircle.x, y: existingCircle.y, radius: radius + red_radius, color: "red", s: 0, e: 0 });
            end_button.innerText = "Change to end node!";
            start_button.innerText = "Change to start node!";
            selected = 1;
            temp_node = existingCircle;
            isDragging = true;
            startCircle = existingCircle;
        }
        draw();
        circles = circles.filter(circle => !(circle.id === -1));
    }
});

function draw_path() {
    console.log(adjacencyMatrix);
    console.log(circles);
    var xhr = new XMLHttpRequest();
    if (check[0] != -1 && check[1] != -1) {
        xhr.open("POST", "/process-grid", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        console.log("123");
                        console.log(response.edges);
                        edges = response.edges;
                        adjacencyMatrix = response.grid;
                        check = response.check;
                        circles = response.circles;
                        updateMatrix();
                        draw();
                    } catch (e) {
                        //console.error("Error parsing JSON:", e);
                    }
                } else {
                    //console.error("Request failed with status " + xhr.status);
                }
            }
        };
        var data = {
            grid: adjacencyMatrix,
            circles: circles,
            edges: edges,
            check: check
        };
        xhr.send(JSON.stringify(data));
    } else {
        alert('Please enter start node and end node');
    }
}

function start_button_event() {
    if (!selected) {
        start_node = true;
        end_node = false;
        end_button.innerText = "Click to put end node!";
        start_button.innerText = "Start node Selected!";
    } else {
        circles = circles.map(circle => {
            if (circle.s === 1) {
                return { ...circle, s: '0', color: 'black' };
            }
            return circle; 
        });
        circles = circles.filter(circle => !(circle.id === temp_node.id));        
        circles.push({ id: temp_node.id, x: temp_node.x, y: temp_node.y, radius: radius, color: "blue", s: 1, e: 0 });
        check[0] = temp_node.id; 
        end_button.innerText = "Click to put end node!";
        start_button.innerText = "Click to put start node!";
        draw();
        selected = 0;
        isDragging = false;
    }
}

function end_button_event() {
    if (!selected) {
        start_node = false;
        end_node = true;
        end_button.innerText = "End node Selected";
        start_button.innerText = "Click to put start node!";
    } else {
        circles = circles.map(circle => {
            if (circle.e === 1) {
                return { ...circle, e: '0', color: 'black' };
            }
            return circle; 
        });
        circles = circles.filter(circle => !(circle.id === temp_node.id));
        console.log("12");
        console.log(circles);
        
        circles.push({ id: temp_node.id, x: temp_node.x, y: temp_node.y, radius: radius, color: "orange", s: 0, e: 1 });
        check[1] = temp_node.id; 
        end_button.innerText = "Click to put end node!";
        start_button.innerText = "Click to put start node!";
        draw();
        selected = 0;
        isDragging = false;
    }
}

draw();
