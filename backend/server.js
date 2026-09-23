import express from 'express'
import fs from 'fs'
import cors from 'cors'

//creamos la aplicación de express
const app = express()
app.use(cors())
const PORT = 3000;

//ruta de la api para obtener provincias y municipios
app.get('/api/municipios', (req, res) => {
    console.log('Petición recibida')

    //leemos el fichero Json
    const datos = fs.readFileSync(
        './backend/data/municipios.json', 
        'utf-8'
    )

//convertimos el texto JSON en un objecto JavaScript
const datosJson = JSON.parse(datos)

//enviamos los datos comorespuesta al cliente
res.json(datosJson)
})

//ponemos el servidor a escuchar en el puerto 3000
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`)
})