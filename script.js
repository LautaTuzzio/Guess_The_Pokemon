document.getElementById('fetch').onclick = async () => {
    // Generar un ID aleatorio entre 1 y 1025
    const randomId = Math.floor(Math.random() * 1025) + 1
        
    // Obtener los datos del pokemon mediante su ID
    const pokemonRespuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
    const pokemon = await pokemonRespuesta.json()
        
    // Obtener los datos de la especie del pokemon
    const especieRespuesta = await fetch(pokemon.species.url)
    const especie = await especieRespuesta.json()

    // Obtener la cadena de evolución
    const cadenaEvolucionRespuesta = await fetch(especie.evolution_chain.url)
    const cadenaEvolucion = await cadenaEvolucionRespuesta.json()

    // Determinar etapa de evolución
    let etapaEvolucion = 1
    const cadena = cadenaEvolucion.chain
    if (cadena.evolves_to.length > 0) {
        etapaEvolucion = cadena.species.name === pokemon.name ? 2 
            : (cadena.evolves_to[0].evolves_to.length > 0 && 
               pokemon.name === cadena.evolves_to[0].evolves_to[0].species.name) ? 3 : 1
    }
    

    // Por si quieren ver lo que devuelve
    console.log('Pokemon: ', pokemon)
    console.log('Especie: ', especie)

    document.getElementById('pokemon-imagen').src = pokemon.sprites.front_default
        
    document.getElementById('pokemon-info').innerHTML = `
        <h2>${pokemon.name}</h2>
        <p>Tipo 1: ${pokemon.types[0].type.name}</p>
        <p>Tipo 2: ${pokemon.types[1] ? pokemon.types[1].type.name : 'N/A'}</p>
        <p>Color: ${especie.color.name}</p>
        <p>Etapa de Evolucion: ${etapaEvolucion}</p>
        <p>Peso: ${pokemon.weight}</p>
        <p>Altura: ${pokemon.height}</p>
        <p>Habitat: ${especie.habitat ? especie.habitat.name : 'Desconocido'}</p>
    `
}