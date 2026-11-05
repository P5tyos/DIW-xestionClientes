import express from "express";
import Cita from "../modelos/Cita.js";
import Paciente from "../modelos/Paciente.js";

const router = express.Router();

// Obter todas as citas (populate cambia o doctorId polos datos completos do doctor)
router.get("/", async (req, res) => {
    try {
        const citas = await Cita.find().populate("doctorId");
        res.json(citas);
    } catch (error) {
        console.error("ERROR AL OBTENER CITAS", error);
        res.status(500).json({ mensaje: "Error al obtener las citas" });
    }
});

// Crear
router.post("/", async (req, res) => {
    try {
        // comprobamos que existe un paciente con ese DNI
        const paciente = await Paciente.findOne({ dnipac: req.body.dnipac });
        if (!paciente) {
            return res.status(404).json({ mensaje: "Paciente no encontrado" });
        }
        const cita = new Cita(req.body);
        const novaCita = await cita.save();
        res.status(201).json(novaCita);
    } catch (error) {
        console.error("ERROR AL CREAR CITA", error);
        res.status(500).json({ mensaje: "Error al crear la cita" });
    }
});

// Modificar (a cita identifícase polo _id da URL)
router.put("/:id", async (req, res) => {
    try {
        delete req.body._id; // o _id non se pode cambiar
        const cita = await Cita.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!cita) {
            return res.status(404).json({ mensaje: "Cita no encontrada" });
        }
        res.json(cita);
    } catch (error) {
        console.error("ERROR AL MODIFICAR CITA", error);
        res.status(500).json({ mensaje: "Error al modificar la cita" });
    }
});

// Eliminar
router.delete("/:id", async (req, res) => {
    try {
        const cita = await Cita.findByIdAndDelete(req.params.id);
        if (!cita) {
            return res.status(404).json({ mensaje: "Cita no encontrada" });
        }
        res.json({ mensaje: "Cita eliminada" });
    } catch (error) {
        console.error("ERROR AL ELIMINAR CITA", error);
        res.status(500).json({ mensaje: "Error al eliminar la cita" });
    }
});

export default router;
