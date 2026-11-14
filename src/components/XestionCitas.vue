<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/singleline-html-element-content-newline -->
<!-- eslint-disable vue/attributes-order -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <!-- rounded-t-none: as esquinas de arriba rectas, para que o panel quede pegado ao menú sen oco -->
  <TarxetaPanel etiqueta="div" class="w-full rounded-t-none text-left">
    <TituloSeccion><CalendarDays class="size-5" aria-hidden="true" /> Xestión de citas</TituloSeccion>

    <form class="mb-8 flex flex-col gap-4" @submit.prevent="guardarCita">
      <!-- fila 1: ID da cita, DNI do paciente, nome do doctor, ID do doctor e 🧹 (ningún se escribe).
           ID cita, DNI e ID doctor co mesmo ancho (md:w-60, o que precisan os _id de 24 caracteres).
           No móbil, un por fila; desde md en liña, co 🧹 aliñado abaixo cos campos -->
      <div class="flex flex-col gap-4 md:flex-row md:items-end">
        <CampoFormulario id="id" etiqueta="ID cita" class="md:w-60" v-slot="{ clases }">
          <!-- o _id que xera MongoDB: non se edita -->
          <input id="id" v-model="novaCita._id" type="text" disabled :class="[clases, 'text-center']" />
        </CampoFormulario>

        <!-- DNI e ID do doctor non se escriben: son ligazóns que abren Pacientes / Doctores, onde o seleccionado aparece
             cargado no formulario (alí se escolle ou se cambia). Sen ninguén seleccionado mostran "—".
             Parecen campos, pero co texto verde subliñado de ligazón. Unha <label for> non pode apuntar a unha ligazón,
             por iso a etiqueta é un <span> unido con aria-labelledby -->
        <div class="flex flex-col gap-1 md:w-60">
          <span id="etiqueta-paciente" class="text-sm font-semibold text-titulo">
            DNI paciente<span class="ml-0.5 text-perigo" aria-hidden="true">*</span>
          </span>
          <RouterLink
            to="/xestion-pacientes"
            class="flex h-11 items-center justify-center rounded-md border border-borde bg-white px-3 text-acento underline hover:bg-acento-suave md:h-10"
            aria-labelledby="etiqueta-paciente"
            :title="pacienteStore.dnipac ? `Abrir en Pacientes (${pacienteStore.nomepac} ${pacienteStore.apelpac})` : 'Seleccionar un paciente en Pacientes'"
          >
            {{ pacienteStore.dnipac || "—" }}
          </RouterLink>
        </div>

        <CampoFormulario id="nome-doctor" etiqueta="Doctor" class="md:flex-1" v-slot="{ clases }">
          <!-- nome do doctor seleccionado (store), antes do seu ID; só se mostra, non se edita -->
          <input
            id="nome-doctor"
            :value="doctorStore._id ? `${doctorStore.nomedoc} ${doctorStore.apeldoc}` : ''"
            type="text"
            placeholder="—"
            disabled
            :class="clases"
          />
        </CampoFormulario>

        <div class="flex flex-col gap-1 md:w-60">
          <span id="etiqueta-doctor" class="text-sm font-semibold text-titulo">
            ID doctor<span class="ml-0.5 text-perigo" aria-hidden="true">*</span>
          </span>
          <RouterLink
            to="/xestion-doctores"
            class="flex h-11 items-center justify-center rounded-md border border-borde bg-white px-3 text-acento underline hover:bg-acento-suave md:h-10 text-sm"
            aria-labelledby="etiqueta-doctor"
            :title="doctorStore._id ? `Abrir en Doctores (${doctorStore.nomedoc} ${doctorStore.apeldoc})` : 'Seleccionar un doctor en Doctores'"
          >
            {{ doctorStore._id || "—" }}
          </RouterLink>
        </div>

        <!-- 🧹 baleira o formulario e deselecciona paciente e doctor -->
        <BotonAccion variante="icona" class="shrink-0 self-end" title="Limpar formulario" aria-label="Limpar formulario" @click="limpiarFormCita">
          <BrushCleaning class="size-5" aria-hidden="true" />
        </BotonAccion>
      </div>

      <!-- fila 2: data, hora, motivo e estado -->
      <div class="flex flex-col gap-4 md:flex-row">
        <CampoFormulario id="data" etiqueta="Data" obrigatorio class="md:w-44" v-slot="{ clases }">
          <input id="data" v-model="novaCita.fecha" type="date" required :class="[clases, 'text-center']" />
        </CampoFormulario>
        <CampoFormulario id="hora" etiqueta="Hora" obrigatorio class="md:w-32" v-slot="{ clases }">
          <input id="hora" v-model="novaCita.hora" type="time" required :class="[clases, 'text-center']" />
        </CampoFormulario>
        <CampoFormulario id="motivo" etiqueta="Motivo" obrigatorio class="md:flex-1" v-slot="{ clases }">
          <input id="motivo" v-model="novaCita.motivo" type="text" required :class="clases" />
        </CampoFormulario>
        <CampoFormulario id="estado" etiqueta="Estado" class="md:w-40" v-slot="{ clases }">
          <select id="estado" v-model="novaCita.estado" :class="clases">
            <option value="pendente">Pendente</option>
            <option value="realizada">Realizada</option>
            <option value="cancelada">Cancelada</option>
            <option value="borrada">Borrada</option>  <!-- filter step1 added new option -->
          </select>
        </CampoFormulario>
      </div>

      <!-- fila 3: observacións (texto longo). O textarea leva as súas propias clases: as de CampoFormulario
           teñen altura fixa (h-10/h-11) e un textarea ten que crecer coas filas -->
      <CampoFormulario id="observacions" etiqueta="Observacións">
        <textarea
          id="observacions"
          v-model="novaCita.observacions"
          rows="3"
          class="w-full resize-y rounded-md border border-borde bg-white px-3 py-2 text-base focus:border-acento focus:ring-3 focus:ring-acento-claro focus:outline-none"
        ></textarea>
      </CampoFormulario>

      <!-- botóns, centrados: no móbil un debaixo do outro a todo o ancho; desde md en liña e do mesmo ancho (md:w-27) -->
      <div class="flex flex-col items-center gap-4">
        <div class="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
          <!-- axuda de Gardar ("Para gardar falta…"): tooltip co rato (pointer-fine + group-hover);
               sen rato, o texto vese debaixo dos botóns. Os lectores de pantalla len o de abaixo (aria-describedby) -->
          <span class="group relative flex md:inline-flex" :class="motivoNonGardar ? 'cursor-not-allowed' : ''">
            <BotonAccion
              tipo="submit"
              class="w-full disabled:pointer-events-none md:w-27"
              :disabled="motivoNonGardar !== ''"
              :aria-describedby="motivoNonGardar ? 'axuda-gardar' : undefined"
            >
              Gardar
            </BotonAccion>
            <span
              v-if="motivoNonGardar"
              class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-md bg-titulo px-3 py-2 text-sm whitespace-nowrap text-white pointer-fine:group-hover:block"
              aria-hidden="true"
            >
              {{ motivoNonGardar }}
            </span>
          </span>
          <!-- Limpiar ao lado de Gardar (onde xa está a man); fai o mesmo que 🧹 -->
          <BotonAccion variante="secundario" class="w-full md:w-27" @click="limpiarFormCita">Limpiar</BotonAccion>
        </div>
        <!-- texto da axuda debaixo dos botóns: visible por defecto e oculto só cando hai rato (pointer-fine) -->
        <p v-if="motivoNonGardar" id="axuda-gardar" class="text-sm pointer-fine:hidden">{{ motivoNonGardar }}</p>
      </div>
    </form>

    <TituloSeccion><ClipboardList class="size-5" aria-hidden="true" /> Listaxe de citas</TituloSeccion>
    <!-- só as citas do paciente seleccionado -->
    <p v-if="!pacienteStore.dnipac" class="text-sm italic">
      Selecciona un paciente na páxina de Pacientes (✏️ ou 🔍) para ver as súas citas.
    </p>
    <template v-else>
      <p class="mb-2 text-sm italic">Citas de {{ pacienteStore.nomepac }} {{ pacienteStore.apelpac }} ({{ pacienteStore.dnipac }})</p>
     
      <label class="mb-2 flex items-center gap-2 text-sm"><input v-model="mostrarBorradas" type="checkbox" /> Mostrar as citas borradas </label> <!-- Filter Step 2.3 creates the checkbox-->
      <!-- no móbil a táboa desprázase en horizontal dentro do seu contedor (non a páxina enteira) -->
      <div v-if="citasPaciente.length > 0" class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <caption class="sr-only">Citas do paciente</caption>
          <thead class="bg-acento-suave text-titulo">
            <tr>
              <th v-for="cabeceira in cabeceiras" :key="cabeceira" scope="col" class="border border-acento-claro p-3 font-semibold">
                {{ cabeceira }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in citasPaciente" :key="c._id" class="bg-white">
              <!-- datas e horas centradas; o texto á esquerda -->
              <td class="border border-acento-claro p-3 text-center">{{ formatearData(c.fecha) }}</td>
              <td class="border border-acento-claro p-3 text-center">{{ c.hora }}</td>
              <!-- a cita só garda o DNI; o nome vén do paciente seleccionado (todas as filas son súas) -->
              <td class="border border-acento-claro p-3">{{ pacienteStore.nomepac }} {{ pacienteStore.apelpac }}</td>
              <!-- doctorId vén "populado" do backend: é o doctor enteiro, non só o _id -->
              <td class="border border-acento-claro p-3">{{ c.doctorId ? `${c.doctorId.nomedoc} ${c.doctorId.apeldoc}` : "(doctor eliminado)" }}</td>
              <td class="border border-acento-claro p-3">{{ c.doctorId?.espedoc }}</td>
              <td class="border border-acento-claro p-3">{{ c.motivo }}</td>
              <td class="border border-acento-claro p-3">{{ c.estado }}</td>
              <td class="border border-acento-claro p-3">{{ c.observacions }}</td>
              <td class="border border-acento-claro p-3">
                <!-- ✏️ carga a cita no formulario para editala (as citas non se borran: gárdanse sempre, só cambia o estado) -->
                <div class="flex justify-center">
                  <BotonAccion variante="icona" title="Editar" :aria-label="`Editar a cita do ${formatearData(c.fecha)} ás ${c.hora}`" @click="editarCita(c)">
                    <Pencil class="size-4" aria-hidden="true" />
                  </BotonAccion>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else>Este paciente aínda non ten citas.</p>
    </template>
  </TarxetaPanel>
</template>

<script setup>

/// Zona de declaracións

import { ref, reactive, computed, onMounted } from "vue";
import { getCitas, saveCita, modifyCita } from "../api/citas.js";
import { usePacienteStore } from "../store/pacienteStore.js";
import { useDoctorStore } from "../store/doctorStore.js";
import { alertaExito, alertaError, alertaConfirmacion, alertaInfo } from "../utils/alertas.js";
import { CalendarDays, ClipboardList, BrushCleaning, Pencil } from "lucide-vue-next";
import TarxetaPanel from "./comun/TarxetaPanel.vue";
import TituloSeccion from "./comun/TituloSeccion.vue";
import CampoFormulario from "./comun/CampoFormulario.vue";
import BotonAccion from "./comun/BotonAccion.vue";

// cabeceiras da táboa (así o <th> escríbese unha soa vez)
const cabeceiras = ["Data", "Hora", "Paciente", "Doctor", "Especialidade", "Motivo", "Estado", "Observacións", "Accións"];

// paciente e doctor seleccionados nas súas páxinas (Pinia): de aquí sae para quen e con quen é a cita
const pacienteStore = usePacienteStore();
const doctorStore = useDoctorStore();

const citas = ref([]); // todas as citas da BD (na táboa só se ven as do paciente seleccionado)
const gardando = ref(false); // bloquea Gardar mentres se envía a cita
const editando = ref(false); // true cando hai unha cita cargada (✏️): Gardar modifícaa en vez de crear outra
const mostrarBorradas = ref(false); // filtrar step 2.1 variable for the checkbox =>  true = a táboa tamén mostra as citas borradas 

// campos da cita que se editan no formulario
const CAMPOS = ["fecha", "hora", "motivo", "estado", "observacions"];
// copia dos datos da cita tal como se cargou (✏️), para saber se hai cambios sen gardar; null se é unha cita nova
const copiaOrixinal = ref(null);

// datos do formulario. Paciente e doctor NON se copian aquí: lense sempre en directo dos stores
// (así a páxina mostra sempre quen está seleccionado agora, non quen o estaba ao abrila).
// Ao editar unha cita engádeselle o seu _id (vese en "ID cita" e úsase para modificala)
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
    .filter((c) => mostrarBorradas.value || c.estado !== "borrada")  // filter step 2.2 goes through a list and keeps only the items that pass a test. now incl. the new variable too
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

// botón Gardar: modifica a cita cargada (pedindo confirmación) ou garda unha nova para o paciente e doctor seleccionados
async function guardarCita() {
  if (motivoNonGardar.value !== "") {
    return; // (por se se preme Enter cun dato sen cubrir)
  }
  if (editando.value) {
    // se non se cambiou nada non hai nada que gardar
    if (!haiCambiosSenGardar()) {
      alertaInfo("Non hai cambios que gardar.");
      return;
    }
    // pedimos confirmación; ao confirmar xa non se mostra mensaxe de éxito (o cambio vese na táboa)
    const confirmacion = await alertaConfirmacion(`Seguro que queres gardar os cambios da cita do ${formatearData(novaCita.fecha)} ás ${novaCita.hora}?`);
    if (!confirmacion.isConfirmed) {
      return;
    }
  }
  // datos que se envían: os campos da cita + o paciente e o doctor seleccionados (sen o _id: vai na URL ao modificar)
  const datos = { ...datosFormulario(), dnipac: pacienteStore.dnipac, doctorId: doctorStore._id };
  gardando.value = true;
  try {
    if (editando.value) {
      await modifyCita(novaCita._id, datos);
    } else {
      await saveCita(datos);
      alertaExito("Cita gardada correctamente."); // crear non pide confirmación, así que si se avisa
    }
    // baleiramos só os datos da cita: paciente e doctor seguen seleccionados para poder dar outra cita
    baleirarCita();
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
  await cargarDatos(); // a cita nova ou modificada aparece na táboa
}

// botón ✏️: carga a cita no formulario para editala. O seu doctor pasa a ser o doctor seleccionado,
// así o formulario mostra (e garda) o doctor correcto. Se hai cambios sen gardar, pregunta antes
async function editarCita(cita) {
  if (!(await confirmarDescartar())) {
    return;
  }
  baleirarCita();
  CAMPOS.forEach((campo) => {
    novaCita[campo] = cita[campo] ?? "";
  });
  novaCita._id = cita._id;
  if (cita.doctorId) {
    doctorStore.seleccionarDoctor(cita.doctorId); // doctorId vén "populado": é o doctor enteiro
  } else {
    doctorStore.limpiarDoctor(); // o doctor xa non existe: haberá que escoller outro para gardar
  }
  editando.value = true;
  copiaOrixinal.value = fotoFormulario(); // para saber despois se se cambiou algo
}

// botóns 🧹 e Limpiar: baleira o formulario e deselecciona paciente e doctor (punto 8).
// Se hai datos sen gardar, pregunta antes
async function limpiarFormCita() {
  if (!(await confirmarDescartar())) {
    return;
  }
  baleirarCita();
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

// baleira os datos da cita e sae do modo edición (non toca o paciente nin o doctor seleccionados)
function baleirarCita() {
  CAMPOS.forEach((campo) => {
    novaCita[campo] = campo === "estado" ? "pendente" : "";
  });
  delete novaCita._id; // un _id baleiro faría fallar a seguinte cita nova
  editando.value = false;
  copiaOrixinal.value = null;
}

// os campos da cita do formulario, sen o _id
function datosFormulario() {
  return Object.fromEntries(CAMPOS.map((campo) => [campo, novaCita[campo]]));
}

// "foto" da cita do formulario (e do seu doctor) como texto, para comparala coa cita cargada
function fotoFormulario() {
  return JSON.stringify({ ...datosFormulario(), doctorId: doctorStore._id });
}

// hai datos no formulario que se perderían?
// - cita cargada (✏️): se algo cambiou desde que se cargou
// - cita nova: se se escribiu algo (ou se cambiou o estado)
function haiCambiosSenGardar() {
  if (copiaOrixinal.value !== null) {
    return fotoFormulario() !== copiaOrixinal.value;
  }
  return ["fecha", "hora", "motivo", "observacions"].some((campo) => String(novaCita[campo]).trim() !== "")
    || novaCita.estado !== "pendente";
}

// se hai datos sen gardar, pregunta se se descartan. Devolve true se se pode continuar
async function confirmarDescartar() {
  if (!haiCambiosSenGardar()) {
    return true;
  }
  const confirmacion = await alertaConfirmacion("Hai datos sen gardar que se perderán. Queres descartalos?");
  return confirmacion.isConfirmed;
}

// "2026-11-20" → "20/11/2026"
function formatearData(data) {
  return data ? data.split("-").reverse().join("/") : "";
}
/* if i had to filter in text insted of a checkbox, it would be similar. 
first add a ref variable that makes the page rework itself when value changes:
    const buscar = ref(""); // o que se escribe na caixa de busca

Then normalize the value of the input and add it to a filter:
    .filter((c) => c.motivo.toLowerCase().includes(buscar.value.toLowerCase()))
also adjust the input type: 
    <input v-model="buscar" type="text" placeholder="Buscar por motivo" />

in case of a input type="select" 
    .filter((c) => filtroEstado.value === "" || c.estado === filtroEstado.value)
 */

</script>


