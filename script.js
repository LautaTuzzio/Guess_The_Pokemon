document.getElementById('fetch').onclick = async () => {
    // Generar un ID aleatorio entre 1 y 1025
    const randomId = Math.floor(Math.random() * 1025) + 1
    
    // Obtener los datos del Pokemon mediante su ID
    const pokemonRespuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
    const pokemon = await pokemonRespuesta.json()
    
    // Obtener los datos de la especie del Pokemon
    const especieRespuesta = await fetch(pokemon.species.url)
    const especie = await especieRespuesta.json()

    // Por si quieren ver lo que devuelve
    // console.log('pokemon: ', pokemon)
    // console.log('especie: ', especie)

    document.getElementById('pokemon-imagen').src = pokemon.sprites.front_default
    
    document.getElementById('pokemon-info').innerHTML = `
        <h2>${pokemon.name}</h2>
        <p>Tipo 1: ${pokemon.types[0].type.name}</p>
        <p>Tipo 2: ${pokemon.types[1] ? pokemon.types[1].type.name : 'N/A'}</p>
        <p>Color: ${especie.color.name}</p>
        <p>Peso: ${pokemon.weight}</p>
        <p>Altura: ${pokemon.height}</p>
        <p>Habitat: ${especie.habitat ? especie.habitat.name : 'Desconocido'}</p>
        <p>Generacion: ${especie.generation.name}</p>
    `
}