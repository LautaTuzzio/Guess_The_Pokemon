// Maneja la navegacion por teclado en el dropdown
function updateSelection(items, selectedIndex) {
    Array.from(items).forEach((item, index) => {
        if (index === selectedIndex) {
            item.style.backgroundColor = '#f0f0f0'
        } else {
            item.style.backgroundColor = ''
        }
    })
}

// Función para esperar un tiempo determinado
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Inicializa el autocompletado
function initializeAutocomplete(input, dropdown, pokemonList, guessedPokemonArray) {
    let selectedIndex = -1;
    let lastQuery = '';
    let timeoutId = null;
    
    // Si no se proporciona un array de Pokémon adivinados, crear uno vacío
    const guessedPokemon = guessedPokemonArray || window.guessedPokemon || [];

    // Función para buscar Pokémon por nombre
    async function fetchPokemonByPrefix(prefix) {
        try {
            // Obtener la lista actualizada de Pokémon adivinados
            const currentGuessedPokemon = window.guessedPokemon || guessedPokemon;
            
            // Limitar a 15 resultados para mejor rendimiento
            const limit = 15;
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`);
            const data = await response.json();
            
            // Filtrar por prefijo y excluir los ya adivinados
            const filteredResults = data.results
                .filter(pokemon => {
                    return pokemon.name.startsWith(prefix) && 
                           !currentGuessedPokemon.includes(pokemon.name);
                })
                .slice(0, limit);
            
            // Obtener detalles de cada Pokémon con un retraso entre solicitudes
            const pokemonDetails = [];
            for (const pokemon of filteredResults) {
                try {
                    const detailResponse = await fetch(pokemon.url);
                    const pokemonData = await detailResponse.json();
                    
                    pokemonDetails.push({
                        name: pokemon.name,
                        id: pokemonData.id,
                        sprite: pokemonData.sprites.front_default
                    });
                    
                    // Esperar 50ms entre cada solicitud para evitar errores 429
                    await sleep(50);
                } catch (error) {
                    console.error(`Error fetching details for ${pokemon.name}:`, error);
                }
            }
            
            return pokemonDetails.sort((a, b) => a.id - b.id);
        } catch (error) {
            console.error('Error fetching Pokemon by prefix:', error);
            return [];
        }
    }

    // Maneja los cambios de entrada para el autocompletado con debounce
    input.addEventListener('input', () => {
        const query = input.value.toLowerCase().trim();
        
        // Limpiar el timeout anterior si existe
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        if (query.length === 0) {
            dropdown.style.display = 'none';
            return;
        }
        
        // Solo actualizar si la consulta ha cambiado
        if (query !== lastQuery) {
            lastQuery = query;
            
            // Establecer un timeout para evitar demasiadas solicitudes
            timeoutId = setTimeout(async () => {
                // Mostrar indicador de carga
                dropdown.innerHTML = '<div class="loading-item">Buscando Pokémon...</div>';
                dropdown.style.display = 'block';
                
                const matches = await fetchPokemonByPrefix(query);
                
                if (matches.length > 0) {
                    dropdown.innerHTML = '';
                    selectedIndex = -1;

                    for (const pokemon of matches) {
                        try {
                            const item = document.createElement('div');
                            item.className = 'autocomplete-item';
                            
                            // Crear la imagen con manejo de errores
                            const imgContainer = document.createElement('div');
                            imgContainer.className = 'pokemon-img-container';
                            
                            const img = document.createElement('img');
                            img.alt = pokemon.name;
                            // Usar una imagen de respaldo si el sprite no está disponible
                            if (!pokemon.sprite) {
                                img.src = '../assets/images/Pokebola.png'; // Imagen de respaldo
                                imgContainer.classList.add('fallback-img');
                            } else {
                                img.src = pokemon.sprite;
                                // Manejar errores de carga de imagen
                                img.onerror = function() {
                                    this.src = '../assets/images/Pokebola.png'; // Imagen de respaldo
                                    imgContainer.classList.add('fallback-img');
                                };
                            }
                            
                            imgContainer.appendChild(img);
                            
                            // Crear el span con el nombre
                            const nameSpan = document.createElement('span');
                            nameSpan.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
                            
                            // Agregar elementos al item
                            item.appendChild(imgContainer);
                            item.appendChild(nameSpan);

                            item.addEventListener('click', () => {
                                input.value = pokemon.name;
                                dropdown.style.display = 'none';
                                // Trigger de busqueda del pokemon
                                const event = new KeyboardEvent('keypress', { key: 'Enter' });
                                input.dispatchEvent(event);
                            });

                            dropdown.appendChild(item);
                        } catch (error) {
                            console.error(`Error displaying Pokemon ${pokemon.name}:`, error);
                        }
                    }

                    dropdown.style.display = 'block';
                } else {
                    dropdown.innerHTML = '<div class="no-results">No se encontraron Pokémons con ese nombre</div>';
                }
            }, 300); // Debounce de 300ms para evitar demasiadas solicitudes mientras el usuario escribe
        }
    })

    // Maneja la navegacion por teclado
    input.addEventListener('keydown', (e) => {
        const items = dropdown.getElementsByClassName('autocomplete-item')
        
        if (e.key === 'Enter') {
            e.preventDefault()
            
            // Si hay un elemento seleccionado en el dropdown, usa ese valor
            if (items.length > 0 && selectedIndex >= 0) {
                const selectedItem = items[selectedIndex].querySelector('span')
                input.value = selectedItem.textContent.toLowerCase()
            }
            
            // Oculta el dropdown y dispara el evento de búsqueda
            dropdown.style.display = 'none'
            
            // Trigger de busqueda del pokemon
            const event = new KeyboardEvent('keypress', { key: 'Enter' })
            input.dispatchEvent(event)
            
            // Limpia el input después de la búsqueda
            setTimeout(() => {
                input.value = ''
            }, 100)
            
            return
        }
        
        if (items.length === 0) return
        
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            selectedIndex = (selectedIndex + 1) % items.length
            updateSelection(items, selectedIndex)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1
            updateSelection(items, selectedIndex)
        }
    })

    // Cierra el dropdown cuando se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-container')) {
            dropdown.style.display = 'none'
        }
    })
}

export { initializeAutocomplete, updateSelection }
