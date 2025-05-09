import { showErrorToast } from './main.js';
import { translateType, translateHint } from './translate.js';

// Track the number of attempts
let attemptCount = 0;
let hintsEnabled = [false, false, false];
let pokemonData = null;
let activeTooltip = null;
let openedPokeball = null; // Track the currently opened Pokeball

// Función simplificada para mostrar mensajes de pistas como toasts
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
 * Initialize the hint system with the current Pokemon data
 * @param {Array} currentPokemonData - The data of the Pokemon to guess
 */
function initializeHints(currentPokemonData) {
    console.log("Initializing hints with Pokemon:", currentPokemonData[0]);
    // Reset attempt count
    attemptCount = 0;
    hintsEnabled = [false, false, false];
    pokemonData = currentPokemonData;
    
    // Reset all hint elements
    resetHintElements();
    
    // Set up event listeners for the hint elements
    setupHintListeners();
    
    // Add document click listener to close tooltips when clicking outside
    document.addEventListener('click', handleDocumentClick);
}

/**
 * Handle clicks on the document to close tooltips when clicking outside
 * @param {Event} event - The click event
 */
function handleDocumentClick(event) {
    // If we clicked outside any hint element
    if (!event.target.closest('.hint') && activeTooltip) {
        // Hide the active tooltip
        activeTooltip.classList.remove('show');
        activeTooltip = null;
    }
    
    // If we clicked outside and there's an open Pokeball, close it
    if (!event.target.closest('.hint') && openedPokeball) {
        // Get the original source of the image
        const originalSrc = openedPokeball.getAttribute('data-original-src') || '/assets/images/pokeball.png';
        openedPokeball.src = originalSrc;
        openedPokeball = null;
    }
}

/**
 * Reset all hint elements to their initial state
 */
function resetHintElements() {
    const hints = document.querySelectorAll('.hint');
    
    hints.forEach((hint, index) => {
        // Remove enabled class and just-unlocked class
        hint.classList.remove('enabled', 'just-unlocked');
        
        // Get the attempt threshold from the data attribute
        const attempts = parseInt(hint.getAttribute('data-attempts'));
        
        // Update tooltip text
        const tooltip = hint.querySelector('.tooltip');
        if (tooltip) {
            tooltip.textContent = `Se desbloquea en ${attempts} ${attempts === 1 ? "intento" : "intentos"}`;
            tooltip.classList.remove('show');
        }
    });
    
    // Reset active tooltip
    activeTooltip = null;
    
    // Hide hint display if it exists
    const hintDisplay = document.getElementById('hint-display');
    if (hintDisplay) {
        hintDisplay.style.display = 'none';
    }
}

/**
 * Set up event listeners for the hint elements
 */
function setupHintListeners() {
    const hints = document.querySelectorAll('.hint');
    
    hints.forEach((hint, index) => {
        // Remove any existing event listeners
        const newHint = hint.cloneNode(true);
        hint.parentNode.replaceChild(newHint, hint);
        
        // Add click event listener for all hints
        newHint.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent document click from immediately closing
            
            const hintNumber = parseInt(newHint.getAttribute('data-hint-number')) - 1;
            const tooltip = newHint.querySelector('.tooltip');
            
            // Only change the image if the hint is enabled
            if (newHint.classList.contains('enabled')) {
                // Change to open Pokeball when clicked on enabled hints
                const hintImg = newHint.querySelector('img');
                if (hintImg) {
                    // If there was a previously opened Pokeball, close it
                    if (openedPokeball && openedPokeball !== hintImg) {
                        // Get the original source of the image
                        const originalSrc = openedPokeball.getAttribute('data-original-src') || '/assets/images/pokeball.png';
                        openedPokeball.src = originalSrc;
                    }
                    
                    // Store the original image source if we haven't already
                    if (!hintImg.hasAttribute('data-original-src')) {
                        hintImg.setAttribute('data-original-src', hintImg.src);
                    }
                    
                    // Open this Pokeball
                    hintImg.src = '/assets/images/pokebola-abierta.png';
                    
                    // Update the currently opened Pokeball reference
                    openedPokeball = hintImg;
                }
                
                // If this is the silhouette hint, show the popup
                if (hintNumber === 2) {
                    showSilhouettePopup();
                    return;
                }
                
                // For other hints, toggle the tooltip
                if (tooltip) {
                    // If there's already an active tooltip, hide it first
                    if (activeTooltip && activeTooltip !== tooltip) {
                        activeTooltip.classList.remove('show');
                    }
                    
                    // Toggle the current tooltip
                    tooltip.classList.toggle('show');
                    
                    // Update active tooltip reference
                    activeTooltip = tooltip.classList.contains('show') ? tooltip : null;
                    
                    // Update tooltip content if it's being shown
                    if (tooltip.classList.contains('show')) {
                        updateTooltipContent(tooltip, hintNumber);
                    }
                }
            } else {
                // If hint is not enabled, show remaining attempts
                const attempts = parseInt(newHint.getAttribute('data-attempts'));
                const remaining = attempts - attemptCount;
                
                // Show the tooltip with remaining attempts
                if (tooltip) {
                    // If there's already an active tooltip, hide it first
                    if (activeTooltip && activeTooltip !== tooltip) {
                        activeTooltip.classList.remove('show');
                    }
                    
                    tooltip.textContent = `Se desbloquea en ${remaining} ${remaining === 1 ? "intento" : "intentos"}`;
                    tooltip.classList.toggle('show');
                    
                    // Update active tooltip reference
                    activeTooltip = tooltip.classList.contains('show') ? tooltip : null;
                }
            }
        });
    });
}

/**
 * Update tooltip content based on hint type
 * @param {Element} tooltip - The tooltip element
 * @param {Number} hintIndex - The index of the hint
 */
function updateTooltipContent(tooltip, hintIndex) {
    if (!pokemonData) {
        console.error("Pokemon data is null in updateTooltipContent");
        return;
    }
    
    console.log("Updating tooltip content for hint", hintIndex);
    console.log("Pokemon data:", pokemonData);
    
    switch(hintIndex) {
        case 0: // Type hint
            const type1 = pokemonData[2];
            const type2 = pokemonData[3] !== "None" ? pokemonData[3] : null;
            
            // Translate the type
            const translatedType1 = translateType(type1);
            let message = `Tipo: ${translatedType1.charAt(0).toUpperCase() + translatedType1.slice(1)}`;
            
            if (type2) {
                const translatedType2 = translateType(type2);
                message += ` / ${translatedType2.charAt(0).toUpperCase() + translatedType2.slice(1)}`;
            }
            tooltip.textContent = message;
            break;
            
        case 1: // First letter hint
            const name = pokemonData[0];
            const firstLetter = name.charAt(0).toUpperCase();
            tooltip.innerHTML = `La nombre comienza con: <strong>${firstLetter}</strong>`;
            break;
            
        case 2: // Silhouette hint
            tooltip.textContent = "Toca para ver la silueta";
            break;
            
        default:
            tooltip.textContent = "Pista";
    }
}

/**
 * Show a popup with the Pokemon silhouette
 */
function showSilhouettePopup() {
    if (!pokemonData) {
        console.error("Pokemon data is null in showSilhouettePopup");
        return;
    }
    
    console.log("Showing silhouette popup with data:", pokemonData);
    
    // Remove any existing popup
    const existingPopup = document.getElementById('silhouette-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup container
    const popup = document.createElement('div');
    popup.id = 'silhouette-popup';
    popup.className = 'silhouette-popup';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        popup.remove();
    });
    
    // Create silhouette image
    const silhouetteImg = document.createElement('img');
    silhouetteImg.src = pokemonData[1]; // Pokemon sprite URL
    silhouetteImg.alt = "Silueta del Pokémon";
    silhouetteImg.className = 'silhouette-image';
    
    // Create title
    const title = document.createElement('h3');
    title.textContent = "Silueta del Pokémon";
    
    // Add elements to popup
    popup.appendChild(closeButton);
    popup.appendChild(title);
    popup.appendChild(silhouetteImg);
    
    // Add popup to body
    document.body.appendChild(popup);
    
    // Close popup when clicking outside
    document.addEventListener('click', function closePopup(e) {
        if (!popup.contains(e.target) && e.target !== document.querySelector('.hint[data-hint-number="3"] img')) {
            popup.remove();
            document.removeEventListener('click', closePopup);
        }
    });
}

/**
 * Increment the attempt counter and check if any new hints should be unlocked
 */
function incrementAttempts() {
    attemptCount++;
    console.log("Attempt count:", attemptCount);
    checkHintAvailability();
}

/**
 * Check if any hints should be unlocked based on the current attempt count
 */
function checkHintAvailability() {
    const hints = document.querySelectorAll('.hint');
    
    hints.forEach((hint) => {
        // Get the attempt threshold from the data attribute
        const attempts = parseInt(hint.getAttribute('data-attempts'));
        const hintNumber = parseInt(hint.getAttribute('data-hint-number')) - 1; // Convert to 0-based index
        
        // Check if this hint should be enabled
        if (attemptCount >= attempts && !hintsEnabled[hintNumber]) {
            console.log(`Enabling hint ${hintNumber + 1} after ${attemptCount} attempts`);
            hintsEnabled[hintNumber] = true;
            enableHint(hint, hintNumber);
        }
        
        // Update remaining attempts in tooltip if not yet enabled
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
 * Enable a specific hint
 * @param {Element} hintElement - The DOM element for the hint
 * @param {Number} hintIndex - The index of the hint
 */
function enableHint(hintElement, hintIndex) {
    // Add enabled class
    hintElement.classList.add('enabled');
    
    // Add the just-unlocked class for vibration animation
    hintElement.classList.add('just-unlocked');
    
    // Remove the just-unlocked class after the animation completes
    setTimeout(() => {
        hintElement.classList.remove('just-unlocked');
    }, 600); // Match the duration of the vibrate animation
    
    // Update tooltip text based on the hint type
    const tooltipText = getTooltipText(hintIndex);
    const tooltip = hintElement.querySelector('.tooltip');
    if (tooltip) {
        tooltip.textContent = tooltipText;
    }
    
    // Show a notification that a hint is available
    const hintNumber = hintIndex + 1;
    showHintToast(`¡Pista ${hintNumber} desbloqueada! Toca la Pokebola para verla.`);
}

/**
 * Get the tooltip text for a specific hint
 * @param {Number} hintIndex - The index of the hint
 * @returns {String} - The tooltip text
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
 * Reset the hint system for a new game
 */
function resetHints() {
    console.log("Resetting hints");
    attemptCount = 0;
    hintsEnabled = [false, false, false];
    pokemonData = null;
    activeTooltip = null;
    openedPokeball = null; // Reset opened Pokeball reference
    
    // Reset all hint elements
    resetHintElements();
}

export { 
    initializeHints, 
    incrementAttempts, 
    resetHints 
};
