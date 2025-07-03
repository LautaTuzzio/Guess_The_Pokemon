
import { showErrorToast } from './main.js';

// Contador de intentos
let attemptCount = 0;
let hintsEnabled = [false, false, false];
let pokemonData = null;
let activeTooltip = null;
let openedPokeball = null; // Seguimiento de la Pokebola actualmente abierta

// Función para mostrar mensajes de pistas como toasts
function showHintToast(message) {
    // Crear el toast
    const hintToast = document.createElement('div');
    hintToast.className = 'hint-notification';
    hintToast.textContent = message;
    document.body.appendChild(hintToast);
    
    // Eliminar el toast después de 3 segundos (coincide con la duración de la animación)
    setTimeout(() => {
        if (hintToast.parentNode) {
            hintToast.parentNode.removeChild(hintToast);
        }
    }, 3000);
}

/**
 * Inicializa el sistema de pistas con los datos del Pokemon actual
 * @param {Array} currentPokemonData - Los datos del Pokemon a adivinar
 */
function initializeHints(currentPokemonData) {
    console.log("Inicializando pistas con Pokemon:", currentPokemonData);
    // Reiniciar contador de intentos
    attemptCount = 0;
    hintsEnabled = [false, false, false];
    
    // Verificar si los datos son un objeto (formato multiplayer) o un array (formato singleplayer)
    if (currentPokemonData && typeof currentPokemonData === 'object' && !Array.isArray(currentPokemonData)) {
        // Formato multiplayer (objeto)
        pokemonData = [
            currentPokemonData.name,
            currentPokemonData.evolutionStage,
            currentPokemonData.types[0],
            currentPokemonData.types[1] || "None",
            currentPokemonData.color,
            currentPokemonData.generation,
            currentPokemonData.weight,
            currentPokemonData.height,
            currentPokemonData.habitat
        ];
    } else {
        // Formato singleplayer (array)
        pokemonData = currentPokemonData;
    }
    
    // Reiniciar todos los elementos de pista
    resetHintElements();
    
    // Configurar los event listeners para los elementos de pista
    setupHintListeners();
    
    // Add document click listener to close tooltips when clicking outside
    // Agregar event listener de documento para cerrar tooltips al hacer clic fuera
    document.addEventListener('click', handleDocumentClick);
}

/**
 * Maneja los clics en el documento para cerrar tooltips cuando se hace clic fuera
 * @param {Event} event - El evento de clic
 */
function handleDocumentClick(event) {
    // Si se hizo clic fuera de cualquier elemento de pista
    if (!event.target.closest('.hint') && activeTooltip) {
        // Ocultar el tooltip activo
        activeTooltip.classList.remove('show');
        activeTooltip = null;
    }
    
    // Si se hizo clic fuera y hay una Pokebola abierta, cerrarla
    if (!event.target.closest('.hint') && openedPokeball) {
        // Obtener la fuente original de la imagen
        const originalSrc = openedPokeball.getAttribute('data-original-src') || '/assets/images/pokeball.png';
        openedPokeball.src = originalSrc;
        openedPokeball = null;
    }
}

/**
 * Reinicia todos los elementos de pista a su estado inicial
 */
function resetHintElements() {
    const hints = document.querySelectorAll('.hint');
    
    hints.forEach((hint, index) => {
        // Eliminar las clases enabled y just-unlocked
        hint.classList.remove('enabled', 'just-unlocked');
        
        // Obtener el umbral de intentos del atributo de datos
        const attempts = parseInt(hint.getAttribute('data-attempts'));
        
        // Actualizar texto del tooltip
        const tooltip = hint.querySelector('.tooltip');
        if (tooltip) {
            tooltip.textContent = `Se desbloquea en ${attempts} ${attempts === 1 ? "intento" : "intentos"}`;
            tooltip.classList.remove('show');
        }
    });
    
    // Reiniciar tooltip activo
    activeTooltip = null;
    
    // Ocultar la visualizacion de pistas si existe
    const hintDisplay = document.getElementById('hint-display');
    if (hintDisplay) {
        hintDisplay.style.display = 'none';
    }
}

/**
 * Configurar los event listeners para los elementos de pista
 */
function setupHintListeners() {
    const hints = document.querySelectorAll('.hint');
    
    hints.forEach((hint, index) => {
        // Eliminar cualquier event listener existente
        const newHint = hint.cloneNode(true);
        hint.parentNode.replaceChild(newHint, hint);
        
        // Agregar event listener de clic para todas las pistas
        newHint.addEventListener('click', (event) => {
            event.stopPropagation(); // Evitar que el clic en el documento lo cierre inmediatamente
            
            const hintNumber = parseInt(newHint.getAttribute('data-hint-number')) - 1;
            const tooltip = newHint.querySelector('.tooltip');
            
            // Solo cambiar la imagen si la pista esta habilitada
            if (newHint.classList.contains('enabled')) {
                // Cambiar a Pokebola abierta cuando se hace clic en pistas habilitadas
                const hintImg = newHint.querySelector('img');
                if (hintImg) {
                    // Si habia una Pokebola abierta anteriormente, cerrarla
                    if (openedPokeball && openedPokeball !== hintImg) {
                        // Obtener la fuente original de la imagen
                        const originalSrc = openedPokeball.getAttribute('data-original-src') || '/assets/images/pokeball.png';
                        openedPokeball.src = originalSrc;
                    }
                    
                    // Almacenar la fuente original de la imagen si aun no lo hemos hecho
                    if (!hintImg.hasAttribute('data-original-src')) {
                        hintImg.setAttribute('data-original-src', hintImg.src);
                    }
                    
                    // Abrir esta Pokebola
                    hintImg.src = '/assets/images/Pokebola-abierta.png';
                    
                    // Actualizar la referencia de la Pokebola actualmente abierta
                    openedPokeball = hintImg;
                }
                
                // Si esta es la pista de silueta, mostrar el popup
                if (hintNumber === 2) {
                    showSilhouettePopup();
                    return;
                }
                
                // Para otras pistas, alternar el tooltip
                if (tooltip) {
                    // Si ya hay un tooltip activo, ocultarlo primero
                    if (activeTooltip && activeTooltip !== tooltip) {
                        activeTooltip.classList.remove('show');
                    }
                    
                    // Alternar el tooltip actual
                    tooltip.classList.toggle('show');
                    
                    // Actualizar referencia del tooltip activo
                    activeTooltip = tooltip.classList.contains('show') ? tooltip : null;
                    
                    // Actualizar contenido del tooltip si se esta mostrando
                    if (tooltip.classList.contains('show')) {
                        updateTooltipContent(tooltip, hintNumber);
                    }
                }
            } else {
                // Si la pista no esta habilitada, mostrar intentos restantes
                const attempts = parseInt(newHint.getAttribute('data-attempts'));
                const remaining = attempts - attemptCount;
                
                // Mostrar el tooltip con los intentos restantes
                if (tooltip) {
                    // Si ya hay un tooltip activo, ocultarlo primero
                    if (activeTooltip && activeTooltip !== tooltip) {
                        activeTooltip.classList.remove('show');
                    }
                    
                    tooltip.textContent = `Se desbloquea en ${remaining} ${remaining === 1 ? "intento" : "intentos"}`;
                    tooltip.classList.toggle('show');
                    
                    // Actualizar referencia del tooltip activo
                    activeTooltip = tooltip.classList.contains('show') ? tooltip : null;
                }
            }
        });
    });
}

/**
 * Actualiza el contenido del tooltip basado en el tipo de pista
 * @param {Element} tooltip - El elemento tooltip
 * @param {Number} hintIndex - El indice de la pista
 */
function updateTooltipContent(tooltip, hintIndex) {
    if (!pokemonData) {
        console.error("Pokemon data is null in updateTooltipContent");
        return;
    }
    
    console.log("Actualizando contenido del tooltip para la pista", hintIndex);
    console.log("Pokemon data:", pokemonData);
    
    switch(hintIndex) {
        case 0: // Pista de tipo
            const type1 = pokemonData[2];
            const type2 = pokemonData[3] !== "None" ? pokemonData[3] : null;
            
            let message = `Tipo: ${type1}`;
            
            if (type2) {
                message += ` / ${type2}`;
            }
            tooltip.textContent = message;
            break;
            
        case 1: // Pista de primera letra
            const name = pokemonData[0];
            const firstLetter = name.charAt(0).toUpperCase();
            tooltip.innerHTML = `La nombre comienza con: <strong>${firstLetter}</strong>`;
            break;
            
        case 2: // Pista de silueta
            tooltip.textContent = "Toca para ver la silueta";
            break;
            
        default:
            tooltip.textContent = "Pista";
    }
}

/**
 * Muestra un popup con la silueta del Pokemon
 */
function showSilhouettePopup() {
    if (!pokemonData) {
        console.error("Pokemon data is null in showSilhouettePopup");
        return;
    }
    
    console.log("Mostrando popup de silueta con datos:", pokemonData);
    
    // Eliminar cualquier popup existente
    const existingPopup = document.getElementById('silhouette-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Crear contenedor del popup
    const popup = document.createElement('div');
    popup.id = 'silhouette-popup';
    popup.className = 'silhouette-popup';
    
    // Estilo para el popup
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'white';
    popup.style.padding = '20px';
    popup.style.borderRadius = '10px';
    popup.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    popup.style.zIndex = '9999';
    popup.style.textAlign = 'center';
    
    // Crear boton de cerrar
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '&times;';
    
    // Estilo para el boton de cerrar
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#333';
    closeButton.addEventListener('click', () => {
        popup.remove();
    });
    
    // Crear imagen de silueta
    const silhouetteImg = document.createElement('img');
    
    // Obtener URL de la imagen desde localStorage o de pokemonData
    let imageUrl;
    const rawPokemonData = JSON.parse(localStorage.getItem('pokemonInfo'));
    
    if (rawPokemonData && rawPokemonData.image) {
        // Si tenemos el formato de objeto con la propiedad image
        imageUrl = rawPokemonData.image;
    } else if (pokemonData && Array.isArray(pokemonData) && pokemonData.length > 9) {
        // Si tenemos el formato de array y contiene la imagen
        imageUrl = pokemonData[9]; // Posición de la imagen en el array
    } else {
        // Fallback: intentar obtener la imagen por ID del Pokemon
        const pokemonId = localStorage.getItem('pokemonId');
        if (pokemonId) {
            imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
        } else {
            console.error("No se pudo encontrar la imagen del Pokémon");
            imageUrl = "../assets/images/Pokebola.png"; // Imagen por defecto
        }
    }
    
    silhouetteImg.src = imageUrl;
    silhouetteImg.alt = "Silueta del Pokémon";
    silhouetteImg.className = 'silhouette-image';
    
    // Aplicar estilos CSS para convertir la imagen en silueta
    silhouetteImg.style.filter = 'brightness(0) saturate(100%)';
    silhouetteImg.style.webkitFilter = 'brightness(0) saturate(100%)';
    silhouetteImg.style.width = '150px';
    silhouetteImg.style.height = '150px';
    
    // Crear titulo
    const title = document.createElement('h3');
    title.textContent = "Silueta del Pokémon";
    
    // Agregar elementos al popup
    popup.appendChild(closeButton);
    popup.appendChild(title);
    popup.appendChild(silhouetteImg);
    
    // Agregar popup al documento
    document.body.appendChild(popup);
    
    // Cerrar popup cuando se hace clic fuera
    document.addEventListener('click', function closePopup(e) {
        if (!popup.contains(e.target) && e.target !== document.querySelector('.hint[data-hint-number="3"] img')) {
            popup.remove();
            document.removeEventListener('click', closePopup);
        }
    });
}

/**
 * Incrementa el contador de intentos y verifica si se deben desbloquear nuevas pistas
 */
function incrementAttempts() {
    attemptCount++;
    console.log("Contador de intentos:", attemptCount);
    checkHintAvailability();
}

/**
 * Verifica si se deben desbloquear pistas basado en el numero actual de intentos
 */
function checkHintAvailability() {
    const hints = document.querySelectorAll('.hint');
    
    hints.forEach((hint) => {
        // Obtener el umbral de intentos del atributo de datos
        const attempts = parseInt(hint.getAttribute('data-attempts'));
        const hintNumber = parseInt(hint.getAttribute('data-hint-number')) - 1; // Convertir a indice base 0
        
        // Verificar si se deben desbloquear nuevas pistas
        if (attemptCount >= attempts && !hintsEnabled[hintNumber]) {
            console.log(`Habilitando pista ${hintNumber + 1} despues de ${attemptCount} intentos`);
            hintsEnabled[hintNumber] = true;
            enableHint(hint, hintNumber);
        }
        
        // Actualizar intentos restantes en tooltip si no esta habilitada
        if (!hintsEnabled[hintNumber]) {
            const tooltip = hint.querySelector('.tooltip');
            if (tooltip) {
                const remaining = attempts - attemptCount;
                tooltip.textContent = `Se desbloquea en ${remaining} ${remaining === 1 ? "intento" : "intentos"}`;
            }
        }
    });
}

/**
 * Habilita una pista especifica
 * @param {Element} hintElement - El elemento DOM para la pista
 * @param {Number} hintIndex - El indice de la pista
 */
function enableHint(hintElement, hintIndex) {
    // Agregar clase enabled
    hintElement.classList.add('enabled');
    
    // Agregar clase just-unlocked para animacion
    hintElement.classList.add('just-unlocked');
    
    // Eliminar clase just-unlocked despues de la animacion
    setTimeout(() => {
        hintElement.classList.remove('just-unlocked');
    }, 600); // Coincidir con la duracion de la animacion de vibracion
    
    // Actualizar texto del tooltip basado en el tipo de pista
    const tooltipText = getTooltipText(hintIndex);
    const tooltip = hintElement.querySelector('.tooltip');
    if (tooltip) {
        tooltip.textContent = tooltipText;
    }
    
    // Mostrar notificacion de que una pista esta disponible
    const hintNumber = hintIndex + 1;
    showHintToast(`¡Pista ${hintNumber} desbloqueada! Toca la Pokebola para verla.`);
}

/**
 * Obtener el texto del tooltip para una pista especifica
 * @param {Number} hintIndex - El indice de la pista
 * @returns {String} - El texto del tooltip
 */
function getTooltipText(hintIndex) {
    switch(hintIndex) {
        case 0:
            return "Toca para ver el tipo";
        case 1:
            return "Toca para ver la primera letra";
        case 2:
            return "Toca para ver la silueta";
        default:
            return "Pista";
    }
}

/**
 * Reiniciar el sistema de pistas para un nuevo juego
 */
function resetHints() {
    console.log("Resetting hints");
    attemptCount = 0;
    hintsEnabled = [false, false, false];
    pokemonData = null;
    activeTooltip = null;
    openedPokeball = null; // Reiniciar referencia de Pokebola abierta
    
    // Reiniciar todos los elementos de pista
    resetHintElements();
}

export { 
    initializeHints, 
    incrementAttempts, 
    resetHints 
};
