// Translations for Pokemon types, colors, habitats and other game elements

// 

// Pokemon types
export const typeTranslations = {
    // Types
    "normal": "normal",
    "fire": "fuego",
    "water": "agua",
    "electric": "eléctrico",
    "grass": "planta",
    "ice": "hielo",
    "fighting": "lucha",
    "poison": "veneno",
    "ground": "tierra",
    "flying": "volador",
    "psychic": "psíquico",
    "bug": "bicho",
    "rock": "roca",
    "ghost": "fantasma",
    "dragon": "dragón",
    "dark": "siniestro",
    "steel": "acero",
    "fairy": "hada",
    "none": "ninguno",
    "unknown": "desconocido"
};

// Pokemon colors
export const colorTranslations = {
    "black": "negro",
    "blue": "azul",
    "brown": "marrón",
    "gray": "gris",
    "green": "verde",
    "pink": "rosa",
    "purple": "púrpura",
    "red": "rojo",
    "white": "blanco",
    "yellow": "amarillo"
};

// Pokemon habitats
export const habitatTranslations = {
    "cave": "cueva",
    "forest": "bosque",
    "grassland": "pradera",
    "mountain": "montaña",
    "rare": "raro",
    "rough-terrain": "terreno áspero",
    "sea": "mar",
    "urban": "urbano",
    "waters-edge": "orilla del <br> agua",
    "unknown": "desconocido"
};

// Game UI elements
export const uiTranslations = {
    // Hint system
    "Type": "Tipo",
    "The name starts with": "El nombre empieza con",
    "Pokemon Silhouette": "Silueta del Pokémon",
    "Tap to see the type": "Toca para ver el tipo",
    "Tap to see the first letter": "Toca para ver la primera letra",
    "Tap to see the silhouette": "Toca para ver la silueta",
    "Hint": "Pista",
    "Hint unlocked! Tap the Pokeball to see it.": "¡Pista desbloqueada! Toca la Pokebola para verla.",
    "Unlocks in": "Desbloquea en",
    "attempt": "intento",
    "attempts": "intentos",
    
    // Game UI
    "Guess the Pokemon": "Adivina el Pokémon",
    "Guess the pokemon based on clues": "Adivina el pokémon en base a pistas",
    "Type a pokemon name": "Escribe el nombre de un pokémon",
    "Height": "Altura",
    "Weight": "Peso",
    "Generation": "Generación",
    "Stage": "Etapa",
    "Habitat": "Hábitat",
    "Color": "Color",
    "Unknown": "Desconocido",
    "None": "Ninguno"
};

/**
 * Translate a type to Spanish
 * @param {String} type - The type in English
 * @returns {String} - The type in Spanish
 */
export function translateType(type) {
    if (!type) return uiTranslations["Unknown"];
    
    const lowerType = type.toLowerCase();
    return typeTranslations[lowerType] || lowerType;
}

/**
 * Translate a color to Spanish
 * @param {String} color - The color in English
 * @returns {String} - The color in Spanish
 */
export function translateColor(color) {
    if (!color) return uiTranslations["Unknown"];
    
    const lowerColor = color.toLowerCase();
    return colorTranslations[lowerColor] || lowerColor;
}

/**
 * Translate a habitat to Spanish
 * @param {String} habitat - The habitat in English
 * @returns {String} - The habitat in Spanish
 */
export function translateHabitat(habitat) {
    if (!habitat) return uiTranslations["Unknown"];
    
    const lowerHabitat = habitat.toLowerCase();
    return habitatTranslations[lowerHabitat] || lowerHabitat;
}

/**
 * Capitalize the first letter of a string
 * @param {String} str - The string to capitalize
 * @returns {String} - The capitalized string
 */
export function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}
