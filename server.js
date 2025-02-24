const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

app.use(express.static('public'));

let boardState = []; // Array to hold drawing actions

const io = require('socket.io')(5173, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    },
});

io.on('connection', (socket) => {
  console.log('New client connected');

  // Send current board state to new client
  socket.emit('init', boardState);

  // Listen for drawing events from client
  socket.on('draw', (data) => {
    // data might include x, y coordinates, color, brush size, etc.
    boardState.push(data);
    // Broadcast the drawing action to other clients
    socket.broadcast.emit('draw', data);
  });

  // Listen for clear event from client
  socket.on('clear', () => {
    boardState = []; // Reset board state
    io.emit('clear'); // Notify all clients to clear their board
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5173;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const path = require('path');
// ...
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
