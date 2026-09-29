import axios from "axios"

const API_URL = "http://localhost:3000/api"

export async function savePaciente(paciente){
    const res = await axios.post(`${API_URL}/pacientes`, paciente);
    return res.data;
    }

export async function optenerPacientes() {
    const res = await axios.get(API_URL);
    return res.data;
}