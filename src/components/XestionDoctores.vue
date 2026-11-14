<template>
  <!-- rounded-t-none: as esquinas de arriba rectas, para que o panel quede pegado ao menú sen oco; as de abaixo seguen redondeadas -->
  <TarxetaPanel etiqueta="div" class="w-full rounded-t-none text-left">
    <TituloSeccion><Stethoscope class="size-5" aria-hidden="true" /> Xestión de doctores</TituloSeccion>

    <form class="mb-8 flex flex-col gap-4" @submit.prevent="guardarDoctor">
      <!-- validación: o erro aparece ao saír do campo (@blur); mentres hai erro, revalídase con cada tecla (@input)
           e desaparece en canto o valor é correcto. O valor escrito nunca se borra -->

      <!-- fila 1: ID (+ 🧹), apelido e nome. No móbil, un campo por fila; desde md, en liña -->
      <div class="flex flex-col gap-4 md:flex-row">
        <CampoFormulario id="id" etiqueta="ID" class="md:w-auto" v-slot="{ clases }">
          <!-- o ID é o _id que xera MongoDB: baleiro nun doctor novo, vese ao cargar un (✏️) e non se pode editar -->
          <input id="id" v-model="novoDoctor._id" type="text" disabled :class="[clases, 'text-center md:w-60']" />
          <BotonAccion variante="icona" class="shrink-0" title="Limpar formulario" aria-label="Limpar formulario" @click="limparConConfirmacion">
            <BrushCleaning class="size-5" aria-hidden="true" />
          </BotonAccion>
        </CampoFormulario>
        <CampoFormulario id="apelido" etiqueta="Apelido" obrigatorio class="md:flex-1" v-slot="{ clases }">
          <input id="apelido" v-model="novoDoctor.apeldoc" type="text" required autocomplete="family-name" :class="clases"
            @blur="novoDoctor.apeldoc = formatearNome(novoDoctor.apeldoc)" />
        </CampoFormulario>
        <CampoFormulario id="nome" etiqueta="Nome" obrigatorio class="md:flex-1" v-slot="{ clases }">
          <input id="nome" v-model="novoDoctor.nomedoc" type="text" required autocomplete="given-name" :class="clases"
            @blur="novoDoctor.nomedoc = formatearNome(novoDoctor.nomedoc)" />
        </CampoFormulario>
      </div>

      <!-- fila 2: teléfono, correo, especialidade e colexiado (á dereita) -->
      <div class="flex flex-col gap-4 md:flex-row">
        <CampoFormulario id="telefono" etiqueta="Telefono" obrigatorio :erro="telefonoIncorrecto" class="md:w-44" v-slot="{ clases }">
          <input
            id="telefono"
            v-model="novoDoctor.movildoc"
            type="tel"
            inputmode="numeric"
            required
            maxlength="9"
            autocomplete="tel"
            :class="[clases, 'text-center']"
            :aria-invalid="telefonoIncorrecto"
            aria-describedby="telefono-erro"
            @blur="validarTelefono"
            @input="telefonoIncorrecto && validarTelefono()"
            @keydown.tab="cargarSeUnico"
          />
        </CampoFormulario>
        <CampoFormulario id="correo" etiqueta="Correo" :erro="correoInvalido" class="md:flex-1" v-slot="{ clases }">
          <input
            id="correo"
            v-model="novoDoctor.maildoc"
            type="email"
            autocomplete="email"
            :class="clases"
            :aria-invalid="correoInvalido"
            aria-describedby="correo-erro"
            @blur="validarCorreo"
            @input="correoInvalido && validarCorreo()"
          />
        </CampoFormulario>
        <!-- especialidade: ancho fixo para a máis longa ("Medicina Preventiva y Salud Pública") -->
        <CampoFormulario id="especialidade" etiqueta="Especialidade" obrigatorio class="md:w-80" v-slot="{ clases }">
          <select id="especialidade" v-model="novoDoctor.espedoc" required :class="clases">
            <option value="">Selecciona unha especialidade</option>
            <option v-for="especialidade in especialidades" :key="especialidade.id" :value="especialidade.nm">
              {{ especialidade.nm }}
            </option>
          </select>
        </CampoFormulario>
        <!-- fieldset + legend: os lectores de pantalla len "Colexiado" antes de Si/Non. A lenda co mesmo aspecto
             que as etiquetas dos outros campos. Nun doctor novo non hai ningún marcado (coledoc: null): hai que elixir -->
        <fieldset class="flex flex-col gap-1">
          <legend class="mb-1 text-sm font-semibold text-titulo">
            Colexiado<span class="ml-0.5 text-perigo" aria-hidden="true">*</span>
          </legend>
          <div class="flex h-11 items-center gap-5 md:h-10">
            <label class="flex items-center gap-2">
              <input v-model="novoDoctor.coledoc" type="radio" name="coledoc" :value="true" class="size-5 accent-acento" />
              Si
            </label>
            <label class="flex items-center gap-2">
              <input v-model="novoDoctor.coledoc" type="radio" name="coledoc" :value="false" class="size-5 accent-acento" />
              Non
            </label>
          </div>
        </fieldset>
      </div>

      <!-- erros e botóns, centrados -->
      <div class="flex flex-col items-center gap-4">
        <!-- mensaxes de erro: xuntas enriba de Gardar, cun exemplo válido.
             Teñen os id aos que apunta o aria-describedby de cada campo -->
        <CaixaErros v-if="correoInvalido || telefonoIncorrecto">
          <p v-if="correoInvalido" id="correo-erro" role="alert">
            Correo non válido. Exemplo: usuario@exemplo.com
          </p>
          <p v-if="telefonoIncorrecto" id="telefono-erro" role="alert">
            Teléfono non válido: 9 cifras empezando por 6 ou 7. Exemplo: 612345678
          </p>
        </CaixaErros>

        <!-- botóns: no móbil un debaixo do outro a todo o ancho; desde md en liña e todos do mesmo ancho
             (md:w-27 = 108 px, o do máis longo, "Eliminar"). Eliminar sempre separado -->
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
          <BotonAccion variante="secundario" class="w-full md:w-27" @click="limparConConfirmacion">Limpiar</BotonAccion>
          <!-- Eliminar só aparece cando hai un doctor cargado (✏️); separado dos outros para non premelo sen querer -->
          <BotonAccion
            v-if="editando"
            variante="perigo"
            class="mt-4 w-full md:mt-0 md:ml-10 md:w-27"
            title="Eliminar"
            :disabled="gardando"
            @click="eliminarDoctorCargado"
          >
            Eliminar
          </BotonAccion>
        </div>
        <!-- texto da axuda debaixo dos botóns: visible por defecto e oculto só cando hai rato (pointer-fine) -->
        <p v-if="motivoNonGardar" id="axuda-gardar" class="text-sm pointer-fine:hidden">{{ motivoNonGardar }}</p>
      </div>
    </form>

    <!-- título da listaxe co botón para xerar o PDF da listaxe (filtrada) -->
    <TituloSeccion>
      <ClipboardList class="size-5" aria-hidden="true" /> Listaxe de doctores
      <template #accion>
        <BotonAccion variante="secundario" :disabled="doctoresFiltrados.length === 0" @click="exportarDoctores">
          <Printer class="size-5" aria-hidden="true" /> PDF
        </BotonAccion>
      </template>
    </TituloSeccion>
    <!-- mentres non se edita, o que se escribe no formulario filtra a táboa -->
    <p v-if="filtroActivo" class="mb-2 text-sm italic">
      Mostrando {{ doctoresFiltrados.length }} de {{ doctores.length }} doctores (filtrados polo formulario)
    </p>
    <!-- no móbil a táboa desprázase en horizontal dentro do seu contedor (non a páxina enteira) -->
    <div v-if="doctoresFiltrados.length > 0" class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <caption class="sr-only">Listaxe de doctores</caption>
        <thead class="bg-acento-suave text-titulo">
          <tr>
            <th v-for="cabeceira in cabeceiras" :key="cabeceira" scope="col" class="border border-acento-claro p-3 font-semibold">
              {{ cabeceira }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(d, index) in doctoresFiltrados" :key="d._id" class="bg-white">
            <!-- números e códigos (nº, ID, teléfono) centrados; o texto á esquerda -->
            <td class="border border-acento-claro p-3 text-center">{{ index + 1 }}</td>
            <td class="border border-acento-claro p-3 text-center">{{ d._id }}</td>
            <td class="border border-acento-claro p-3">{{ d.apeldoc }}</td>
            <td class="border border-acento-claro p-3">{{ d.nomedoc }}</td>
            <td class="border border-acento-claro p-3">{{ d.coledoc ? "Si" : "Non" }}</td>
            <td class="border border-acento-claro p-3 text-center">{{ d.movildoc }}</td>
            <td class="border border-acento-claro p-3">{{ d.espedoc }}</td>
            <td class="border border-acento-claro p-3">
              <!-- doctores.indexOf(d): a posición na listaxe completa (co filtro, o index da fila non é o mesmo) -->
              <div class="flex justify-center gap-2">
                <BotonAccion variante="icona" title="Editar" :aria-label="`Editar a ${d.nomedoc} ${d.apeldoc}`" @click="editarDoctor(doctores.indexOf(d))">
                  <Pencil class="size-4" aria-hidden="true" />
                </BotonAccion>
                <BotonAccion variante="icona-perigo" title="Eliminar" :aria-label="`Eliminar a ${d.nomedoc} ${d.apeldoc}`" @click="eliminarDoctor(doctores.indexOf(d))">
                  <Trash2 class="size-4" aria-hidden="true" />
                </BotonAccion>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else-if="filtroActivo">Ningún doctor coincide co filtro.</p>
    <p v-else>Non hai doctores cargados.</p>
  </TarxetaPanel>
</template>

<script setup>

/// Zona de declaracións

import { ref, reactive, computed, onMounted } from "vue";
import { obtenerEspecialidades } from "../api/especialidades.js";
import {
  getDoctores,
  saveDoctor,
  deleteDoctor,
  modifyDoctor,
} from "../api/doctores.js";
import {
  alertaExito,
  alertaError,
  alertaConfirmacion,
  alertaInfo,
  alertaEliminar
} from "../utils/alertas.js";
import { generarPDF } from "../utils/pdf.js";
import { useDoctorStore } from "../store/doctorStore.js";
import { Stethoscope, ClipboardList, BrushCleaning, Printer, Pencil, Trash2 } from "lucide-vue-next";
import TarxetaPanel from "./comun/TarxetaPanel.vue";
import TituloSeccion from "./comun/TituloSeccion.vue";
import CampoFormulario from "./comun/CampoFormulario.vue";
import CaixaErros from "./comun/CaixaErros.vue";
import BotonAccion from "./comun/BotonAccion.vue";

// cabeceiras da táboa (así o <th> escríbese unha soa vez)
const cabeceiras = ["#", "ID", "Apelido", "Nome", "Colexiado", "Telefono", "Especialidade", "Accións"];

const doctores = ref([]); //lista de doctores da BD
const especialidades = ref([]); //lista de especialidades para o select

const editando = ref(false);
// true mentres se envía un gardado ou un borrado ao servidor: bloquea Gardar e Eliminar para non envialo dúas veces
const gardando = ref(false);

// store de Pinia: o doctor cargado no formulario, para usalo na páxina de Citas.
// Regra: seleccionado para Citas = cargado no formulario (se o formulario se baleira, deselecciónase)
const doctorStore = useDoctorStore();
const correoInvalido = ref(false);
const telefonoIncorrecto = ref(false);

// campos do formulario (para comparar cambios, filtrar e baleirar)
const CAMPOS = ["apeldoc", "nomedoc", "coledoc", "movildoc", "maildoc", "espedoc"];
// copia dos datos do doctor tal como se cargou (✏️); null se o formulario é dun doctor novo
const copiaOrixinal = ref(null);

// sen ID propio: ao editar, Object.assign engade o _id do doctor e con el sabemos cal modificar.
// coledoc empeza en null (ningún radio marcado): é obrigatorio e hai que elixilo
const novoDoctor = reactive({
  apeldoc: "",
  nomedoc: "",
  coledoc: null,
  movildoc: "",
  maildoc: "",
  espedoc: "",
});

// por que non se pode gardar aínda ("" se xa se pode). Gardar desactívase mentres non estea baleiro,
// e o texto móstrase como axuda ao pasar o rato por riba do botón
const motivoNonGardar = computed(() => {
  if (gardando.value) {
    return "Gardando…";
  }
  if (correoInvalido.value || telefonoIncorrecto.value) {
    return "Corrixe os campos marcados en vermello para gardar";
  }
  const falta = [];
  if (novoDoctor.apeldoc.trim() === "") falta.push("Apelido");
  if (novoDoctor.nomedoc.trim() === "") falta.push("Nome");
  if (novoDoctor.movildoc.trim() === "") falta.push("Teléfono");
  if (novoDoctor.espedoc === "") falta.push("Especialidade");
  if (novoDoctor.coledoc === null) falta.push("Colexiado"); // na mesma orde que os campos no formulario
  return falta.length ? "Para gardar falta: " + falta.join(", ") : "";
});

// texto para comparar sen ter en conta maiúsculas nin acentos ("José" → "jose")
function normalizar(texto) {
  return String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// un campo do formulario ten algo? (colexiado: se se marcou Si ou Non)
function campoCuberto(campo) {
  return campo === "coledoc" ? novoDoctor.coledoc !== null : normalizar(novoDoctor[campo]) !== "";
}

// hai filtro se non estamos editando e hai algo escrito/marcado nalgún campo
const filtroActivo = computed(() => !editando.value && CAMPOS.some(campoCuberto));

// doctores que coinciden co formulario: cada campo cuberto ten que estar contido no do doctor
// (colexiado ten que ser igual). Ao editar un doctor móstrase a listaxe completa
const doctoresFiltrados = computed(() => {
  if (!filtroActivo.value) {
    return doctores.value;
  }
  return doctores.value.filter((d) =>
    CAMPOS.every((campo) => {
      if (!campoCuberto(campo)) return true;
      if (campo === "coledoc") return d.coledoc === novoDoctor.coledoc;
      return normalizar(d[campo]).includes(normalizar(novoDoctor[campo]));
    })
  );
});

/// Zona de ciclo de vida

// ao abrir a páxina: carga as especialidades e a lista de doctores (cada unha co seu aviso se falla)
onMounted(async () => {
  try {
    especialidades.value = await obtenerEspecialidades();
  } catch (error) {
    console.error("Erro ao cargar as especialidades:", error);
    alertaError("Non se puideron cargar as especialidades. Contacte co administrador do sistema.");
  }
  await cargarDoctores();
  recuperarSeleccionado();
});

/// Zona de métodos ou funcións

// botón Gardar: modifica o doctor se estamos editando (pedindo confirmación), ou créao se é novo
async function guardarDoctor() {
  // validamos correo e teléfono tamén aquí: se se preme Enter dentro dun campo, o @blur non se executa
  validarCorreo();
  validarTelefono();
  if (correoInvalido.value || telefonoIncorrecto.value) {
    return;
  }

  if (editando.value) {
    // se non se cambiou nada non hai nada que gardar
    if (!haiCambiosSenGardar()) {
      alertaInfo("Non hai cambios que gardar.");
      return;
    }
    // pedimos confirmación; ao confirmar xa non se mostra mensaxe de éxito (o cambio vese na táboa)
    const confirmacion = await alertaConfirmacion(`Seguro que queres gardar os cambios de ${novoDoctor.nomedoc} ${novoDoctor.apeldoc}?`);
    if (!confirmacion.isConfirmed) {
      return;
    }
  }

  gardando.value = true;
  try {
    if (editando.value) {
      await modifyDoctor(novoDoctor._id, novoDoctor); // identificamos o doctor polo _id de MongoDB
      console.log("Doctor modificado correctamente");
    } else {
      await saveDoctor(novoDoctor);
      console.log("Doctor gardado correctamente");
      alertaExito("Doctor gardado correctamente."); // gardar un novo non pide confirmación, así que si se avisa
    }
    limpiarFormdoc(); //baleira o formulario e sae do modo edición (e deselecciona o doctor para Citas)
  } catch (error) {
    console.error("Erro ao gardar doctor:", error);
    if (error.response?.status === 409) {
      // o backend responde 409 se xa hai un doctor con todos os datos iguais
      alertaError("Xa existe un doctor cos mesmos datos.");
    } else {
      alertaError("Erro ao gardar o doctor. Contacte co administrador do sistema.");
    }
    return;
  } finally {
    gardando.value = false; // tanto se foi ben como se fallou, desbloqueamos
  }
  await cargarDoctores(); // recarga a lista (ten o seu propio aviso se falla: o doctor si se gardou)
}

// botón 🗑️: borra o doctor da BD e da táboa, despois de confirmar
async function eliminarDoctor(index) {
  if (gardando.value) {
    return; // xa hai un gardado ou borrado en curso
  }
  const d = doctores.value[index];
  // pide confirmación; Swal devolve un obxecto, por iso comprobamos isConfirmed
  // alertaEliminar: botón vermello "Eliminar" e Cancelar seleccionado, para non borrar por costume
  const confirmacion = await alertaEliminar(`Seguro que queres eliminar a ${d.nomedoc} ${d.apeldoc}?`);
  if (!confirmacion.isConfirmed) {
    return; //se o usuario cancela, non se borra nada
  }
  gardando.value = true;
  try {
    await deleteDoctor(d._id); // borra o doctor da BD polo seu _id
    doctores.value.splice(index, 1); // e quítao da táboa
    // se era o doctor cargado no formulario, baleirámolo (se non, Gardar intentaría modificar un doctor que xa non existe)
    // (limpiarFormdoc tamén o deselecciona para Citas, xa que non existe)
    if (editando.value && novoDoctor._id === d._id) {
      limpiarFormdoc();
    }
    console.log("Doctor eliminado correctamente"); // sen mensaxe de éxito: xa se confirmou e a fila desaparece
  } catch (error) {
    console.error("Erro ao eliminar doctor:", error);
    alertaError("Erro ao eliminar o doctor. Contacte co administrador do sistema.");
  } finally {
    gardando.value = false;
  }
}

// botón Eliminar do formulario: busca na lista o doctor cargado e bórrao con eliminarDoctor
function eliminarDoctorCargado() {
  const index = doctores.value.findIndex((d) => d._id === novoDoctor._id);
  if (index !== -1) {
    eliminarDoctor(index);
  }
}

// botón ✏️: carga o doctor da táboa no formulario e activa o modo edición
// (se no formulario hai datos sen gardar, pregunta antes de substituílos)
async function editarDoctor(index) {
  if (!(await confirmarDescartar())) {
    return;
  }
  cargarNoFormulario(doctores.value[index]);
}

// Tab no campo DNI o tel: se o filtro deixa un só paciente na táboa, cárgao no formulario
function cargarSeUnico() {
  if (!editando.value && filtroActivo.value && doctoresFiltrados.value.length === 1) {
    cargarNoFormulario(doctoresFiltrados.value[0]);
  }
}

// carga un doctor no formulario en modo edición e selecciónao para Citas (úsano ✏️ e recuperarSeleccionado)
function cargarNoFormulario(doctor) {
  limpiarFormdoc(); // baleiramos antes: Object.assign deixaría os datos vellos nos campos que este doctor non teña
  // copia tamén o _id: precisámolo para que Gardar saiba que doctor modificar
  // (ao revés que en pacientes, que se identifican polo DNI e o _id bórrase)
  Object.assign(novoDoctor, doctor);
  editando.value = true;
  copiaOrixinal.value = fotoFormulario(); // para saber despois se se cambiou algo
  doctorStore.seleccionarDoctor(novoDoctor); // o doctor cargado queda seleccionado para Citas
}

// ao volver a esta páxina (ao saír dela o formulario pérdese): se hai un doctor seleccionado, cárgao outra vez no formulario.
// Así "cargado no formulario" e "seleccionado para Citas" sempre coinciden
function recuperarSeleccionado() {
  const id = doctorStore._id;
  if (!id) {
    return;
  }
  const doctor = doctores.value.find((d) => d._id === id);
  if (doctor) {
    cargarNoFormulario(doctor);
  } else {
    doctorStore.limpiarDoctor(); // xa non existe
  }
}

// baleira o formulario, sae do modo edición e quita as mensaxes de erro (non pregunta: úsase tamén despois de gardar/eliminar)
function limpiarFormdoc() {
  CAMPOS.forEach((campo) => {
    novoDoctor[campo] = campo === "coledoc" ? null : "";
  });
  // quitamos o resto de claves que trouxo Object.assign (_id, __v...): un _id baleiro faría fallar o seguinte doctor novo
  Object.keys(novoDoctor).forEach((clave) => {
    if (!CAMPOS.includes(clave)) delete novoDoctor[clave];
  });
  editando.value = false;
  correoInvalido.value = false;
  telefonoIncorrecto.value = false;
  copiaOrixinal.value = null;
  doctorStore.limpiarDoctor(); // formulario baleiro = ningún doctor seleccionado para Citas
}

// botón 🧹: se hai datos sen gardar pide confirmación antes de baleirar o formulario
async function limparConConfirmacion() {
  if (await confirmarDescartar()) {
    limpiarFormdoc(); // tamén deselecciona o doctor para Citas
  }
}

// botón 🖨️ PDF: abre nunha pestana nova a listaxe que se ve na táboa (filtrada se hai filtro).
// Sen o _id de MongoDB: en papel non lle di nada a ninguén
function exportarDoctores() {
  const total = doctoresFiltrados.value.length;
  generarPDF(
    "Listaxe de doctores",
    ["Apelido", "Nome", "Teléfono", "Especialidade", "Colexiado"],
    doctoresFiltrados.value.map((d) => [d.apeldoc, d.nomedoc, d.movildoc, d.espedoc, d.coledoc ? "Si" : "Non"]),
    `${total} ${total === 1 ? "doctor" : "doctores"}` + (filtroActivo.value ? " (listaxe filtrada)" : "")
  );
}

// Zona de funcións auxiliares

// carga a lista de doctores da BD; se falla (backend ou MongoDB caídos) avisa en vez de deixar a táboa baleira sen máis
async function cargarDoctores() {
  try {
    doctores.value = await getDoctores();
  } catch (error) {
    console.error("Erro ao cargar os doctores:", error);
    alertaError("Non se puido cargar a lista de doctores. Contacte co administrador do sistema.");
  }
}

// "foto" dos datos do formulario como texto, para comparar o estado actual co do doctor cargado
function fotoFormulario() {
  return JSON.stringify(CAMPOS.map((campo) => novoDoctor[campo] ?? ""));
}

// hai datos no formulario que se perderían?
// - doctor cargado (✏️): se algo cambiou desde que se cargou
// - doctor novo: se se escribiu ou marcou algo
function haiCambiosSenGardar() {
  if (copiaOrixinal.value !== null) {
    return fotoFormulario() !== copiaOrixinal.value;
  }
  return CAMPOS.some(campoCuberto);
}

// se hai datos sen gardar, pregunta se se descartan. Devolve true se se pode continuar
async function confirmarDescartar() {
  if (!haiCambiosSenGardar()) {
    return true;
  }
  const confirmacion = await alertaConfirmacion("Hai datos sen gardar que se perderán. Queres descartalos?");
  return confirmacion.isConfirmed;
}

// valida o correo (campo opcional). Non borra o que escribiu o usuario: só marca o erro.
// O erro quítase cando o correo é correcto ou cando se deixa baleiro (é opcional)
function validarCorreo() {
  const valor = novoDoctor.maildoc.trim().toLowerCase();
  correoInvalido.value = valor !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  if (!correoInvalido.value) {
    novoDoctor.maildoc = valor; // se é correcto gardámolo normalizado (en minúsculas e sen espazos)
  }
}

// valida o teléfono (campo obrigatorio): móbil de 9 cifras que empeza por 6 ou 7.
// Non borra o valor; se está baleiro non cambia nada (un erro xa visible mantense ata que o número sexa correcto)
function validarTelefono() {
  const valor = novoDoctor.movildoc.trim();
  if (valor === "") {
    return;
  }
  telefonoIncorrecto.value = !/^[67]\d{8}$/.test(valor);
  if (!telefonoIncorrecto.value) {
    novoDoctor.movildoc = valor; // se é correcto gardámolo sen espazos
  }
}

// pon en maiúscula a primeira letra de cada palabra (ex: "ana maría" → "Ana María")
function formatearNome(valor) {
  return valor
    .trim()        // quita os espazos do principio e do final (un nome só con espazos queda baleiro e Gardar desactívase)
    .split(/\s+/)  // separa polas palabras aínda que haxa varios espazos seguidos entre elas
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(" ");
}
</script>
