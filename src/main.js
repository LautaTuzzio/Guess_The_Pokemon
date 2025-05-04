// Punto de entrada principal para importar e inicializar los modulos
import { fetchAllPokemon, fetchPokemonData } from './api.js'
import { initializeAutocomplete } from './autocomplete.js'
import { createPokemonCard } from './ui.js'
import { animatePokemonCard } from './animations.js'

// Función simplificada para mostrar mensajes de error como toasts
export function showErrorToast(message) {
    // Crear el toast
    const errorToast = document.createElement('div');
    errorToast.className = 'error-notification';
    errorToast.textContent = message;
    document.body.appendChild(errorToast);
    
    // Eliminar el toast después de 3 segundos (coincide con la duración de la animación)
    setTimeout(() => {
        if (errorToast.parentNode) {
            errorToast.parentNode.removeChild(errorToast);
        }
    }, 3000);
}

// Array global para almacenar los Pokémon ya adivinados
// Lo hacemos global para que el módulo de autocompletado pueda acceder a él
window.guessedPokemon = [];

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('pokemon-input')
    const pokemonListContainer = document.getElementById('pokemon-list')
    const errorMessage = document.getElementById('error-message')
    const loadingIndicator = document.getElementById('loading')
    const loadingScreen = document.getElementById('loading-screen')
    const loadingProgress = document.getElementById('loading-progress')
    const dropdown = document.getElementById('autocomplete-dropdown')

    let pokemonList = []

    // Inicializa la aplicacion
    async function initializeApp() {
        // Carga todos los Pokemon
        pokemonList = await fetchAllPokemon(loadingProgress)
        
        // Ocultar la pantalla de carga
        loadingScreen.style.display = 'none'
        
        // Inicializa el autocompletado pasando la referencia al array de Pokémon adivinados
        initializeAutocomplete(input, dropdown, pokemonList, window.guessedPokemon)
        
        // Configura el evento para buscar Pokemon
        setupPokemonSearch()
    }

    // Configura el evento para buscar Pokemon
    function setupPokemonSearch() {
        // Maneja el envio del formulario
        input.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault()
                const pokemonName = input.value.trim().toLowerCase()
                
                if (!pokemonName) {
                    showErrorToast('Por favor, ingresa un nombre de Pokémon')
                    return
                }
                
                // Verificar si el Pokémon ya ha sido adivinado
                if (window.guessedPokemon.includes(pokemonName)) {
                    showErrorToast('Ya has adivinado este Pokémon. Intenta con otro.')
                    return
                }
                
                errorMessage.textContent = ''
                loadingIndicator.textContent = 'Loading...'
                
                try {
                    const pokemonData = await fetchPokemonData(pokemonName)
                    // Agregar el nombre del Pokémon a la lista de adivinados
                    window.guessedPokemon.push(pokemonName)
                    const cardElements = createPokemonCard(pokemonData, pokemonListContainer)
                    animatePokemonCard(cardElements)
                    input.value = ''
                } catch (error) {
                    showErrorToast(`Error: ${error.message}`)
                } finally {
                    loadingIndicator.textContent = ''
                }
            }
        })
    }

    // Inicia la aplicacion
    initializeApp()
})
