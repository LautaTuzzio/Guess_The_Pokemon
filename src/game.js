import { fetchPokemonData } from './api.js'
import { initializeHints, incrementAttempts, resetHints } from './hints.js';

async function getRandomPokemon() {
  const maxPokemon = 1025;
  const randomId = Math.floor(Math.random() * maxPokemon) + 1;

  try {
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${randomId}`)
    ]);

    if (!pokemonRes.ok || !speciesRes.ok) {
      throw new Error("Error al obtener los datos del Pokémon");
    }

    const pokemonData = await pokemonRes.json();
    const speciesData = await speciesRes.json();

    // Obtener la cadena evolutiva
    const evolutionRes = await fetch(speciesData.evolution_chain.url);
    if (!evolutionRes.ok) {
      throw new Error("Error al obtener la cadena evolutiva");
    }
    const evolutionData = await evolutionRes.json();

    // Calcular el evolution stage
    let evolutionStage = 1;
    let evoChain = evolutionData.chain;
    
    // Buscar el Pokémon en la cadena evolutiva
    while (evoChain) {
      if (evoChain.species.name === pokemonData.name) {
        break;
      }
      if (evoChain.evolves_to.length > 0) {
        evolutionStage++;
        evoChain = evoChain.evolves_to[0];
      } else {
        break;
      }
    }

    // Tipos
    const type1 = pokemonData.types[0]?.type.name || "Desconocido";
    const type2 = pokemonData.types[1]?.type.name || "Ninguno";

    // Color
    const color = speciesData.color?.name || "Desconocido";

    // Generación
    const generation = speciesData.generation?.name.replace("generation-", "Generación ").toUpperCase();

    // Habitat
    const habitat = speciesData.habitat?.name || "unknown";

    return [
      pokemonData.name,
      pokemonData.sprites.front_default,
      type1,
      type2,
      speciesData.color,
      speciesData.generation,
      pokemonData.height,
      pokemonData.weight,
      habitat,
      evolutionStage
    ];


  } catch (error) {
    console.log(error);
  }
}

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
  if (!obj || !obj.name) return console.log(obj);
  let nombre = obj.name.trim().replace(/generation-/i, "").trim();
  return equivalencias[nombre.toUpperCase()] || null;
}


//Funcion para comparar los datos del pokemon aleatorio con los del pokemon ingresado
function comparar(pokemonRandom, pokeInfo){
  console.log("Random Pokemon:", pokemonRandom);
  console.log("Guessed Pokemon:", pokeInfo);
  
  //Check de victoria
  if(pokemonRandom[0] === pokeInfo.name){
    // Show win modal
    setTimeout(() => {
      const modal = document.getElementById('win-modal');
      const overlay = document.getElementById('win-modal-overlay');
      const subtitle = document.getElementById('win-modal-pokemon');
      if (modal && overlay && subtitle) {
        subtitle.textContent = `El Pokémon era: ${pokemonRandom[0]}`;
        modal.style.display = 'flex';
        overlay.style.display = 'block';
      }
      // Play again button logic
      const playAgain = document.getElementById('play-again-btn');
      if (playAgain) {
        playAgain.onclick = async () => {
          modal.style.display = 'none';
          overlay.style.display = 'none';
          // Clear pokemon list
          const list = document.getElementById('pokemon-list');
          if (list) list.innerHTML = '';
          // Fetch new pokemon
          pokemonInfo = await getRandomPokemon();
          initializeHints(pokemonInfo);
        };
      }
      // Back to lobby button logic
      const backToLobby = document.getElementById('back-to-lobby-btn');
      if (backToLobby) {
        backToLobby.onclick = () => {
          window.location.href = '../index.html';
        };
      }
    }, 300);
    return;
  }
  
  // Increment attempt counter for hints
  incrementAttempts();
  
  //comparacion de tipos
  if (pokemonRandom[2] === pokeInfo.types[0]){
    setTimeout(() => {
      const type1 = document.getElementById("type1");
      if (type1) {
        type1.style.backgroundColor = '#22df19'; // green
      } else {
        console.error("Type1 element not found");
      }
    }, 100);
  } else if (pokemonRandom[3] === pokeInfo.types[0]) {
    setTimeout(() => {
      const type1 = document.getElementById("type1");
      if (type1) {
        type1.style.backgroundColor = '#FFDD33'; // yellow
      } else {
        console.error("Type1 element not found");
      }
    }, 100);
  }

  //revisa si existe segundo tipo
  if(!pokeInfo.types[1]){
    pokeInfo.types[1] = "Ninguno";
  }
  
  //comparacion de tipo 2
  if (pokemonRandom[3] === pokeInfo.types[1]){
    setTimeout(() => {
      const type2 = document.getElementById("type2");
      if (type2) {
        type2.style.backgroundColor = '#22df19'; // green
      } else {
        console.error("Type2 element not found");
      }
    }, 100);
  } else if (pokemonRandom[2] === pokeInfo.types[1]) {
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
  if (pokemonRandom[4].name === pokeInfo.color){
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
  const randomGeneration = decimal(pokemonRandom[5]);
  
  if (randomGeneration === pokeInfo.generation){
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
  if(pokemonRandom[6]/10 === pokeInfo.height){
    setTimeout(() => {
      const height = document.getElementById("height");
      if (height) {
        height.style.backgroundColor = '#22df19';
      } else {
        console.error("Height element not found");
      }
    }, 100);
  }
  
  if(pokemonRandom[7]/10 === pokeInfo.weight){
    setTimeout(() => {
      const weight = document.getElementById("weight");
      if (weight) {
        weight.style.backgroundColor = '#22df19';
      } else {
        console.error("Weight element not found");
      }
    }, 100);
  }
  
  if(pokemonRandom[8] === pokeInfo.habitat){
    setTimeout(() => {
      const habitat = document.getElementById("habitat");
      if (habitat) {
        habitat.style.backgroundColor = '#22df19';
      } else {
        console.error("Habitat element not found");
      }
    }, 100);
  }

  if(pokemonRandom[9] === pokeInfo.evolutionStage){
    setTimeout(() => {
      const evolutionStage = document.getElementById("evolutionStage");
      if (evolutionStage) {
        evolutionStage.style.backgroundColor = '#22df19';
      } else {
        console.error("Evolution stage element not found");
      }
    }, 100);
  }
}

const input = document.getElementById('pokemon-input');
if (!input) {
  console.error("Input element not found!");
} else {
  input.addEventListener('keypress', async (event) => { 
    if (event.key === 'Enter') { 
      var pokemonName = input.value.trim().toLowerCase();
      try {
        const pokeinfo = await fetchPokemonData(pokemonName);
        console.log("Fetched Pokemon data:", pokeinfo);
        input.value = "";
        comparar(pokemonInfo, pokeinfo);
      } catch(error){
        console.error("Error:", error);
      }
    }
  });
}

let pokemonInfo = [];

window.onload = async function() {
  pokemonInfo = await getRandomPokemon();
  
  // Initialize the hint system with the current Pokemon data
  initializeHints(pokemonInfo);
  
  // Aquí podrías mostrar la información del Pokémon aleatorio en la tarjeta
  const card = document.getElementById('pokemon-card');
  if (card && pokemonInfo.length > 0) {
    card.innerHTML = `
      <h2>${pokemonInfo[0]}</h2>
      <img src="${pokemonInfo[1]}" alt="${pokemonInfo[0]}">
      <p>Tipo 1: ${pokemonInfo[2]}</p>
      <p>Tipo 2: ${pokemonInfo[3]}</p>
      <p>Color: ${pokemonInfo[4]?.name || pokemonInfo[4] || 'Desconocido'}</p>
      <p>Generación: ${pokemonInfo[5]?.name?.replace("generation-", "Generación ").toUpperCase() || pokemonInfo[5] || 'Desconocido'}</p>
      <p>Habitat: ${pokemonInfo[8] || 'Desconocido'}</p>
      <p>Altura: ${pokemonInfo[6] / 10} m</p>
      <p>Peso: ${pokemonInfo[7] / 10} kg</p>
      <p>Etapa de evolución: ${pokemonInfo[9]}</p>
    `;
  }
};