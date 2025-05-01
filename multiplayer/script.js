import { fetchPokemonData } from '../src/api.js'

// Conectar al servidor de Socket.io
const socket = io()
let clientId = ''
let currentRoomId = null
let isReady = false
// Agregar una variable global para almacenar los datos del Pokemon actual
let currentPokemonData = null

// Elementos del DOM
const lobbyScreen = document.getElementById('lobbyScreen')
const roomScreen = document.getElementById('roomScreen')

const createRoomBtn = document.getElementById('createRoomBtn')
const joinRoomBtn = document.getElementById('joinRoomBtn')
const joinRoomInput = document.getElementById('joinRoomInput')
const roomIdSpan = document.getElementById('roomId')
const roomMembersP = document.getElementById('roomMembers')
const leaveRoomBtn = document.getElementById('leaveRoomBtn')
const readyBtn = document.getElementById('readyBtn')
const messagesDiv = document.getElementById('messages')

// Cuando se establece la conexión
socket.on('connect', () => {
  clientId = socket.id
  console.log(`Conectado al servidor con ID: ${clientId}`)
  
  // Si estamos en una sala de juego, volver a unirse y solicitar Pokemon
  if (window.location.pathname.startsWith('/room/')) {
    const roomId = window.location.pathname.split('/').pop()
    socket.emit('join_room', { roomId })
  }
})

// Manejador del botón Crear Sala
createRoomBtn.addEventListener('click', () => {
  socket.emit('create_room')
  console.log('Solicitando crear una sala...')
})

// Manejador del botón Unirse a Sala
joinRoomBtn.addEventListener('click', () => {
  const roomId = joinRoomInput.value.trim()
  if (roomId) {
    socket.emit('join_room', { roomId })
    console.log(`Solicitando unirse a la sala: ${roomId}`)
  } else {
    addMessage('Por favor ingrese un ID de sala', true)
  }
})

// Manejador del botón Listo
readyBtn.addEventListener('click', () => {
  if (currentRoomId) {
    isReady = !isReady
    socket.emit('player_ready', { roomId: currentRoomId, isReady })
    readyBtn.textContent = isReady ? 'No Listo' : 'Listo'
    readyBtn.classList.toggle('secondary', isReady)
  }
})

// Manejador del botón Salir de la Sala
leaveRoomBtn.addEventListener('click', () => {
  if (currentRoomId) {
    socket.emit('leave_room', { roomId: currentRoomId })
    leaveRoom()
  }
})

// Manejadores de eventos de Socket
socket.on('room_created', (data) => {
  console.log(`Sala creada con ID: ${data.roomId}`)
  currentRoomId = data.roomId
  
  // Almacenar el ID de la sala en localStorage para acceso persistente
  localStorage.setItem('currentRoomId', currentRoomId)
  
  roomIdSpan.textContent = currentRoomId
  updateMembersList(data.members)
  
  // Cambiar a la pantalla de la sala
  lobbyScreen.classList.add('hidden')
  roomScreen.classList.remove('hidden')
  addMessage(`Creaste la sala: ${currentRoomId}`, true)
})

socket.on('joined_room', (data) => {
  console.log(`Te uniste a la sala: ${data.roomId} con ${data.members.length} miembros`)
  currentRoomId = data.roomId
  
  // Almacenar el ID de la sala en localStorage para acceso persistente
  localStorage.setItem('currentRoomId', currentRoomId)
  
  roomIdSpan.textContent = currentRoomId
  updateMembersList(data.members)
  
  // Cambiar a la pantalla de la sala
  lobbyScreen.classList.add('hidden')
  roomScreen.classList.remove('hidden')

  addMessage(`Te uniste a la sala: ${currentRoomId}`, true)
})

socket.on('user_joined', (data) => {
  console.log(`El usuario ${data.userId} se unió a la sala ${data.roomId}`)
  addMessage(`El usuario ${data.userId} se unió a la sala`, true)
  
  // Actualizar la lista de miembros si estamos en esta sala
  if (currentRoomId === data.roomId) {
    socket.emit('get_room_info', { roomId: currentRoomId })
  }
})

socket.on('user_left', (data) => {
  console.log(`El usuario ${data.userId} salió de la sala ${data.roomId}`)
  addMessage(`El usuario ${data.userId} salió de la sala`, true)
  
  // Actualizar la lista de miembros si estamos en esta sala
  if (currentRoomId === data.roomId) {
    socket.emit('get_room_info', { roomId: currentRoomId })
  }
})

socket.on('hello_received', (data) => {
  console.log(`Hola de ${data.userId} en la sala ${data.roomId}`)
  addMessage(`${data.userId} dice: ¡Hola!`)
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
      // Cambiar a la pantalla del juego
      lobbyScreen.classList.add('hidden')
      roomScreen.classList.add('hidden')
    }
  }
})

socket.on('game_started', (data) => {
  if (currentRoomId === data.roomId) {
    // Enviar un log adicional al servidor sobre el cliente que recibió el ID de Pokemon
    socket.emit('client_log', {
      event: 'received_pokemon_id',
      roomId: currentRoomId,
      playerId: clientId,
      pokemonId: data.pokemonId
    })
    
    // Obtener los datos del Pokemon
    ;(async () => {
      try {
        console.log('Obteniendo los datos del Pokemon con ID:', data.pokemonId)
        
        // Obtener los datos del Pokemon desde el navegador
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${data.pokemonId}`)
        const pokemon = await pokemonResponse.json()
        
        // Obtener los datos de la especie
        const speciesResponse = await fetch(pokemon.species.url)
        const species = await speciesResponse.json()
        
        // Obtener la cadena de evolución
        const evolutionResponse = await fetch(species.evolution_chain.url)
        const evolutionChain = await evolutionResponse.json()
        
        // Calcular la etapa de evolución
        let evolutionStage = 1
        const chain = evolutionChain.chain
        
        if (chain.species.name === pokemon.name) {
          evolutionStage = 1; // Forma base
        } else if (chain.evolves_to.length > 0) {
          // Buscar en la primera evolución
          const firstEvo = chain.evolves_to.find(evo => evo.species.name === pokemon.name);
          if (firstEvo) {
            evolutionStage = 2;
          } else {
            // Buscar en la segunda evolución
            for (const evo of chain.evolves_to) {
              if (evo.evolves_to.some(finalEvo => finalEvo.species.name === pokemon.name)) {
                evolutionStage = 3;
                break;
              }
            }
          }
        }

        // Extraer la información de la generación desde los datos de la especie
        const generation = species.generation.name.replace('generation-', '').toUpperCase();

        currentPokemonData = {
          name: pokemon.name,
          types: pokemon.types.map(t => t.type.name),
          color: species.color.name,
          evolutionStage: evolutionStage,
          weight: pokemon.weight,
          height: pokemon.height,
          habitat: species.habitat ? species.habitat.name : 'Desconocido',
          image: pokemon.sprites.front_default,
          generation: generation  // Agregar la generación aquí
        }
        
        // Actualizar la interfaz de usuario
        const pokemonImage = document.getElementById('pokemon-imagen')
        const pokemonInfo = document.getElementById('pokemon-info')
        
        if (pokemonImage && pokemonInfo) {
          pokemonImage.src = currentPokemonData.image
          pokemonInfo.innerHTML = `
            <h2>${currentPokemonData.name}</h2>
            <p>Tipo 1: ${currentPokemonData.types[0]}</p>
            <p>Tipo 2: ${currentPokemonData.types[1] || 'N/A'}</p>
            <p>Color: ${currentPokemonData.color}</p>
            <p>Etapa de Evolución: ${currentPokemonData.evolutionStage}</p>
            <p>Peso: ${currentPokemonData.weight/10} kg</p>
            <p>Altura: ${currentPokemonData.height/10} m</p>
            <p>Habitat: ${currentPokemonData.habitat}</p>
            <p>Generación: ${currentPokemonData.generation}</p>
          `
        }
        console.log(currentPokemonData)
        console.log("sada")
        localStorage.setItem('pokemonInfo', JSON.stringify(currentPokemonData));
        
        window.location.href = "game.html";
      } catch (error) {
        console.error('Error obteniendo los datos del Pokemon:', error)
      }
    })()
  }
})

// Funciones auxiliares
function updateMembersList(members) {
  const membersList = members.map(member => {
    const readyStatus = member.isReady ? 
      '<span class="player-ready">✓ Listo</span>' : 
      '<span class="player-not-ready">✗ No Listo</span>'
    return `${member.id} ${readyStatus}`
  }).join('<br>')
  roomMembersP.innerHTML = `Miembros:<br>${membersList}`
}

function leaveRoom() {
  currentRoomId = null
  isReady = false
  currentPokemonData = null  
  
  // Cambiar a la pantalla del lobby
  roomScreen.classList.add('hidden')
  lobbyScreen.classList.remove('hidden')
  
  addMessage('Saliste de la sala', true)
}

function addMessage(text, isSystem = false) {
  const messageDiv = document.createElement('div')
  messageDiv.className = `message${isSystem ? ' system-message' : ''}`
  messageDiv.textContent = text
  messagesDiv.appendChild(messageDiv)
  messagesDiv.scrollTop = messagesDiv.scrollHeight
}

// Manejar la inicialización de la sala de juego
if (window.location.pathname.startsWith('/room/')) {
  const roomId = window.location.pathname.split('/')[2]
  currentRoomId = roomId
  
  // Unirse a la sala
  socket.emit('join_room', { roomId })
}