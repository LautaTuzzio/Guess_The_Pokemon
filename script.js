document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('pokemon-input')
    const pokemonListContainer = document.getElementById('pokemon-list')
    const errorMessage = document.getElementById('error-message')
    const loadingIndicator = document.getElementById('loading')

    // Colores que necesitan texto blanco
    const darkColors = ['blue', 'black', 'brown', 'purple']

    let pokemonList = []
    let selectedIndex = -1
    const loadingScreen = document.getElementById('loading-screen')
    const loadingProgress = document.getElementById('loading-progress')

    // Fetch de todos los pokemons y pre-cargar las imagenes
    async function fetchAllPokemon() {
        try {
            // Primero fetch de todos los pokemons
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000')
            const data = await response.json()
            const total = data.results.length
            let loaded = 0

            // Fetch de datos para cada pokemon y pre-cargar sus sprites
            pokemonList = await Promise.all(
                data.results.map(async (pokemon, index) => {
                    try {
                        const detailResponse = await fetch(pokemon.url)
                        const pokemonData = await detailResponse.json()
                        
                        // Pre-cargar la imagen
                        if (pokemonData.sprites.front_default) {
                            await new Promise((resolve, reject) => {
                                const img = new Image()
                                img.onload = resolve
                                img.onerror = reject
                                img.src = pokemonData.sprites.front_default
                            })
                        }

                        loaded++
                        const progress = Math.floor((loaded / total) * 100)
                        loadingProgress.textContent = `Loading Pokemon data... ${progress}%`

                        return {
                            name: pokemon.name,
                            id: pokemonData.id,
                            url: pokemon.url,
                            sprite: pokemonData.sprites.front_default
                        }
                    } catch (error) {
                        console.error(`Error loading Pokemon ${pokemon.name}:`, error)
                        loaded++
                        return null
                    }
                })
            )

            // Eliminar entradas nulas (cargas fallidas) y ordenar por ID
            pokemonList = pokemonList.filter(p => p !== null).sort((a, b) => a.id - b.id)
            
            // Ocultar la pantalla de carga
            loadingScreen.style.display = 'none'
        } catch (error) {
            console.error('Error fetching Pokemon list:', error)
            loadingProgress.textContent = 'Error loading Pokemon data. Please refresh the page.'
        }
    }

    // Llama a esta funcion cuando la pagina se carga
    fetchAllPokemon()

    const dropdown = document.getElementById('autocomplete-dropdown')

    // Maneja los cambios de entrada para el autocompletado
    input.addEventListener('input', async () => {
        const query = input.value.toLowerCase().trim()
        if (query.length === 0) {
            dropdown.style.display = 'none'
            return
        }

        // Filtra y ordena los nombres de los pokemons
        const matches = pokemonList
            .filter(pokemon => pokemon.name.toLowerCase().startsWith(query))
            .sort((a, b) => a.id - b.id)

        if (matches.length > 0) {
            dropdown.innerHTML = ''
            selectedIndex = -1

            for (const pokemon of matches) {
                try {
                    const item = document.createElement('div')
                    item.className = 'autocomplete-item'
                    item.innerHTML = `
                        <img src="${pokemon.sprite}" alt="${pokemon.name}">
                        <span>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</span>
                    `

                    item.addEventListener('click', () => {
                        input.value = pokemon.name
                        dropdown.style.display = 'none'
                        // Trigger de busqueda del pokemon
                        const event = new KeyboardEvent('keypress', { key: 'Enter' })
                        input.dispatchEvent(event)
                    })

                    dropdown.appendChild(item)
                } catch (error) {
                    console.error(`Error fetching Pokemon ${pokemonName}:`, error)
                }
            }

            dropdown.style.display = 'block'
        } else {
            dropdown.style.display = 'none'
        }
    })

    // Maneja la navegacion por teclado
    input.addEventListener('keydown', (e) => {
        const items = dropdown.getElementsByClassName('autocomplete-item')
        if (items.length === 0) return

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            selectedIndex = (selectedIndex + 1) % items.length
            updateSelection(items)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1
            updateSelection(items)
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault()
            const selectedItem = items[selectedIndex].querySelector('span')
            input.value = selectedItem.textContent.toLowerCase()
            dropdown.style.display = 'none'
            // Trigger de busqueda del pokemon
            const event = new KeyboardEvent('keypress', { key: 'Enter' })
            input.dispatchEvent(event)
            return
        }
    })

    function updateSelection(items) {
        Array.from(items).forEach((item, index) => {
            if (index === selectedIndex) {
                item.style.backgroundColor = '#f0f0f0'
            } else {
                item.style.backgroundColor = ''
            }
        })
    }

    // Cierra el dropdown cuando se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-container')) {
            dropdown.style.display = 'none'
        }
    })

    // Maneja el envio del formulario
    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            const pokemonName = input.value.trim().toLowerCase()
            
            if (!pokemonName) {
                errorMessage.textContent = 'Please enter a Pokemon name'
                return
            }
            
            errorMessage.textContent = ''
            loadingIndicator.textContent = 'Loading...'
            
            try {
                const pokemonData = await fetchPokemonData(pokemonName)
                createPokemonCard(pokemonData)
                input.value = ''
            } catch (error) {
                errorMessage.textContent = `Error: ${error.message}`
            } finally {
                loadingIndicator.textContent = ''
            }
        }
    })

    // Fetch de datos del pokemon de la API
    async function fetchPokemonData(pokemonName) {
        try {
            // Fetch de datos basicos del pokemon
            const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
            if (!pokemonResponse.ok) {
                throw new Error('Pokemon not found')
            }
            const pokemonData = await pokemonResponse.json()
            
            // Fetch de datos de la especie para habitat, color, y cadena de evolucion
            const speciesResponse = await fetch(pokemonData.species.url)
            const speciesData = await speciesResponse.json()
            
            return {
                id: pokemonData.id,
                name: pokemonData.name,
                sprite: pokemonData.sprites.front_default,
                types: pokemonData.types.map(t => t.type.name),
                height: pokemonData.height / 10, // Convert to meters
                weight: pokemonData.weight / 10, // Convert to kg
                habitat: speciesData.habitat ? speciesData.habitat.name : 'unknown',
                color: speciesData.color ? speciesData.color.name : 'unknown',
                evolutionStage: await determineEvolutionStage(speciesData),
                generation: getGenerationNumber(speciesData.generation.name)
            }
        } catch (error) {
            throw error
        }
    }
    
    // Determina la etapa de evolucion
    async function determineEvolutionStage(speciesData) {
        try {
            const evolutionResponse = await fetch(speciesData.evolution_chain.url)
            const evolutionData = await evolutionResponse.json()
            
            let stage = 1
            let chain = evolutionData.chain
            let currentPokemonName = speciesData.name
            
            // Verifica si es la forma base
            if (chain.species.name === currentPokemonName) {
                return stage
            }
            
            // Verifica si es la primera evolucion
            if (chain.evolves_to && chain.evolves_to.length > 0) {
                stage = 2
                for (const evolution of chain.evolves_to) {
                    if (evolution.species.name === currentPokemonName) {
                        return stage
                    }
                    
                    // Verifica si es la segunda evolucion
                    if (evolution.evolves_to && evolution.evolves_to.length > 0) {
                        stage = 3
                        for (const finalEvolution of evolution.evolves_to) {
                            if (finalEvolution.species.name === currentPokemonName) {
                                return stage
                            }
                        }
                    }
                }
            }
            
            return stage // Default a 1 si no podemos determinar
        } catch (error) {
            console.error("Error determining evolution stage:", error)
            return 1 // Default a 1 si hay un error
        }
    }
    
    // Obtiene el numero de generacion a partir del nombre de la generacion (e.g., "generation-i" -> 1)
    function getGenerationNumber(generationName) {
        const romanNumerals = {
            'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 
            'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9
        }
        
        const genParts = generationName.split('-')
        if (genParts.length > 1) {
            const roman = genParts[1].toLowerCase()
            return romanNumerals[roman] || '?'
        }
        return '?'
    }
    
    // Determinamos si el texto tiene que ser blanco o negro basado en el fondo
    function getTextColorClass(backgroundColor) {
        return darkColors.includes(backgroundColor) ? 'text-white' : 'text-black'
    }
    
    // Crea y agrega la tarjeta del pokemon a la lista con animacion
    function createPokemonCard(pokemon) {
        const card = document.createElement('div')
        card.className = 'pokemon-card'
        
        // Mayus la primera letra del nombre
        const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
        const type1 = pokemon.types[0] || 'none'
        const type2 = pokemon.types[1] || 'none'
        const textColorClass = getTextColorClass(pokemon.color)
        
        // Crea la intro (imagen + nombre)
        const intro = document.createElement('div')
        intro.className = 'pokemon-intro ' + pokemon.color
        intro.innerHTML = `
            <div class="intro-container">
                <div class="intro-image">
                    <img src="${pokemon.sprite}" alt="${capitalizedName}">
                </div>
                <div class="intro-name ${textColorClass}">${capitalizedName}</div>
            </div>
        `
        
        // Crea la info
        const data = document.createElement('div')
        data.className = 'pokemon-data'
        
        // Crea el contenedor de la imagen
        const imageContainer = document.createElement('div')
        imageContainer.className = 'pokemon-image'
        imageContainer.innerHTML = `<img src="${pokemon.sprite}" alt="${capitalizedName}">`
        
        // Crea el contenedor de la info
        const infoContainer = document.createElement('div')
        infoContainer.className = 'pokemon-info'
        
        // Define todas las celdas
        const cells = [
            { class: `type-cell ${type1}`, text: type1.charAt(0).toUpperCase() + type1.slice(1) },
            { class: `type-cell ${type2}`, text: type2 !== 'none' ? type2.charAt(0).toUpperCase() + type2.slice(1) : 'None' },
            { class: pokemon.habitat, text: pokemon.habitat.charAt(0).toUpperCase() + pokemon.habitat.slice(1) },
            { class: pokemon.color, text: pokemon.color.charAt(0).toUpperCase() + pokemon.color.slice(1) },
            { class: 'evolution-stage', text: `Stage ${pokemon.evolutionStage}` },
            { class: 'height', text: `${pokemon.height}m` },
            { class: 'weight', text: `${pokemon.weight}kg` }
        ]
        
        // Agrega todas las celdas al contenedor de la info
        cells.forEach(cell => {
            const div = document.createElement('div')
            div.className = `info-cell ${cell.class}`
            div.textContent = cell.text
            infoContainer.appendChild(div)
        })
        
        // Agrega el contenedor de la imagen y la info al contenedor de la data
        data.appendChild(imageContainer)
        data.appendChild(infoContainer)
        
        // Agrega ambos contenedores a la tarjeta
        card.appendChild(intro)
        card.appendChild(data)
        
        // Agrega la tarjeta al inicio de la lista
        pokemonListContainer.insertBefore(card, pokemonListContainer.firstChild)
        
        // Muestra la intro con animacion
        setTimeout(() => {
            intro.classList.add('fade-in')
        }, 100)
        
        // Transiciona a la vista de datos
        setTimeout(() => {
            intro.classList.add('fade-out')
            
            // Despues de que la intro desaparece, anima cada celda secuencialmente
            setTimeout(() => {
                // Primero anima la imagen
                imageContainer.classList.add('animated')
                
                // Anima cada celda de la info con un retraso
                const infoCells = infoContainer.querySelectorAll('.info-cell')
                infoCells.forEach((cell, index) => {
                    setTimeout(() => {
                        cell.classList.add('animated')
                    }, 100 + (index * 100)) // 100ms de delay entre cada celda
                })
            }, 400)
        }, 1000)
    }
})