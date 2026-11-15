//step 3: create this file. 

import axios from 'axios'

//direccion de nuestra API. this is where the data is coming from
const URL = 'http://localhost:3000/api/tarifas'

//obtener todas las tarifas
export async function obtenerTarifas() {   //this line is an async function that will return a promise. 
    //async function definition: 
    
    const respuesta = await axios.get(URL)   //here axios goes to the url specified and gets all the data. 
    //The await keyword is used to wait for the promise to resolve before continuing.
    
    return respuesta.data.tarifas  // we are only returning the tarifas data by selcting the name of that array (.tarifas).
    /*That third one is worth understanding. In the browser can see the data comes wrapped in an outer 
    object with one key, tarifas:. So respuesta.data is that whole wrapper, and .tarifas opens it and takes out the list.
    The word must match the key in the JSON file exactly.*/
}