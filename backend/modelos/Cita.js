
import { Double } from "mongodb";
import mongoose from "mongoose";

const CitaSchema = new mongoose.Schema(
    {
        pacienteDNI: {
            type: String,
            required: true
        },

        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },
        fecha: { type: String, required: true },
        hora: { type: String, required: true },
        motivo: { type: String, required: true },
        diagnostico: {type: String,default: "" },
        tratamiento: {type: String,default: "" },
        tarifa: {type: Double,},

        estado: {
            type: String,
            default: "pendente"
        }
    },
    {
        collection: "citas"
    }
);

export default mongoose.model("Cita", CitaSchema);