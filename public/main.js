// Connect to the Socket.IO server

const socket = io('http://localhost:5173');

// Get references to the DOM elements
const canvas = document.getElementById('whiteboard');
const context = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const clearBtn = document.getElementById('clearBtn');

let drawing = false;
let current = {};

// Helper function to draw a line on the canvas
function drawLine(x0, y0, x1, y1, color, emit) {
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.strokeStyle = color;
  context.lineWidth = 2; // Change as needed for a thicker brush
  context.stroke();
  context.closePath();

  // If `emit` is true, send this drawing action to the server
  if (!emit) return;
  const data = { x0, y0, x1, y1, color };
  socket.emit('draw', data);
}

// Listen for mouse events on the canvas

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  current.x = e.clientX - canvas.offsetLeft;
  current.y = e.clientY - canvas.offsetTop;
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;
  // Instead of drawing immediately, emit the drawing action to the server
  drawLine(current.x, current.y, x, y, colorPicker.value, true);
  current.x = x;
  current.y = y;
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
});

canvas.addEventListener('mouseout', () => {
  drawing = false;
});

// Handle clear board button
clearBtn.addEventListener('click', () => {
  socket.emit('clear');
});

// Socket.IO events handling

// When the server sends the initial board state upon connection
socket.on('init', (boardState) => {
  boardState.forEach((action) => {
    drawLine(action.x0, action.y0, action.x1, action.y1, action.color, false);
  });
});

// When a drawing action is received from the server
socket.on('draw', (data) => {
  drawLine(data.x0, data.y0, data.x1, data.y1, data.color, false);
});

// When a clear event is received from the server
socket.on('clear', () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
});
