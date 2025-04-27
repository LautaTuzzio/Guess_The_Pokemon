import { fetchPokemonData } from './api.js'


const socket = io()

const randpokemonInfo = JSON.parse(localStorage.getItem('pokemonInfo'));


//Funcion para sacar el numero romano y devolverlo como decimal
export function decimal(obj) {
  const equivalencias = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
    IX: 9
  };
  if (!obj || !obj) return console.log(obj);
  let nombre = obj.trim().replace(/generation-/i, "").trim();
  return equivalencias[nombre.toUpperCase()] || null;
}

function comparar(pokemonRandom, pokeInfo){
  //Check de victoria
  if(pokemonRandom.name === pokeInfo.name ){
    console.log("ganaste!!")
  }
  //comparacion de tipos
  if (pokemonRandom.types[0].toLowerCase() === pokeInfo.types[0].toLowerCase()){
    setTimeout(() => {
      console.log("tipo 1 correcto")
    }, 100);
  }

  //revisa si existe segundo tipo en el pokemon ingresado
  if(!pokeInfo.types[1]){
    pokeInfo.types[1] = "Ninguno"
  }
  //revisa si existe segundo tipo en el pokemon random
  if(!pokemonRandom.types[1]){
    pokemonRandom.types[1] = "Ninguno"
  }
  
  //comparacion de tipo 2
  if (pokemonRandom.types[1].toLowerCase() === pokeInfo.types[1].toLowerCase()){
    setTimeout(() => {
      console.log("tipo 2 correcto")
    }, 100);
  }

  //comparacion de color
  if (pokemonRandom.color === pokeInfo.color){
    setTimeout(() => {
      console.log("color correcto")
    }, 100);
  }

  //convierto de numeros romanos a decimales
  const randomGeneration = decimal(pokemonRandom.generation);

  if (randomGeneration === pokeInfo.generation){
    setTimeout(() => {
      console.log("generacion correcta")
    }, 100);
  }
  //reviso si la altura y el peso son iguales
  if(pokemonRandom.height/10 === pokeInfo.height){
    setTimeout(() => {
      console.log("altura correcta")
    }, 100);
  }
  
  if(pokemonRandom.weight/10=== pokeInfo.weight){
    setTimeout(() => {
      console.log("peso correcto")
    }, 100);
  }

  if(pokeInfo.habitat === "unknown"){
    pokeInfo.habitat = "Desconocido"
  }
  
  if(pokemonRandom.habitat.toLowerCase() === pokeInfo.habitat.toLowerCase()){
    setTimeout(() => {
      console.log("habitat correcto")
    }, 100);
  }

  if(pokemonRandom.evolutionStage === pokeInfo.evolutionStage){
    setTimeout(() => {
      console.log("evolucion correcta")
    }, 100);
  }
}


const input = document.getElementById('pokemoninput');
if (!input) {
  console.error("Input element not found!");
} else {
  input.addEventListener('keypress', async (event) => { 
    if (event.key === 'Enter') { 
      var pokemonName = input.value.trim().toLowerCase();
      try {
        const pokeinfo = await fetchPokemonData(pokemonName);
        input.value = "";
        comparar(randpokemonInfo, pokeinfo);
      } catch(error){
        console.error("Error:", error);
      }
    }
  });
}