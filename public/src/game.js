async function getRandomPokemon() {
  const maxPokemon = 1025;
  const randomId = Math.floor(Math.random() * maxPokemon) + 1;
  console.log("we're here")

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
    

    // Mostrar en pantalla
    console.log("we're here 2")

    const card = document.getElementById('pokemon-card');
    console.log("we're here 3")

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
    console.log(error)
  }
}

let pokemonInfo = [];

window.onload = async function() {
  pokemonInfo = await getRandomPokemon();
  console.log("Datos del Pokémon aleatorio:", pokemonInfo);
};





