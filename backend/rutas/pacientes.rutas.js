import express from "express";
import Paciente from "../modelos/Paciente.js";

const router = express.Router();

//obtener todos

    //to be made


// Crear 
router.post("/", async (req, res) => {
    try {

        console.log("Datos Recibidos: ",req.body);
        const paciente = new Paciente(req.body);

        const nuevoPaciente = await Paciente.save();

        res.status(201).json(nuevoPaciente);
    } catch (error) {
         
        console.error("ERROR AL CREAR PACIENTE",error);
        res.status(500).json({
            mensaje: "Error al crear el paciente"
        });
    };
});
export default router;