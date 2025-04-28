import { fetchPokemonData } from './api.js'
import { incrementAttempts,initializeHints } from './hints.js'
const socket = io()

const randpokemonInfo = JSON.parse(localStorage.getItem('pokemonInfo'));
console.log('Informacion Pokemon Aleatorio:', randpokemonInfo)

// Escuchar eventos de fin de juego
socket.on('game_over', (data) => {
  console.log(`Jugador con ID ${data.winnerId} gano el juego con ${data.pokemonName}!`);
  
  // Show win modal to all players
  showWinModal(data.winnerId, data.pokemonName);
});

// Funcion para mostrar el modal de victoria
function showWinModal(winnerId, pokemonName) {
  const modal = document.getElementById('win-modal');
  const overlay = document.getElementById('win-modal-overlay');
  const subtitle = document.getElementById('win-modal-pokemon');
  const title = document.querySelector('.win-modal-title');
  
  if (modal && overlay && subtitle) {
    // Personalizar mensaje dependiendo si es el jugador actual o no
    if (winnerId === socket.id) {
      subtitle.innerHTML = `<strong>¡Ganaste!</strong><br>El Pokémon era: ${pokemonName}`;
      if (title) title.textContent = '¡Felicidades!';
    } else {
      subtitle.innerHTML = `<strong>¡Otro jugador ha ganado!</strong><br>El Pokémon era: ${pokemonName}`;
      if (title) title.textContent = 'Casi...';
    }
    
    modal.style.display = 'flex';
    overlay.style.display = 'block';
    
    // Funcionalidad del boton volver al inicio
    const backToLobbyBtn = document.getElementById('back-to-lobby-btn');
    if (backToLobbyBtn) {
      backToLobbyBtn.onclick = () => {
        window.location.href = '../index.html';
      };
    }
    
    // Funcionalidad del boton jugar otra vez
    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) {
      playAgainBtn.onclick = () => {
        window.location.href = '../multiplayer/index.html';
      };
    }
  }
};

// Escuchar eventos de victoria simplificados
socket.on('someone_has_won', (data) => {
  console.log('Evento someone_has_won recibido:', data.message);
  
  // Show win modal to all players
  showWinModal(data.winnerId, data.pokemonName);
});

// Escuchar eventos globales del juego como respaldo
socket.on('global_game_event', (data) => {
  console.log('Evento global de juego recibido:', data.type, data.message);
  
  if (data.type === 'win') {
    // Verificar si estamos en la misma sala
    const currentRoomId = localStorage.getItem('currentRoomId');
    if (currentRoomId === data.roomId) {
      showWinModal(data.winnerId, data.pokemonName);
    }
  }
})

//Funcion para sacar el numero romano y devolverlo como decimal
export function decimal(obj) {
  const equivalencias = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
    IX: 9
  };
  if (!obj || !obj) return console.log(obj);
  let nombre = obj.trim().replace(/generation-/i, "").trim();
  return equivalencias[nombre.toUpperCase()] || null;
}

function comparar(pokemonRandom, pokeInfo) {
  // Get room ID from localStorage to ensure consistency
  const currentRoomId = localStorage.getItem('currentRoomId');
  
  // Send the guess to the server for logging
  socket.emit('player_guess', {
    roomId: currentRoomId,
    playerId: socket.id,
    pokemonName: pokeInfo.name
  });
  
  console.log('Jugador adivino:', pokeInfo.name, 'en sala:', currentRoomId);
  //comparacion de tipos
  if (pokemonRandom.types[0].toLowerCase() === pokeInfo.types[0].toLowerCase()) {
    setTimeout(() => {
      const type1 = document.getElementById("type1");
      if (type1) {
        type1.style.backgroundColor = '#22df19'; // verde
      } else {
        console.error("Type1 element not found");
      }
    }, 100);
  } else if (pokeInfo.types[1] && pokemonRandom.types[0].toLowerCase() === pokeInfo.types[1].toLowerCase()) {
    setTimeout(() => {
      const type1 = document.getElementById("type1");
      if (type1) {
        type1.style.backgroundColor = '#FFDD33'; // amarillo
      } else {
        console.error("Type1 element not found");
      }
    }, 100);
  }

  //revisa si existe segundo tipo en el pokemon ingresado
  if (!pokeInfo.types[1]) {
    pokeInfo.types[1] = "Ninguno"
  }

  //revisa si existe segundo tipo en el pokemon random
  if (!pokemonRandom.types[1]) {
    pokemonRandom.types[1] = "Ninguno"
  }

  //comparacion de tipo 2
  if (pokemonRandom.types[1].toLowerCase() === pokeInfo.types[1].toLowerCase()) {
    setTimeout(() => {
      const type2 = document.getElementById("type2");
      if (type2) {
        type2.style.backgroundColor = '#22df19'; // verde
      } else {
        console.error("Type2 element not found");
      }
    }, 100);
  } else if (pokemonRandom.types[1].toLowerCase() === pokeInfo.types[0].toLowerCase()) {
    setTimeout(() => {
      const type2 = document.getElementById("type2");
      if (type2) {
        type2.style.backgroundColor = '#FFDD33'; // amarillo
      } else {
        console.error("Type2 element not found");
      }
    }, 100);
  }

  //comparacion de color
  if (pokemonRandom.color === pokeInfo.color) {
    setTimeout(() => {
      const color = document.getElementById("color");
      if (color) {
        color.style.backgroundColor = '#22df19';
      } else {
        console.error("Elemento color no encontrado");
      }
    }, 100);
  }

  //convierto de numeros romanos a decimales
  const randomGeneration = decimal(pokemonRandom.generation);

  if (randomGeneration === pokeInfo.generation) {
    setTimeout(() => {
      const generation = document.getElementById("generation");
      if (generation) {
        generation.style.backgroundColor = '#22df19';
      } else {
        console.error("Elemento generation no encontrado");
      }
    }, 100);
  }
  //reviso si la altura y el peso son iguales
  if (pokemonRandom.height / 10 === pokeInfo.height) {
    setTimeout(() => {
      const height = document.getElementById("height");
      if (height) {
        height.style.backgroundColor = '#22df19';
      } else {
        console.error("Elemento height no encontrado");
      }
    }, 100);
  }

  if (pokemonRandom.weight / 10 === pokeInfo.weight) {
    setTimeout(() => {
      const weight = document.getElementById("weight");
      if (weight) {
        weight.style.backgroundColor = '#22df19';
      } else {
        console.error("Elemento weight no encontrado");
      }
    }, 100);
  }

  if (pokeInfo.habitat === "unknown") {
    pokeInfo.habitat = "Desconocido"
  }

  if (pokemonRandom.habitat.toLowerCase() === pokeInfo.habitat.toLowerCase()) {
    setTimeout(() => {
      const habitat = document.getElementById("habitat");
      if (habitat) {
        habitat.style.backgroundColor = '#22df19';
      } else {
        console.error("Elemento habitat no encontrado");
      }
    }, 100);
  }
  if (pokemonRandom.evolutionStage === pokeInfo.evolutionStage) {
    setTimeout(() => {
      const evolution = document.getElementById("evolution");
      if (evolution) {
        evolution.style.backgroundColor = '#22df19';
      } else {
        console.error("Elemento evolution no encontrado");
      }
    }, 100);
  }

  if(pokemonRandom.name.toLowerCase() === pokeInfo.name.toLowerCase()){
    // Notificar al servidor sobre la victoria
    const currentRoomId = localStorage.getItem('currentRoomId');
    
    if (currentRoomId) {
      console.log(`Usuario ${socket.id} ha ganado el juego en la sala ${currentRoomId}!`);
      
      // Enviar notificacion de victoria al servidor con el nombre del Pokemon
      socket.emit('player_win', {
        roomId: currentRoomId,
        playerId: socket.id,
        pokemonName: pokemonRandom.name
      });
      
      // El modal se mostrara via eventos de socket en todas las pestanas
    }
    
    return;
  }

  // Increment attempt counter for hints
  incrementAttempts();


}


const input = document.getElementById('pokemoninput');
if (!input) {
  console.error("Elemento input no encontrado!");
} else {
  input.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
      var pokemonName = input.value.trim().toLowerCase();
      try {
        const pokeinfo = await fetchPokemonData(pokemonName);
        input.value = "";
        console.log("Datos de Pokemon obtenidos:", pokeinfo);
        comparar(randpokemonInfo, pokeinfo);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  });
}
