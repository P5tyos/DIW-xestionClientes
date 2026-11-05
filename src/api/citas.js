import axios from "axios";

const API_URL = "http://localhost:3000/api";

// Obter todas as citas
export async function getCitas() {
    const res = await axios.get(`${API_URL}/citas`);
    return res.data;
}

// Gardar unha cita nova
export async function saveCita(cita) {
    const res = await axios.post(`${API_URL}/citas`, cita);
    return res.data;
}

// Modificar unha cita (polo seu _id)
export async function modifyCita(id, cita) {
    const res = await axios.put(`${API_URL}/citas/${id}`, cita);
    return res.data;
}

// Eliminar unha cita (polo seu _id)
export async function deleteCita(id) {
    const res = await axios.delete(`${API_URL}/citas/${id}`);
    return res.data;
}
