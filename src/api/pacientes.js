import axios from "axios"

const API_URL = "http://localhost:3000/api"

//guardar paciente
export async function savePaciente(paciente){
    const res = await axios.post(`${API_URL}/pacientes`, paciente);
    return res.data;
    }

//cargar pacientes    
export async function getPacientes() {
    const res = await axios.get(`${API_URL}/pacientes`);
    res.data.sort((a,b)=>
        a.apelpac.localeCompare(b.apelpac, "es", {sensitivity: "base"}));
    return res.data;
}