import { fetchPokemonData } from './api.js'

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

    // Tipos
    const type1 = pokemonData.types[0]?.type.name || "Desconocido";
    const type2 = pokemonData.types[1]?.type.name || "Ninguno";

    // Color
    const color = speciesData.color?.name || "Desconocido";

    // Generación
    const generation = speciesData.generation?.name.replace("generation-", "Generación ").toUpperCase();


 

    const card = document.getElementById('pokemon-card');

    return [
      pokemonData.name,
      pokemonData.sprites.front_default,
      type1,
      type2,
      speciesData.color,
      speciesData.generation,
      pokemonData.height,
      pokemonData.weight
    ];


  } catch (error) {
    console.log(error);
  }
}
//Funcion para sacar el numero romano y devolverlo como decimal
function decimal(obj) {
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
  let nombre = obj.name.trim().replace(/generation-/i, "").trim();
  return equivalencias[nombre.toUpperCase()] || null;
}

function comparar(pokemonRandom, pokeInfo){
  console.log(pokemonRandom)
  console.log(pokeInfo)

  //Check de victoria
  if(pokemonRandom[0] === pokeInfo.name ){
    console.log("ganaste!!")
  }
  //comparacion de tipos
  if (pokemonRandom[2] === pokeInfo.types[0]){
    console.log("tipo 1 igual")
  }
  //revisa si existe segundo tipo
  if(!pokeInfo.types[1]){
    pokeInfo.types[1] = "Ninguno"
  }
  if (pokemonRandom[3] === pokeInfo.types[1]){
    console.log("tipo 2 igual")
  }

  if (pokemonRandom[4] === pokeInfo.color){
    console.log("color igual")
  }

  //convierto de numeros romanos a decimales
  pokemonRandom[5]=decimal(pokemonRandom[5])

  if (pokemonRandom[5] === pokeInfo.generation){
    console.log("generacion igual")
  }
  //reviso si la altura y el peso son iguales
  if(pokemonRandom[6]/10 === pokeInfo.height){
    console.log("altura igual")
  }
  
  if(pokemonRandom[7]/10 === pokeInfo.weight){
    console.log("peso igual")
  }
}

const input = document.getElementById('pokemon-input')
input.addEventListener('keypress', async (event) => { 
  if (event.key === 'Enter') { 
    const pokemonName = input.value.trim().toLowerCase()
    try {
      const pokeinfo = await fetchPokemonData(pokemonName) 
      comparar(pokemonInfo, pokeinfo)
    } catch(error){
      console.error("Error:", error)
    }
  }
})

let pokemonInfo = [];

window.onload = async function() {
  pokemonInfo = await getRandomPokemon();
  console.log("Datos del Pokémon aleatorio:", pokemonInfo[0]);
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
      <p>Altura: ${pokemonInfo[6] / 10} m</p>
      <p>Peso: ${pokemonInfo[7] / 10} kg</p>
    `;
  }
};