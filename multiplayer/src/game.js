import { fetchPokemonData } from './api.js'
import { incrementAttempts,initializeHints } from './hints.js'
const socket = io()

const randpokemonInfo = JSON.parse(localStorage.getItem('pokemonInfo'));
console.log(randpokemonInfo)

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
  //comparacion de tipos
  if (pokemonRandom.types[0].toLowerCase() === pokeInfo.types[0].toLowerCase()) {
    setTimeout(() => {
      const type1 = document.getElementById("type1");
      if (type1) {
        type1.style.backgroundColor = '#22df19'; // green
      } else {
        console.error("Type1 element not found");
      }
    }, 100);
  } else if (pokeInfo.types[1] && pokemonRandom.types[0].toLowerCase() === pokeInfo.types[1].toLowerCase()) {
    setTimeout(() => {
      const type1 = document.getElementById("type1");
      if (type1) {
        type1.style.backgroundColor = '#FFDD33'; // yellow
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
        type2.style.backgroundColor = '#22df19'; // green
      } else {
        console.error("Type2 element not found");
      }
    }, 100);
  } else if (pokemonRandom.types[1].toLowerCase() === pokeInfo.types[0].toLowerCase()) {
    setTimeout(() => {
      const type2 = document.getElementById("type2");
      if (type2) {
        type2.style.backgroundColor = '#FFDD33'; // yellow
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
        console.error("Color element not found");
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
        console.error("Generation element not found");
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
        console.error("Height element not found");
      }
    }, 100);
  }

  if (pokemonRandom.weight / 10 === pokeInfo.weight) {
    setTimeout(() => {
      const weight = document.getElementById("weight");
      if (weight) {
        weight.style.backgroundColor = '#22df19';
      } else {
        console.error("Weight element not found");
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
        console.error("Habitat element not found");
      }
    }, 100);
  }
  if (pokemonRandom.evolutionStage === pokeInfo.evolutionStage) {
    setTimeout(() => {
      const evolution = document.getElementById("evolution");
      if (evolution) {
        evolution.style.backgroundColor = '#22df19';
      } else {
        console.error("Evolution element not found");
      }
    }, 100);
  }

  if (pokemonRandom.name === pokeInfo.name) {
    // Show win modal
    setTimeout(() => {
      const modal = document.getElementById('win-modal');
      const overlay = document.getElementById('win-modal-overlay');
      const subtitle = document.getElementById('win-modal-pokemon');
      if (modal && overlay && subtitle) {
        subtitle.textContent = `El Pokémon era: ${pokemonRandom.name}`;
        modal.style.display = 'flex';
        overlay.style.display = 'block';
      }
      // Back to lobby button logic
      const backToLobby = document.getElementById('back-to-lobby-btn');
      if (backToLobby) {
        backToLobby.onclick = () => {
          window.location.href = '../index.html';
        };
      }
    }, 2500);
    return;
  }

  // Increment attempt counter for hints
  incrementAttempts();


}


const input = document.getElementById('pokemoninput');
if (!input) {
  console.error("Input element not found!");
} else {
  input.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
      var pokemonName = input.value.trim().toLowerCase();
      try {
        const pokeinfo = await fetchPokemonData(pokemonName);
        input.value = "";
        comparar(randpokemonInfo, pokeinfo);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  });
}
