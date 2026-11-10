<template>
  <div class="xestion-citas">
    <h3>📅 Xestión de citas</h3>
    <form @submit.prevent="guardarCita">
      <!-- fila 1: ID da cita, DNI do paciente, nome do doctor, ID do doctor e 🧹 (ningún se escribe) -->
      <div class="fila">
        <div class="campo campo-id">
          <label for="id">ID cita:</label>
          <!-- o _id que xera MongoDB: non se edita -->
          <input id="id" v-model="novaCita._id" type="text" disabled class="centrado" />
        </div>
        <!-- DNI e ID non se escriben: son ligazóns que abren Pacientes / Doctores, onde o seleccionado aparece cargado
             no formulario (alí se escolle ou se cambia). Sen ninguén seleccionado mostran "—".
             Unha <label for> non pode apuntar a unha ligazón, por iso a etiqueta vai con aria-labelledby -->
        <div class="campo campo-dni">
          <span id="etiqueta-paciente" class="etiqueta">DNI paciente:<span class="obrigatorio" aria-hidden="true">*</span></span>
          <RouterLink
            to="/xestion-pacientes"
            class="campo-ligazon centrado"
            aria-labelledby="etiqueta-paciente"
            :title="pacienteStore.dnipac ? `Abrir en Pacientes (${pacienteStore.nomepac} ${pacienteStore.apelpac})` : 'Seleccionar un paciente en Pacientes'"
          >
            {{ pacienteStore.dnipac || "—" }}
          </RouterLink>
        </div>
        <div class="campo campo-nome-doctor">
          <label for="nome-doctor">Doctor:</label>
          <!-- nome do doctor seleccionado (store), antes do seu ID; só se mostra, non se edita -->
          <input
            id="nome-doctor"
            :value="doctorStore._id ? `${doctorStore.nomedoc} ${doctorStore.apeldoc}` : ''"
            type="text"
            placeholder="—"
            disabled
          />
        </div>
        <div class="campo campo-doctor">
          <span id="etiqueta-doctor" class="etiqueta">ID doctor:<span class="obrigatorio" aria-hidden="true">*</span></span>
          <RouterLink
            to="/xestion-doctores"
            class="campo-ligazon centrado"
            aria-labelledby="etiqueta-doctor"
            :title="doctorStore._id ? `Abrir en Doctores (${doctorStore.nomedoc} ${doctorStore.apeldoc})` : 'Seleccionar un doctor en Doctores'"
          >
            {{ doctorStore._id || "—" }}
          </RouterLink>
        </div>
        <div class="campo campo-limpar">
          <!-- 🧹 baleira o formulario e deselecciona paciente e doctor -->
          <button type="button" title="Limpar formulario" aria-label="Limpar formulario" @click="limpiarFormCita">🧹</button>
        </div>
      </div>
      <!-- fila 2: data, hora, motivo e estado -->
      <div class="fila">
        <div class="campo campo-fixo">
          <label for="data">Data:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="data" v-model="novaCita.fecha" type="date" required class="centrado" />
        </div>
        <div class="campo campo-fixo">
          <label for="hora">Hora:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="hora" v-model="novaCita.hora" type="time" required class="centrado" />
        </div>
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
      <!-- fila 3: observacións (texto longo) -->
      <div class="fila">
        <div class="campo campo-observacions">
          <label for="observacions">Observacións:</label>
          <textarea id="observacions" v-model="novaCita.observacions" rows="3"></textarea>
        </div>
      </div>
      <div class="fila fila-gardar">
        <!-- un botón disabled non recibe eventos do rato: a axuda (motivoNonGardar) móstraa o span que o envolve -->
        <div class="botons-gardar">
          <span class="axuda-gardar" :data-axuda="motivoNonGardar">
            <button type="submit" class="btn-guardar" :disabled="motivoNonGardar !== ''">Gardar</button>
          </span>
          <!-- Limpiar ao lado de Gardar (onde xa está a man); fai o mesmo que 🧹 -->
          <button type="button" class="btn-limpar" @click="limpiarFormCita">Limpiar</button>
        </div>
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

// datos do formulario. Paciente e doctor NON se copian aquí: lense sempre en directo dos stores
// (así a páxina mostra sempre quen está seleccionado agora, non quen o estaba ao abrila)
const novaCita = reactive({
  fecha: "",
  hora: "",
  motivo: "",
  estado: "pendente",
  observacions: "",
});

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
  if (!pacienteStore.dnipac) falta.push("paciente (selecciónao en Pacientes)");
  if (!doctorStore._id) falta.push("doctor (selecciónao en Doctores)");
  if (!novaCita.fecha) falta.push("Data");
  if (!novaCita.hora) falta.push("Hora");
  if (novaCita.motivo.trim() === "") falta.push("Motivo");
  return falta.length ? "Para gardar falta: " + falta.join(", ") : "";
});

/// Zona de ciclo de vida

// ao abrir a páxina: carga as citas (paciente e doctor lense directamente dos stores)
onMounted(async () => {
  await cargarDatos();
});

/// Zona de métodos ou funcións

// botón Gardar: garda a cita nova para o paciente e doctor seleccionados
async function guardarCita() {
  if (motivoNonGardar.value !== "") {
    return; // (por se se preme Enter cun dato sen cubrir)
  }
  gardando.value = true;
  try {
    // a cita enviase cos datos do formulario + o paciente e o doctor seleccionados nese momento
    await saveCita({ ...novaCita, dnipac: pacienteStore.dnipac, doctorId: doctorStore._id });
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

/* fila 1 (catro campos fixos + 🧹): se non cabe nunha liña pasa á seguinte en vez de saír do formulario
   (provisional, ata estilar a páxina con Tailwind) */
form > .fila:first-child {
  flex-wrap: wrap;
}

/* label e campo na mesma liña; os campos de texto repártense o espazo */
.campo {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.campo label,
.campo .etiqueta {
  min-width: 80px;
  font-weight: 500;
}

/* DNI e ID do doctor: parecen un campo, pero son ligazóns (subliñado, cursor de man, resaltado ao pasar o rato) */
.campo-ligazon {
  display: block;
  padding: 0.5rem;
  border: 1px solid #767676;
  border-radius: 6px;
  background-color: #fafafa;
  color: var(--accent);
  text-decoration: underline;
  white-space: nowrap;
  box-sizing: border-box;
}

.campo-ligazon:hover {
  background-color: var(--accent-soft);
}

.campo-dni .campo-ligazon {
  width: 9em;
}

.campo-nome-doctor input {
  flex: none;
  width: 12em;
}

.campo-doctor .campo-ligazon {
  width: 16em;
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
.campo-id,
.campo-dni,
.campo-nome-doctor,
.campo-doctor,
.campo-limpar {
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

/* os dous _id de MongoDB (24 caracteres) en letra un pouco máis pequena, para que a fila 1 caiba enteira;
   o padding vertical maior compensa a letra pequena e mantén a mesma altura que os outros campos */
.campo-id input,
.campo-doctor .campo-ligazon {
  font-size: 0.8rem;
  padding-top: 0.7rem;
  padding-bottom: 0.7rem;
}

/* a label "ID:" sen o ancho mínimo das outras (vai despois de .campo label) */
.campo-id label,
.campo-dni .etiqueta,
.campo-doctor .etiqueta {
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

/* Gardar e Limpiar na mesma liña */
.botons-gardar {
  display: flex;
  gap: 1rem;
}

/* Limpiar: botón secundario (borde verde, fondo branco) para que non se confunda con Gardar */
.btn-limpar {
  background-color: white;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 0.4rem 1.5rem;
  cursor: pointer;
}

.btn-limpar:hover {
  background-color: var(--accent-soft);
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
