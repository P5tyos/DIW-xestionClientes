<template>
  <div class="xestion-citas">
    <h3>📅 Xestión de citas</h3>
    <form @submit.prevent="guardarCita">
      <!-- fila 1: ID da cita, data e hora -->
      <div class="fila">
        <div class="campo campo-id">
          <label for="id">ID:</label>
          <!-- o _id que xera MongoDB: non se edita -->
          <input id="id" v-model="novaCita._id" type="text" disabled class="centrado" />
          <!-- 🧹 baleira o formulario e deselecciona paciente e doutor -->
          <button type="button" title="Limpar formulario" aria-label="Limpar formulario" @click="limpiarFormCita">🧹</button>
        </div>
        <div class="campo campo-fixo">
          <label for="data">Data:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="data" v-model="novaCita.fecha" type="date" required class="centrado" />
        </div>
        <div class="campo campo-fixo">
          <label for="hora">Hora:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="hora" v-model="novaCita.hora" type="time" required class="centrado" />
        </div>
      </div>
      <!-- fila 2: paciente e doctor. Non se escriben: veñen do paciente/doctor cargado nas súas páxinas (stores de Pinia) -->
      <div class="fila">
        <div class="campo">
          <label for="paciente">Paciente:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="paciente" :value="textoPaciente" type="text" disabled />
        </div>
        <div class="campo">
          <label for="doctor">Doctor:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="doctor" :value="textoDoctor" type="text" disabled />
        </div>
      </div>
      <!-- fila 3: motivo e estado -->
      <div class="fila">
        <div class="campo">
          <label for="motivo">Motivo:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="motivo" v-model="novaCita.motivo" type="text" required />
        </div>
        <div class="campo campo-fixo">
          <label for="estado">Estado:</label>
          <select id="estado" v-model="novaCita.estado">
            <option value="pendente">Pendente</option>
            <option value="realizada">Realizada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>
      <!-- fila 4: observacións (texto longo) -->
      <div class="fila">
        <div class="campo campo-observacions">
          <label for="observacions">Observacións:</label>
          <textarea id="observacions" v-model="novaCita.observacions" rows="3"></textarea>
        </div>
      </div>
      <div class="fila fila-gardar">
        <!-- un botón disabled non recibe eventos do rato: a axuda (motivoNonGardar) móstraa o span que o envolve -->
        <span class="axuda-gardar" :data-axuda="motivoNonGardar">
          <button type="submit" class="btn-guardar" :disabled="motivoNonGardar !== ''">Gardar</button>
        </span>
        <p class="nota-obrigatorio"><span aria-hidden="true">*</span> campo obrigatorio</p>
      </div>
    </form>

    <h3>📋 Listaxe de citas</h3>
    <!-- só as citas do paciente seleccionado -->
    <p v-if="!pacienteStore.dnipac" class="info-lista">
      Selecciona un paciente na páxina de Pacientes (✏️ ou 🔍) para ver as súas citas.
    </p>
    <template v-else>
      <p class="info-lista">Citas de {{ pacienteStore.nomepac }} {{ pacienteStore.apelpac }} ({{ pacienteStore.dnipac }})</p>
      <table v-if="citasPaciente.length > 0">
        <caption>Citas do paciente</caption>
        <thead>
          <tr>
            <th scope="col">Data</th>
            <th scope="col">Hora</th>
            <th scope="col">Paciente</th>
            <th scope="col">Doctor</th>
            <th scope="col">Especialidade</th>
            <th scope="col">Motivo</th>
            <th scope="col">Estado</th>
            <th scope="col">Observacións</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in citasPaciente" :key="c._id">
            <!-- datas e horas centradas; o texto á esquerda -->
            <td class="centrado">{{ formatearData(c.fecha) }}</td>
            <td class="centrado">{{ c.hora }}</td>
            <!-- a cita só garda o DNI; o nome vén do paciente seleccionado (todas as filas son súas) -->
            <td>{{ pacienteStore.nomepac }} {{ pacienteStore.apelpac }}</td>
            <!-- doctorId vén "populado" do backend: é o doctor enteiro, non só o _id -->
            <td>{{ c.doctorId ? `${c.doctorId.nomedoc} ${c.doctorId.apeldoc}` : "(doctor eliminado)" }}</td>
            <td>{{ c.doctorId?.espedoc }}</td>
            <td>{{ c.motivo }}</td>
            <td>{{ c.estado }}</td>
            <td>{{ c.observacions }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else>Este paciente aínda non ten citas.</p>
    </template>
  </div>
</template>

<script setup>

/// Zona de declaracións

import { ref, reactive, computed, onMounted } from "vue";
import { getCitas, saveCita } from "../api/citas.js";
import { usePacienteStore } from "../store/pacienteStore.js";
import { useDoctorStore } from "../store/doctorStore.js";
import { alertaExito, alertaError } from "../utils/alertas.js";

// paciente e doctor seleccionados nas súas páxinas (Pinia): de aquí sae para quen e con quen é a cita
const pacienteStore = usePacienteStore();
const doctorStore = useDoctorStore();

const citas = ref([]); // todas as citas da BD (na táboa só se ven as do paciente seleccionado)
const gardando = ref(false); // bloquea Gardar mentres se envía a cita

// datos do formulario (os mesmos campos que o modelo Cita do backend)
const novaCita = reactive({
  fecha: "",
  hora: "",
  dnipac: "",
  doctorId: "",
  motivo: "",
  estado: "pendente",
  observacions: "",
});

// texto dos campos bloqueados de paciente e doctor (mostran quen está seleccionado)
const textoPaciente = computed(() =>
  pacienteStore.dnipac
    ? `${pacienteStore.dnipac} · ${pacienteStore.nomepac} ${pacienteStore.apelpac}`
    : "Ningún: selecciona un en Pacientes"
);
const textoDoctor = computed(() =>
  doctorStore._id
    ? `${doctorStore.nomedoc} ${doctorStore.apeldoc} · ${doctorStore.espedoc}`
    : "Ningún: selecciona un en Doctores"
);

// citas do paciente seleccionado, ordenadas por data e hora (punto 2: non se ven as doutros pacientes)
const citasPaciente = computed(() =>
  citas.value
    .filter((c) => c.dnipac === pacienteStore.dnipac)
    .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
);

// por que non se pode gardar aínda ("" se xa se pode); móstrase como axuda sobre o botón
const motivoNonGardar = computed(() => {
  if (gardando.value) return "Gardando…";
  const falta = [];
  if (!novaCita.dnipac) falta.push("paciente (selecciónao en Pacientes)");
  if (!novaCita.doctorId) falta.push("doctor (selecciónao en Doctores)");
  if (!novaCita.fecha) falta.push("Data");
  if (!novaCita.hora) falta.push("Hora");
  if (novaCita.motivo.trim() === "") falta.push("Motivo");
  return falta.length ? "Para gardar falta: " + falta.join(", ") : "";
});

/// Zona de ciclo de vida

// ao abrir a páxina: carga as citas e enche paciente e doctor co que hai nos stores
onMounted(async () => {
  await cargarDatos();
  novaCita.dnipac = pacienteStore.dnipac ?? "";
  novaCita.doctorId = doctorStore._id ?? "";
});

/// Zona de métodos ou funcións

// botón Gardar: garda a cita nova para o paciente e doctor seleccionados
async function guardarCita() {
  if (motivoNonGardar.value !== "") {
    return; // (por se se preme Enter cun dato sen cubrir)
  }
  gardando.value = true;
  try {
    await saveCita({ ...novaCita });
    alertaExito("Cita gardada correctamente.");
    // baleiramos só os datos da cita: paciente e doctor seguen seleccionados para poder dar outra cita
    novaCita.fecha = "";
    novaCita.hora = "";
    novaCita.motivo = "";
    novaCita.observacions = "";
    novaCita.estado = "pendente";
  } catch (error) {
    console.error("Erro ao gardar a cita:", error);
    if (error.response?.status === 404) {
      // o backend comproba que o paciente existe (pode que se borrase despois de seleccionalo)
      alertaError("Non existe ningún paciente con ese DNI.");
    } else {
      alertaError("Erro ao gardar a cita. Contacte co administrador do sistema.");
    }
    return;
  } finally {
    gardando.value = false;
  }
  await cargarDatos(); // a cita nova aparece na táboa
}

// botón 🧹: baleira o formulario e deselecciona paciente e doctor (punto 8)
function limpiarFormCita() {
  novaCita.fecha = "";
  novaCita.hora = "";
  novaCita.motivo = "";
  novaCita.observacions = "";
  novaCita.estado = "pendente";
  novaCita.dnipac = "";
  novaCita.doctorId = "";
  pacienteStore.limpiarPaciente();
  doctorStore.limpiarDoctor();
}

// Zona de funcións auxiliares

// carga todas as citas da BD; se falla avisa en vez de deixar a táboa baleira sen máis
async function cargarDatos() {
  try {
    citas.value = await getCitas();
  } catch (error) {
    console.error("Erro ao cargar as citas:", error);
    alertaError("Non se puido cargar a lista de citas. Contacte co administrador do sistema.");
  }
}

// "2026-11-20" → "20/11/2026"
function formatearData(data) {
  return data ? data.split("-").reverse().join("/") : "";
}
</script>

<style scoped>
.xestion-citas {
  width: 100%;
  text-align: left; /* #app centra todo; aquí o texto vai á esquerda */
  background: white;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

h3 {
  margin-bottom: 1rem;
  font-weight: 600;
  background-color: var(--heading-bg);
  color: var(--text-h);
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.fila {
  display: flex;
  gap: 1rem;
}

/* label e campo na mesma liña; os campos de texto repártense o espazo */
.campo {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.campo label {
  min-width: 80px;
  font-weight: 500;
}

.campo input,
.campo select,
.campo textarea {
  flex: 1;
  min-width: 0;
  padding: 0.5rem;
  border: 1px solid #767676;
  border-radius: 6px;
  box-sizing: border-box;
  font: inherit;
}

/* campos de formato fixo (data, hora, estado, DNI, ID): só o que miden */
.campo-fixo,
.campo-id {
  flex: 0 0 auto;
}

.campo-fixo input,
.campo-fixo select {
  flex: none;
}

.campo-id input {
  flex: none;
  width: 15em;
}

/* a label "ID:" sen o ancho mínimo das outras (vai despois de .campo label) */
.campo-id label {
  min-width: auto;
}

/* botón 🧹: cadrado (alto = ancho), igual que en Pacientes e Doctores */
.campo button {
  aspect-ratio: 1;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* observacións: a label enriba do texto */
.campo-observacions {
  align-items: flex-start;
}

.campo-observacions textarea {
  resize: vertical;
}

.obrigatorio {
  color: #b00020;
  margin-left: 0.15rem;
}

.fila-gardar {
  position: relative;
  flex-direction: column;
  align-items: center;
}

.btn-guardar {
  background-color: var(--accent);
  color: white;
  border: none;
  padding: 0.4rem 1.5rem;
  cursor: pointer;
}

.btn-guardar:hover:enabled {
  background-color: var(--accent-dark);
}

.btn-guardar:disabled {
  background-color: #e0e0e0;
  color: #999;
  opacity: 0.7;
  pointer-events: none; /* o rato "atravesa" o botón desactivado e chega ao span, que mostra a axuda */
}

/* axuda de Gardar: caixa escura enriba do botón, só cando hai motivo (data-axuda non baleiro) */
.axuda-gardar {
  position: relative;
  display: inline-block;
}

.axuda-gardar:not([data-axuda=""]) {
  cursor: not-allowed;
}

.axuda-gardar:not([data-axuda=""]):hover::after {
  content: attr(data-axuda);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  padding: 0.4rem 0.7rem;
  border-radius: 4px;
  background-color: var(--text-h);
  color: white;
  font-size: 0.8rem;
  white-space: nowrap;
}

/* ---------- listaxe ---------- */
.info-lista {
  margin-bottom: 0.5rem;
  font-style: italic;
}

table {
  width: 100%;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  border: 1px solid var(--border);
}

th,
td {
  border: 1px solid var(--border);
  padding: 0.7rem;
}

th {
  background-color: var(--accent-soft);
}

/* o caption só o len os lectores de pantalla (xa hai un título visible enriba) */
caption {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.nota-obrigatorio {
  position: absolute;
  right: 0;
  bottom: 0;
  margin: 0;
  font-size: 0.7rem;
}

@media (max-width: 768px) {
  .xestion-citas {
    padding: 1rem;
  }

  .fila {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
