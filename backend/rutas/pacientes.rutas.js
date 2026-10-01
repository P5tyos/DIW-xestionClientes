import express from "express";
import Paciente from "../modelos/Paciente.js";

const router = express.Router();

//eliminar
router.delete("/:dni", async (req, res) => {
    try {
        const paciente = await Paciente.findOneAndDelete({ dnipac: req.params.dni });
        if (!paciente) {
            return res.status(404).json({ mensaje: "Paciente no encontrado" });
        }
        res.json({ mensaje: "Paciente eliminado" });
    } catch (error) {
        console.error("ERROR AL ELIMINAR PACIENTE", error);
        res.status(500).json({
            mensaje: "Error al crear el paciente"
        });
    };
});


// Crear 
router.post("/", async (req, res) => {
    try {
        console.log("Datos Recibidos: ",req.body);
        const paciente = new Paciente(req.body);
        const nuevoPaciente = await paciente.save();
        res.status(201).json(nuevoPaciente);
    } catch (error) {
        console.error("ERROR AL CREAR PACIENTE",error);
        res.status(500).json({
            mensaje: "Error al crear el paciente"
        });
    };
});

//Obtener todos
router.get("/", async (req, res) => {
    try {
        const pacientes = await Paciente.find();  //es el select sql
        res.json(pacientes);
    } catch (error) {
        console.error("ERROR AL OBTENER PACIENTES", error);
        res.status(500).json({ mensaje: "Error al obtener los pacientes", error: error.message });
    };
});

export default router;