const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

// Default network settings
const DEFAULT_HOST = '0.0.0.0' // Listen on all available network interfaces
const REQUIRED_PORT = 3150 // The specific port we want to enforce
const DEFAULT_PORT = REQUIRED_PORT

// Parse command line arguments
const args = process.argv.slice(2)
let HOST = DEFAULT_HOST
let PORT = DEFAULT_PORT

// Process command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--host' && i + 1 < args.length) {
    HOST = args[i + 1]
  } else if (args[i].startsWith('--host=')) {
    HOST = args[i].split('=')[1]
  } else if (args[i] === '--port' && i + 1 < args.length) {
    PORT = parseInt(args[i + 1], 10)
  } else if (args[i].startsWith('--port=')) {
    PORT = parseInt(args[i].split('=')[1], 10)
  }
}

// Check if the specified port matches the required port
if (PORT !== REQUIRED_PORT) {
  console.error(`Error: This application must run on port ${REQUIRED_PORT}`)
  console.error(`You specified port ${PORT}, which is not allowed`)
  process.exit(1)
}

// Create Express app and server
const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow connections from any origin
    methods: ['GET', 'POST']
  }
})

// Track rooms and their members
const rooms = {}

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)))

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

// Route for game room
app.get('/room/:roomId', (req, res) => {
  const roomId = req.params.roomId
  if (rooms[roomId]) {
    res.sendFile(path.join(__dirname, 'index.html'))
  } else {
    res.redirect('/')
  }
})

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Nuevo cliente conectado: ${socket.id}`)
  
  // Crear una nueva sala
  socket.on('create_room', () => {
    const roomId = uuidv4().substring(0, 6) // Generate shorter room ID for convenience
    
    // Join the socket to this room
    socket.join(roomId)
    
    // Add room to our tracking object
    rooms[roomId] = {
      members: [{
        id: socket.id,
        isReady: false
      }],
      gameStarted: false
    }
    
    console.log(`Sala creada: ${roomId} por ${socket.id}`)
    
    // Enviar ID de sala al cliente
    socket.emit('room_created', {
      roomId: roomId,
      members: rooms[roomId].members
    })
  })
  
  // Unirse a una sala existente
  socket.on('join_room', (data) => {
    const roomId = data.roomId
    
    // Verificar si la sala existe
    if (!rooms[roomId]) {
      socket.emit('error', { message: 'La sala no existe' })
      return
    }
    
    // Verificar si el usuario ya esta en la sala
    const existingMember = rooms[roomId].members.find(m => m.id === socket.id)
    if (existingMember) {
      return // Ya esta en la sala, no hacer nada
    }
    
    // Join the socket to this room
    socket.join(roomId)
    
    // Add member to room
    rooms[roomId].members.push({
      id: socket.id,
      isReady: false
    })
    
    console.log(`Usuario ${socket.id} se unio a la sala: ${roomId}`)
    
    // Notificar a todos en la sala que un nuevo usuario se unio
    io.to(roomId).emit('user_joined', {
      userId: socket.id,
      roomId: roomId
    })
    
    // Confirmar al usuario que se ha unido
    socket.emit('joined_room', {
      roomId: roomId,
      members: rooms[roomId].members
    })
  })
  
  // Manejar el estado de listo del jugador
  socket.on('player_ready', (data) => {
    const roomId = data.roomId
    const isReady = data.isReady
    
    if (!roomId || !rooms[roomId]) {
      socket.emit('error', { message: 'Invalid room' })
      return
    }
    
    // Actualizar estado de listo del jugador
    const member = rooms[roomId].members.find(m => m.id === socket.id)
    if (member) {
      member.isReady = isReady
    }
    
    // Verificar si todos los jugadores estan listos
    const allReady = rooms[roomId].members.every(m => m.isReady)
    
    // Si todos los jugadores estan listos y el juego no ha comenzado, generar ID de Pokemon
    if (allReady && !rooms[roomId].gameStarted) {
      
      rooms[roomId].pokemonId = Math.floor(Math.random() * 1025) + 1
      rooms[roomId].gameStarted = true
      console.log(`ID de Pokemon generado ${rooms[roomId].pokemonId} para sala ${roomId}`)
      console.log(`Sala ${roomId} ahora tiene ID de Pokemon: ${rooms[roomId].pokemonId}`)
    }
    
    // Notificar a todos los jugadores en la sala sobre la actualizacion del estado
    io.to(roomId).emit('player_ready_update', {
      roomId: roomId,
      members: rooms[roomId].members,
      allReady: allReady,
      gameStarted: rooms[roomId].gameStarted
    })

    // Si el juego ha comenzado, enviar ID de Pokemon por separado
    if (rooms[roomId].gameStarted) {
      io.to(roomId).emit('game_started', {
        roomId: roomId,
        pokemonId: rooms[roomId].pokemonId
      })
    }
  })
  
  // Enviar mensaje dentro de una sala
  socket.on('say_hello', (data) => {
    const roomId = data.roomId
    
    if (!roomId || !rooms[roomId]) {
      socket.emit('error', { message: 'Invalid room' })
      return
    }
    
    console.log(`Servidor recibio: Hola de ${socket.id} en sala ${roomId}`)
    
    // Transmitir el mensaje a todos en la sala
    io.to(roomId).emit('hello_received', {
      userId: socket.id,
      roomId: roomId
    })
  })

  // Obtener informacion de la sala
  socket.on('get_room_info', (data) => {
    const roomId = data.roomId
    if (rooms[roomId]) {
      socket.emit('room_info', {
        roomId: roomId,
        members: rooms[roomId].members
      })
    }
  })

  // Manejar la obtencion del ID de Pokemon para la sala
  socket.on('get_pokemon_id', (data) => {
    const roomId = data.roomId
    console.log('Solicitud get_pokemon_id recibida para sala:', roomId)
    if (rooms[roomId]) {
      console.log('Sala encontrada, enviando ID de Pokemon:', rooms[roomId].pokemonId)
      // Enviar a todos los sockets en la sala
      io.to(roomId).emit('pokemon_id', {
        roomId: roomId,
        pokemonId: rooms[roomId].pokemonId
      })
    } else {
      console.log('Sala no encontrada:', roomId)
    }
  })
  
  // Manejar las suposiciones de los jugadores
  socket.on('player_guess', (data) => {
    const { roomId, playerId, pokemonName } = data
    console.log(`[EVENTO DE JUEGO] Usuario ${playerId} ha adivinado ${pokemonName} en sala ${roomId}`)
  })
  
  // Manejar registros generales del cliente
  socket.on('client_log', (data) => {
    const { event, roomId, playerId, pokemonId } = data
    if (event === 'received_pokemon_id') {
      console.log(`[EVENTO DE JUEGO] Cliente ${playerId} recibio ID de Pokemon ${pokemonId} en sala ${roomId}`)
    } else {
      console.log(`[REGISTRO DE CLIENTE] ${JSON.stringify(data)}`)
    }
  })

  // Manejar victoria del jugador
  socket.on('player_win', (data) => {
    const { roomId, playerId, pokemonName } = data
    console.log(`[EVENTO DE JUEGO] Jugador ${playerId} gano en sala ${roomId} adivinando ${pokemonName}`)
    
    if (rooms[roomId]) {
      // Transmitir dos veces para asegurar la entrega - usando transmision especifica de sala y global
      io.to(roomId).emit('game_over', {
        roomId: roomId,
        winnerId: playerId,
        pokemonName: pokemonName
      })
      
      // Tambien transmitir un mensaje simple que es mas facil de mostrar
      io.to(roomId).emit('someone_has_won', {
        message: `Jugador ${playerId} ha ganado adivinando ${pokemonName}!`,
        roomId: roomId,
        winnerId: playerId,
        pokemonName: pokemonName
      })
      
      // Usar transmision global como respaldo
      io.emit('global_game_event', {
        type: 'win',
        roomId: roomId,
        winnerId: playerId,
        pokemonName: pokemonName,
        message: `Jugador ${playerId} ha ganado en sala ${roomId} adivinando ${pokemonName}!`
      })
      
      console.log(`[EVENTO DE JUEGO] Notificado a todos los jugadores en sala ${roomId} que jugador ${playerId} gano`)
    } else {
      console.log('[EVENTO DE JUEGO] Sala no encontrada para notificacion de ganador:', roomId)
    }
  })

  // Manejar desconexion
  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`)
    
    // Eliminar usuario de todas las salas en las que estaba
    for (const roomId in rooms) {
      const room = rooms[roomId]
      
      // Si el usuario estaba en esta sala
      const index = room.members.findIndex(m => m.id === socket.id)
      if (index !== -1) {
        // Eliminar del array de miembros
        room.members.splice(index, 1)
        
        // Notificar a otros en la sala
        io.to(roomId).emit('user_left', {
          userId: socket.id,
          roomId: roomId
        })
        
        console.log(`Usuario ${socket.id} salio de la sala: ${roomId}`)
        
        // Mantener salas incluso cuando estan vacias para reconexion
        console.log(`Sala ${roomId} ahora tiene ${room.members.length} miembros restantes`)
      }
    }
  })
})

// Iniciar el servidor
server.listen(PORT, HOST, () => {
  console.log(`Servidor ejecutandose en http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`)
  console.log(`Para conectar desde otros dispositivos en la red, usa: http://<IP_ADDRESS>:${PORT}`)
})