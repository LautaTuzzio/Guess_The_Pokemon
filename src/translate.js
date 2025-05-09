const typeTranslations = {
    'normal': 'normal',
    'fire': 'fuego',
    'water': 'agua',
    'grass': 'planta',
    'electric': 'eléctrico',
    'ice': 'hielo',
    'fighting': 'lucha',
    'poison': 'veneno',
    'ground': 'tierra',
    'flying': 'volador',
    'psychic': 'psíquico',
    'bug': 'bicho',
    'rock': 'roca',
    'ghost': 'fantasma',
    'dragon': 'dragón',
    'dark': 'siniestro',
    'steel': 'acero',
    'fairy': 'hada',
    'none': 'ninguno'
};


const habitatTranslations = {
    'cave': 'cueva',
    'forest': 'bosque',
    'grassland': 'pradera',
    'mountain': 'montaña',
    'rare': 'raro',
    'rough-terrain': 'terreno escabroso',
    'sea': 'mar',
    'urban': 'urbano',
    'waters-edge': 'orilla del agua',
    'unknown': 'desconocido'
};


const colorTranslations = {
    'black': 'negro',
    'blue': 'azul',
    'brown': 'marrón',
    'gray': 'gris',
    'green': 'verde',
    'pink': 'rosa',
    'purple': 'púrpura',
    'red': 'rojo',
    'white': 'blanco',
    'yellow': 'amarillo',
    'unknown': 'desconocido'
};


const uiTranslations = {
    'Type 1': 'Tipo 1',
    'Type 2': 'Tipo 2',
    'Habitat': 'Hábitat',
    'Color': 'Color',
    'Evolution Stage': 'Etapa',
    'Height': 'Altura',
    'Weight': 'Peso',
    'Generation': 'Generación',
    'Loading...': 'Cargando...',
    'No Pokémon found with that name': 'No se encontraron Pokémons con ese nombre',
    'Searching for Pokémon...': 'Buscando Pokémon...',
    'You already guessed this Pokémon. Try another.': 'Ya has adivinado este Pokémon. Intenta con otro.',
    'Please enter a Pokémon name': 'Por favor, ingresa un nombre de Pokémon',
    'Pokémon not found': 'Pokémon no encontrado',
    'Error': 'Error',
    'You Win!': '¡Ganaste!',
    'Play Again': 'Jugar de nuevo',
    'Back to Lobby': 'Volver a la sala',
    'Gen': 'Gen'
};


export function translateType(type) {
    if (!type) return ''
    const lowerType = type.toLowerCase()
    return typeTranslations[lowerType] || lowerType
}


export function translateHabitat(habitat) {
    if (!habitat) return ''
    const lowerHabitat = habitat.toLowerCase()
    return habitatTranslations[lowerHabitat] || lowerHabitat
}


export function translateColor(color) {
    if (!color) return ''
    const lowerColor = color.toLowerCase()
    return colorTranslations[lowerColor] || lowerColor
}


export function translateUI(text) {
    if (!text) return ''
    return uiTranslations[text] || text
}


export function capitalize(str) {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
}


export function translatePokemonData(pokemonData) {
    if (!pokemonData) return null;
    

    const translatedData = JSON.parse(JSON.stringify(pokemonData));
    

    if (translatedData.types && translatedData.types.length > 0) {
        translatedData.types = translatedData.types.map(type => translateType(type));
    }
    

    if (translatedData.habitat) {
        translatedData.habitat = translateHabitat(translatedData.habitat);
    }
    

    if (translatedData.color) {
        translatedData.color = translateColor(translatedData.color);
    }
    
    return translatedData;
}


export function translateLoadingProgress(message) {
    if (!message) return ''
    
    if (message.includes('Loading')) {
        return message.replace('Loading', 'Cargando')
    }
    
    if (message.includes('Preparing')) {
        return message.replace('Preparing the game...', 'Preparando el juego...')
    }
    
    if (message.includes('Calling')) {
        return message.replace('Calling the Pokemon', 'Llamando a los Pokemons')
    }
    
    return message
}


export function translateError(error) {
    if (!error) return ''
    
    if (error.includes('Pokemon not found')) {
        return 'Pokémon no encontrado'
    }
    
    if (error.includes('already guessed')) {
        return 'Ya has adivinado este Pokémon. Intenta con otro.'
    }
    
    if (error.includes('Please enter')) {
        return 'Por favor, ingresa un nombre de Pokémon'
    }
    
    return error
}


export function translateHint(hint) {
    if (!hint) return ''
    
    if (hint.includes('unlocks in')) {
        return hint.replace('unlocks in', 'se desbloquea en')
                  .replace('attempts', 'intentos')
                  .replace('attempt', 'intento')
    }
    
    if (hint.includes('Type')) {
        return hint.replace('Type', 'Tipo')
    }
    
    if (hint.includes('Habitat')) {
        return hint.replace('Habitat', 'Hábitat')
    }
    
    if (hint.includes('Color')) {
        return hint.replace('Color', 'Color')
    }
    
    return hint
}
