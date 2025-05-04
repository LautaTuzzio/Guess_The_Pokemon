import { fetchPokemonData } from '../src/api.js'

// Variables globales
let username = ''
let clientId = ''
let currentRoomId = null
let isReady = false
let currentPokemonData = null

// Map para convertir IDs de Socket a nombres de usuario
const userIdToUsername = new Map()

// Elementos del DOM
const lobbyScreen = document.getElementById('lobbyScreen')
const roomScreen = document.getElementById('roomScreen')
const usernameModal = document.getElementById('username-modal')
const usernameModalOverlay = document.getElementById('username-modal-overlay')
const usernameInput = document.getElementById('username-input')
const usernameSubmitBtn = document.getElementById('username-submit-btn')

const createRoomBtn = document.getElementById('createRoomBtn')
const joinRoomBtn = document.getElementById('joinRoomBtn')
const joinRoomInput = document.getElementById('joinRoomInput')
const roomIdSpan = document.getElementById('roomId')
const roomMembersP = document.getElementById('roomMembers')
const leaveRoomBtn = document.getElementById('leaveRoomBtn')
const readyBtn = document.getElementById('readyBtn')
const messagesDiv = document.getElementById('messages')

// Configurar el Socket.io
let socket = null

// Manejar el evento de envío del nombre de usuario
usernameSubmitBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim()
  if (name.length >= 3) {
    username = name
    // No guardar en localStorage para que el modal aparezca cada vez
    hideUsernameModal()
    initializeSocket()
  } else {
    showToast('Por favor ingresa un nombre válido (mínimo 3 caracteres)', true)
  }
})

// Permitir presionar Enter para enviar el nombre de usuario
usernameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    usernameSubmitBtn.click()
  }
})

// Función para mostrar notificaciones toast
function showToast(message, isError = false) {
  // Crear el toast
  const toast = document.createElement('div');
  toast.className = isError ? 'error-notification' : 'hint-notification';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Eliminar el toast después de 3 segundos (coincide con la duración de la animación)
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

// Siempre mostrar el modal de nombre de usuario al cargar la página
showUsernameModal()

// Funciones para manejar el modal de nombre de usuario
function hideUsernameModal() {
  usernameModal.style.display = 'none'
  usernameModalOverlay.style.display = 'none'
}

function showUsernameModal() {
  usernameModal.style.display = 'block'
  usernameModalOverlay.style.display = 'flex'
  usernameInput.focus()
}

// Inicializar la conexión Socket.io
function initializeSocket() {
  // Crear la conexión Socket.io
  socket = io()
  
  // Cuando se establece la conexión
  socket.on('connect', () => {
    clientId = socket.id
    console.log(`Conectado al servidor con ID: ${clientId}`)
    
    // Guardar nuestro propio nombre de usuario en el mapa
    userIdToUsername.set(clientId, username)
    
    // Si estamos en una sala de juego, volver a unirse y solicitar Pokemon
    if (window.location.pathname.startsWith('/room/')) {
      const roomId = window.location.pathname.split('/').pop()
      socket.emit('join_room', { roomId, username })
    }
  })
  
  // Manejador del botón Crear Sala
  createRoomBtn.addEventListener('click', () => {
    socket.emit('create_room', { username })
    console.log('Solicitando crear una sala con nombre:', username)
  })
  
  // Manejador del botón Unirse a Sala
  joinRoomBtn.addEventListener('click', () => {
    const roomId = joinRoomInput.value.trim()
    if (roomId) {
      socket.emit('join_room', { roomId, username })
      console.log(`Solicitando unirse a la sala: ${roomId} con nombre: ${username}`)
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
    
    // Guardar los nombres de usuario de todos los miembros
    data.members.forEach(member => {
      userIdToUsername.set(member.id, member.username || member.id)
    })
    
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
    
    // Guardar los nombres de usuario de todos los miembros
    data.members.forEach(member => {
      userIdToUsername.set(member.id, member.username || member.id)
    })
    
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
  
  // Manejar evento de sala llena
  socket.on('room_full', (data) => {
    console.log(`La sala ${data.roomId} está completa`)
    showRoomFullModal()
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
  
  socket.on('room_members_update', (data) => {
    if (currentRoomId === data.roomId) {
      console.log('Actualizando lista de miembros:', data.members)
      
      // Actualizar el mapa de IDs a nombres de usuario
      data.members.forEach(member => {
        userIdToUsername.set(member.id, member.username || member.id)
      })
      
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
} // Cierre de la función initializeSocket

// Funciones auxiliares
function updateMembersList(members) {
  const membersList = members.map(member => {
    // Usar el nombre de usuario en lugar del ID si está disponible
    const displayName = userIdToUsername.get(member.id) || member.id
    
    // Destacar al usuario actual
    const isCurrentUser = member.id === clientId
    const nameDisplay = isCurrentUser ? 
      `<strong class="member-name">${displayName}</strong>` : `<span class="member-name">${displayName}</span>`
    
    const readyStatus = member.isReady ? 
      '<span class="player-ready">✓ Listo</span>' : 
      '<span class="player-not-ready">✗ No Listo</span>'
    
    return `${nameDisplay} ${readyStatus}`
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

// Función para mostrar el modal de sala completa
function showRoomFullModal() {
  const modalOverlay = document.getElementById('room-full-modal-overlay')
  const modal = document.getElementById('room-full-modal')
  
  modalOverlay.style.display = 'flex'
  modal.style.display = 'block'
}

// Función para ocultar el modal de sala completa
function hideRoomFullModal() {
  const modalOverlay = document.getElementById('room-full-modal-overlay')
  const modal = document.getElementById('room-full-modal')
  
  modalOverlay.style.display = 'none'
  modal.style.display = 'none'
}

// Event listener for back-to-lobby button in room full modal
document.getElementById('back-to-lobby-btn-full').addEventListener('click', () => {
  hideRoomFullModal()
  joinRoomInput.value = ''
})

// Manejar la inicialización de la sala de juego
if (window.location.pathname.startsWith('/room/')) {
  const roomId = window.location.pathname.split('/')[2]
  currentRoomId = roomId
  
  // Unirse a la sala
  socket.emit('join_room', { roomId })
}