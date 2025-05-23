import { getTextColorClass } from './utils.js'
import { translateType, translateHabitat, translateColor, capitalize } from './translate.js'

/**
 * Determines the appropriate text size class based on content length
 * @param {string} text - The text content to evaluate
 * @returns {string} - CSS class name for text sizing
 */
function getTextSizeClass(text) {
    if (!text) return '';
    
    const length = text.length;
    
    // Check for hyphenated words or words with spaces that need to be wrapped
    if (text.includes('-') || text.includes(' ') || text.includes('_')) {
        return 'text-multi-word';
    }
    
    if (length > 15) {
        return 'text-extra-long';
    } else if (length > 12) {
        return 'text-very-long';
    } else if (length > 8) {
        return 'text-long';
    }
    
    return '';
}

// Crea y agrega la tarjeta del pokemon a la lista con animacion
function createPokemonCard(pokemon, pokemonListContainer) {
    const card = document.createElement('div')
    card.className = 'pokemon-card'
    
    // Mayus la primera letra del nombre
    const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
    const type1 = pokemon.types[0] || 'none'
    const type2 = pokemon.types[1] || 'none'
    const textColorClass = getTextColorClass(pokemon.color)
    
    // Crea la intro (imagen + nombre)
    const intro = document.createElement('div')
    // Store the original color in a data attribute for comparison purposes
    if (!pokemon.originalColor) {
        pokemon.originalColor = pokemon.color;
    }
    intro.className = 'pokemon-intro ' + pokemon.originalColor
    intro.innerHTML = `
        <div class="intro-container">
            <div class="intro-image">
                <img src="${pokemon.sprite}" alt="${capitalizedName}" onerror="this.onerror=null; this.src='../assets/images/Pokebola.png'; this.parentElement.classList.add('fallback-img');">
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
    imageContainer.innerHTML = `<img src="${pokemon.sprite}" alt="${capitalizedName}" onerror="this.onerror=null; this.src='../assets/images/Pokebola.png'; this.parentElement.classList.add('fallback-img');">`;
    
    // Crea el contenedor de la info
    const infoContainer = document.createElement('div')
    infoContainer.className = 'pokemon-info'
    
    // Process types for display and translate them
    const displayType1 = capitalize(translateType(type1))
    const displayType2 = type2 !== 'none' ? capitalize(translateType(type2)) : capitalize(translateType('none'))
    const displayColor = capitalize(translateColor(pokemon.color))
    const displayHabitat = capitalize(translateHabitat(pokemon.habitat))
    
    // Define todas las celdas (already translated in the HTML)
    const cells = [
        { id: 'type1', text: displayType1, class: 'type1-cell', label: 'Tipo 1' },
        { id: 'type2', text: displayType2, class: 'type2-cell', label: 'Tipo 2' },
        { id: 'habitat', text: displayHabitat, class: 'habitat-cell', label: 'Hábitat' },
        { id: 'color', text: displayColor, class: 'color-cell', label: 'Color' },
        { id: 'evolutionStage', text: `${pokemon.evolutionStage}`, class: 'evolution-cell', label: 'Etapa' },
        { id: 'height', text: `${pokemon.height}m`, class: 'height-cell', label: 'Altura' },
        { id: 'weight', text: `${pokemon.weight}kg`, class: 'weight-cell', label: 'Peso' },
        { id: 'generation', text: `Gen ${pokemon.generation}`, class: 'generation-cell', label: 'Generación' },
    ]
    
    // Agrega todas las celdas al contenedor de la info
    cells.forEach(cell => {
        const div = document.createElement('div')
        div.className = `info-cell ${cell.class || ''}`
        // Add text size class based on content length
        const textSizeClass = getTextSizeClass(cell.text)
        if (textSizeClass) {
            div.className += ` ${textSizeClass}`
        }
        if (cell.id) {
            div.id = cell.id
        }
        // Label
        const label = document.createElement('div')
        label.className = 'info-label'
        label.textContent = cell.label
        div.appendChild(label)
        // Value
        const value = document.createElement('div')
        value.className = 'info-value'
        value.textContent = cell.text
        div.appendChild(value)
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
    
    // Retorna los elementos para las animaciones
    return { card, intro, imageContainer, infoContainer }
}

export { createPokemonCard }
