// Connect to Socket.io server
const socket = io()
let clientId = ''
let currentRoomId = null
let isReady = false

// DOM elements
const lobbyScreen = document.getElementById('lobbyScreen')
const roomScreen = document.getElementById('roomScreen')
const gameScreen = document.getElementById('gameScreen')
const createRoomBtn = document.getElementById('createRoomBtn')
const joinRoomBtn = document.getElementById('joinRoomBtn')
const joinRoomInput = document.getElementById('joinRoomInput')
const roomIdSpan = document.getElementById('roomId')
const roomMembersP = document.getElementById('roomMembers')
const sayHelloBtn = document.getElementById('sayHelloBtn')
const leaveRoomBtn = document.getElementById('leaveRoomBtn')
const readyBtn = document.getElementById('readyBtn')
const messagesDiv = document.getElementById('messages')
const clientIdSpan = document.getElementById('clientId')

// When connection is established
socket.on('connect', () => {
  clientId = socket.id
  clientIdSpan.textContent = clientId
  console.log(`Connected to server with ID: ${clientId}`)
  
  // If we're in a game room, rejoin it and request Pokemon
  if (window.location.pathname.startsWith('/room/')) {
    const roomId = window.location.pathname.split('/').pop()
    socket.emit('join_room', { roomId })
  }
})

// Create Room button handler
createRoomBtn.addEventListener('click', () => {
  socket.emit('create_room')
  console.log('Requesting to create a room...')
})

// Join Room button handler
joinRoomBtn.addEventListener('click', () => {
  const roomId = joinRoomInput.value.trim()
  if (roomId) {
    socket.emit('join_room', { roomId })
    console.log(`Requesting to join room: ${roomId}`)
  } else {
    addMessage('Please enter a room ID', true)
  }
})

// Say Hello button handler
sayHelloBtn.addEventListener('click', () => {
  if (currentRoomId) {
    socket.emit('say_hello', { roomId: currentRoomId })
    console.log(`Hello from ${clientId} in room ${currentRoomId}`)
    addMessage(`You said: Hello!`)
  }
})

// Ready button handler
readyBtn.addEventListener('click', () => {
  if (currentRoomId) {
    isReady = !isReady
    socket.emit('player_ready', { roomId: currentRoomId, isReady })
    readyBtn.textContent = isReady ? 'Not Ready' : 'Ready'
    readyBtn.classList.toggle('secondary', isReady)
  }
})

// Leave Room button handler
leaveRoomBtn.addEventListener('click', () => {
  if (currentRoomId) {
    socket.emit('leave_room', { roomId: currentRoomId })
    leaveRoom()
  }
})

// Socket event handlers
socket.on('room_created', (data) => {
  console.log(`Room created with ID: ${data.roomId}`)
  currentRoomId = data.roomId
  roomIdSpan.textContent = currentRoomId
  roomMembersP.textContent = `Members: You (${clientId})`
  
  // Switch to room screen
  lobbyScreen.classList.add('hidden')
  roomScreen.classList.remove('hidden')
  gameScreen.classList.add('hidden')
  
  addMessage(`You created room: ${currentRoomId}`, true)
})

socket.on('joined_room', (data) => {
  console.log(`Joined room: ${data.roomId} with ${data.members.length} members`)
  currentRoomId = data.roomId
  roomIdSpan.textContent = currentRoomId
  updateMembersList(data.members)
  
  // Switch to room screen
  lobbyScreen.classList.add('hidden')
  roomScreen.classList.remove('hidden')
  gameScreen.classList.add('hidden')
  
  addMessage(`You joined room: ${currentRoomId}`, true)
})

socket.on('user_joined', (data) => {
  console.log(`User ${data.userId} joined room ${data.roomId}`)
  addMessage(`User ${data.userId} joined the room`, true)
  
  // Update members list if we're in this room
  if (currentRoomId === data.roomId) {
    socket.emit('get_room_info', { roomId: currentRoomId })
  }
})

socket.on('user_left', (data) => {
  console.log(`User ${data.userId} left room ${data.roomId}`)
  addMessage(`User ${data.userId} left the room`, true)
  
  // Update members list if we're in this room
  if (currentRoomId === data.roomId) {
    socket.emit('get_room_info', { roomId: currentRoomId })
  }
})

socket.on('hello_received', (data) => {
  console.log(`Hello from ${data.userId} in room ${data.roomId}`)
  addMessage(`${data.userId} says: Hello!`)
})

socket.on('room_info', (data) => {
  if (currentRoomId === data.roomId) {
    updateMembersList(data.members)
  }
})

socket.on('player_ready_update', (data) => {
  if (currentRoomId === data.roomId) {
    updateMembersList(data.members)
    if (data.allReady && data.gameStarted) {
      // Switch to game screen
      lobbyScreen.classList.add('hidden')
      roomScreen.classList.add('hidden')
      gameScreen.classList.remove('hidden')
      
      // Set room ID in game screen
      document.getElementById('gameRoomId').textContent = currentRoomId
    }
  }
})

socket.on('game_started', (data) => {
  if (currentRoomId === data.roomId) {
    console.log('Game started with Pokemon ID:', data.pokemonId)
    
    // Fetch Pokemon data
    ;(async () => {
      try {
        console.log('Fetching Pokemon with ID:', data.pokemonId)
        
        // Fetch Pokemon data from browser
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${data.pokemonId}`)
        const pokemon = await pokemonResponse.json()
        
        // Fetch species data
        const speciesResponse = await fetch(pokemon.species.url)
        const species = await speciesResponse.json()
        
        // Fetch evolution chain
        const evolutionResponse = await fetch(species.evolution_chain.url)
        const evolutionChain = await evolutionResponse.json()
        
        // Calculate evolution stage
        let evolutionStage = 1
        const chain = evolutionChain.chain
        if (chain.evolves_to.length > 0) {
          evolutionStage = chain.species.name === pokemon.name ? 2 
            : (chain.evolves_to[0].evolves_to.length > 0 && 
               pokemon.name === chain.evolves_to[0].evolves_to[0].species.name) ? 3 : 1
        }
        
        // Update UI
        const pokemonImage = document.getElementById('pokemon-imagen')
        const pokemonInfo = document.getElementById('pokemon-info')
        
        if (pokemonImage && pokemonInfo) {
          pokemonImage.src = pokemon.sprites.front_default
          pokemonInfo.innerHTML = `
            <h2>${pokemon.name}</h2>
            <p>Tipo 1: ${pokemon.types[0].type.name}</p>
            <p>Tipo 2: ${pokemon.types[1] ? pokemon.types[1].type.name : 'N/A'}</p>
            <p>Color: ${species.color.name}</p>
            <p>Etapa de Evolucion: ${evolutionStage}</p>
            <p>Peso: ${pokemon.weight}</p>
            <p>Altura: ${pokemon.height}</p>
            <p>Habitat: ${species.habitat ? species.habitat.name : 'Desconocido'}</p>
          `
        }
      } catch (error) {
        console.error('Error fetching Pokemon:', error)
      }
    })()
  }
})

// Helper functions
function updateMembersList(members) {
  const membersList = members.map(member => {
    const readyStatus = member.isReady ? 
      '<span class="player-ready">✓ Ready</span>' : 
      '<span class="player-not-ready">✗ Not Ready</span>'
    return `${member.id} ${readyStatus}`
  }).join('<br>')
  roomMembersP.innerHTML = `Members:<br>${membersList}`
}

function leaveRoom() {
  currentRoomId = null
  isReady = false
  
  // Switch back to lobby screen
  roomScreen.classList.add('hidden')
  lobbyScreen.classList.remove('hidden')
  
  addMessage('You left the room', true)
}

function addMessage(text, isSystem = false) {
  const messageDiv = document.createElement('div')
  messageDiv.className = `message${isSystem ? ' system-message' : ''}`
  messageDiv.textContent = text
  messagesDiv.appendChild(messageDiv)
  messagesDiv.scrollTop = messagesDiv.scrollHeight
}

// Handle game room initialization
if (window.location.pathname.startsWith('/room/')) {
  const roomId = window.location.pathname.split('/')[2]
  currentRoomId = roomId
  
  // Join the room
  socket.emit('join_room', { roomId })
}
