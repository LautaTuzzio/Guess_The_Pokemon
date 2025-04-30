// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Create Express app
const app = express();
const REQUIRED_PORT = 3150; // The specific port we want to enforce
const DEFAULT_PORT = REQUIRED_PORT;
const DEFAULT_HOST = '0.0.0.0'; // Listen on all network interfaces by default

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route for home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Function to start the server on a specific host and port
function startServer(host, port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    const io = socketIo(server, {
      cors: {
        origin: '*', // Allow connections from any origin
        methods: ['GET', 'POST']
      }
    });
    
    // Store lobbies
    const lobbies = {};
    
    // Socket.io connection handling
    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);
      
      // Handle creating a lobby
      socket.on('createLobby', (lobbyData) => {
        const lobbyId = generateLobbyId();
        const newLobby = {
          id: lobbyId,
          name: lobbyData.name,
          host: socket.id,
          users: [{ id: socket.id, username: lobbyData.username }]
        };
        
        lobbies[lobbyId] = newLobby;
        socket.join(lobbyId);
        socket.lobbyId = lobbyId;
        
        socket.emit('lobbyCreated', newLobby);
        io.emit('lobbiesUpdated', Object.values(lobbies));
        console.log(`Lobby created: ${lobbyId} by ${socket.id}`);
      });
      
      // Handle joining a lobby
      socket.on('joinLobby', (data) => {
        const { lobbyId, username } = data;
        
        if (lobbies[lobbyId]) {
          // Leave previous lobby if in one
          if (socket.lobbyId) {
            leaveLobby(socket);
          }
          
          // Add user to lobby
          lobbies[lobbyId].users.push({ id: socket.id, username });
          socket.join(lobbyId);
          socket.lobbyId = lobbyId;
          
          socket.emit('joinedLobby', lobbies[lobbyId]);
          io.to(lobbyId).emit('userJoined', { lobbyId, user: { id: socket.id, username } });
          io.emit('lobbiesUpdated', Object.values(lobbies));
          console.log(`User ${socket.id} joined lobby ${lobbyId}`);
        } else {
          socket.emit('error', { message: 'Lobby not found' });
        }
      });
      
      // Handle leaving a lobby
      socket.on('leaveLobby', () => {
        leaveLobby(socket);
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        leaveLobby(socket);
      });
      
      // Send initial lobbies list to the connected user
      socket.emit('lobbiesUpdated', Object.values(lobbies));
    });
    
    // Helper function to handle leaving a lobby
    function leaveLobby(socket) {
      const lobbyId = socket.lobbyId;
      
      if (lobbyId && lobbies[lobbyId]) {
        const lobby = lobbies[lobbyId];
        const userIndex = lobby.users.findIndex(user => user.id === socket.id);
        
        if (userIndex !== -1) {
          const user = lobby.users[userIndex];
          lobby.users.splice(userIndex, 1);
          
          socket.leave(lobbyId);
          io.to(lobbyId).emit('userLeft', { lobbyId, userId: socket.id });
          
          // If the host leaves, assign a new host or delete the lobby
          if (socket.id === lobby.host) {
            if (lobby.users.length > 0) {
              lobby.host = lobby.users[0].id;
              io.to(lobbyId).emit('newHost', { lobbyId, hostId: lobby.host });
            } else {
              delete lobbies[lobbyId];
            }
          }
          
          // If the lobby is empty, remove it
          if (lobby.users.length === 0) {
            delete lobbies[lobbyId];
          }
          
          socket.lobbyId = null;
          io.emit('lobbiesUpdated', Object.values(lobbies));
          console.log(`User ${socket.id} left lobby ${lobbyId}`);
        }
      }
    }
    
    // Generate a random lobby ID
    function generateLobbyId() {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    // Start the server
    server.listen(port, host)
      .on('error', (err) => {
        console.error(`Failed to start server on ${host}:${port}: ${err.message}`);
        reject(err);
      })
      .on('listening', () => {
        console.log(`Server running on ${host}:${port}`);
        resolve(server);
      });
  });
}

// Command line arguments handling for host and port
const args = process.argv.slice(2);
let host = DEFAULT_HOST;
let port = DEFAULT_PORT;

// Look for host and port arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--host' && i + 1 < args.length) {
    host = args[i + 1];
  } else if (args[i].startsWith('--host=')) {
    host = args[i].split('=')[1];
  } else if (args[i] === '--port' && i + 1 < args.length) {
    port = parseInt(args[i + 1], 10);
  } else if (args[i].startsWith('--port=')) {
    port = parseInt(args[i].split('=')[1], 10);
  }
}

// Validate the port number
if (isNaN(port) || port < 1 || port > 65535) {
  console.error(`Error: Invalid port number: ${port}`);
  console.error('Port must be a number between 1 and 65535');
  process.exit(1);
}

// Check if the specified port matches the required port
if (port !== REQUIRED_PORT) {
  console.error(`Error: This application must run on port ${REQUIRED_PORT}`);
  console.error(`You specified port ${port}, which is not allowed`);
  process.exit(1);
}

// Start the server with the specified host and port
startServer(host, port)
  .catch(err => {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  });

// public/index.html
