import express from "express";
import Doctor from "../modelos/Doctor.js";

const router = express.Router();

// os doctores non teñen ningún campo único: consideramos duplicado só un doctor con TODOS os datos iguais
const datosDoctor = (body) => ({
    apeldoc: body.apeldoc,
    nomedoc: body.nomedoc,
    coledoc: body.coledoc,
    movildoc: body.movildoc,
    maildoc: body.maildoc ?? "",
    espedoc: body.espedoc,
});

//eliminar
router.delete("/:id", async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id); // busca polo _id de MongoDB (o :id da URL)
        if (!doctor) {
            return res.status(404).json({ mensaje: "Doctor no encontrado" });
        }
        res.json({ mensaje: "Doctor eliminado" });
    } catch (error) {
        console.error("ERROR AL ELIMINAR DOCTOR", error);
        res.status(500).json({
            mensaje: "Error al eliminar el doctor"
        });
    };
});


// Crear 
router.post("/", async (req, res) => {
    try {
        console.log("Datos Recibidos: ",req.body);
        // se xa hai un doctor con exactamente os mesmos datos, non o gardamos outra vez
        const doctorIgual = await Doctor.findOne(datosDoctor(req.body));
        if (doctorIgual) {
            return res.status(409).json({ mensaje: "Ya existe un doctor con los mismos datos" });
        }

        const doctor = new Doctor(req.body);
        const nuevoDoctor = await doctor.save();
        res.status(201).json(nuevoDoctor);

    } catch (error) {
        console.error("ERROR AL CREAR DOCTOR",error);
        res.status(500).json({
            mensaje: "Error al crear el doctor"
        });
    };
});

//Obtener todos
router.get("/", async (req, res) => {
    try {
        const doctores = await Doctor.find();  //es el select sql
        res.json(doctores);
    } catch (error) {
        console.error("ERROR AL OBTENER DOCTORES", error);
        res.status(500).json({ mensaje: "Error al obtener los doctores", error: error.message });    };
});

//modificar
router.put("/:id", async (req, res) => {
    try {
        // o _id non se pode modificar: o doctor identifícase polo :id da URL,
        // así que borramos o _id do body aínda que alguén o envíe
        //delete req.body.iddoc; no need if we use _id
        delete req.body._id;
        // tampouco se pode modificar un doctor para que quede igual que outro (o propio non conta: $ne = distinto de)
        const doctorIgual = await Doctor.findOne({ ...datosDoctor(req.body), _id: { $ne: req.params.id } });
        if (doctorIgual) {
            return res.status(409).json({ mensaje: "Ya existe un doctor con los mismos datos" });
        }
        const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!doctor) {
            return res.status(404).json({ mensaje: "Doctor no encontrado" });
        }
        res.json(doctor);
    } catch (error) {
        console.error("ERROR AL MODIFICAR DOCTOR", error);
        res.status(500).json({ mensaje: "Error al modificar el doctor", error: error.message });
    };
});


//Obtener doctores por especialidad
router.get("/:especialidad", async (req, res) => {
    try {
        const doctor = await Doctor.find({
            espedoc: req.params.especialidad, // o campo no modelo chámase espedoc
        });  //es el select sql
        if (!doctor) {
            return res.status(404).json({
               mensaje: "No doctor encontrado" ,
            });
        }
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ 
            mensaje: "Error al obtener doctores", error });
    };
});

export default router;