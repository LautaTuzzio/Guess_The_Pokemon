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

const input = document.getElementById('pokemon-input')
input.addEventListener('keypress', async (event) => { //faltaba este async
  if (event.key === 'Enter') { 
    const pokemonName = input.value.trim().toLowerCase()
    try {
      const pokeinfo = await fetchPokemonData(pokemonName) //faltaba este await
      console.log(pokeinfo)
      console.log("Nombre:", pokeinfo.name)
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