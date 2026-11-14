<template>
  <!-- rounded-t-none: as esquinas de arriba rectas, para que o panel quede pegado ao menú sen oco; as de abaixo seguen redondeadas -->
  <TarxetaPanel etiqueta="div" class="w-full rounded-t-none text-left">
    <TituloSeccion><Users class="size-5" aria-hidden="true" /> Xestión de pacientes</TituloSeccion>

    <form class="mb-8 flex flex-col gap-4" @submit.prevent="guardarPaciente">
      <!-- validación: o erro aparece ao saír do campo (@blur); mentres hai erro, revalídase con cada tecla (@input)
           e desaparece en canto o valor é correcto. O valor escrito nunca se borra -->

      <!-- fila 1: DNI (+ 🔍 e 🧹), apelido e nome. No móbil, un campo por fila; desde md, en liña -->
      <div class="flex flex-col gap-4 md:flex-row">
        <CampoFormulario id="dni" etiqueta="DNI/NIE" obrigatorio :erro="documentoInvalido" class="md:w-auto" v-slot="{ clases }">
          <!-- :disabled="editando" → cando cargamos un paciente (✏️ ou 🔍) o DNI vese pero non se pode cambiar; 🧹 desbloquéao -->
          <input
            id="dni"
            v-model="novoPaciente.dnipac"
            type="text"
            required
            autocomplete="off"
            :class="[clases, 'text-center md:w-36']"
            :aria-invalid="documentoInvalido"
            aria-describedby="dni-erro"
            :disabled="editando"
            @blur="validarDocumento"
            @input="documentoInvalido && validarDocumento()"
            @keydown.tab="cargarSeUnico"
          />
          <!-- 🔍 tamén se bloquea mentres editamos: co DNI bloqueado só volvería cargar o mesmo paciente -->
          <BotonAccion variante="icona" class="shrink-0" :disabled="editando" title="Buscar" aria-label="Buscar paciente por DNI" @click="buscarPaciente">
            <Search class="size-5" aria-hidden="true" />
          </BotonAccion>
          <BotonAccion variante="icona" class="shrink-0" title="Limpar formulario" aria-label="Limpar formulario" @click="limparConConfirmacion">
            <BrushCleaning class="size-5" aria-hidden="true" />
          </BotonAccion>
        </CampoFormulario>
        <CampoFormulario id="apelido" etiqueta="Apelido" obrigatorio class="md:flex-1" v-slot="{ clases }">
          <input id="apelido" v-model="novoPaciente.apelpac" type="text" required autocomplete="family-name" :class="clases"
            @blur="novoPaciente.apelpac = formatearNome(novoPaciente.apelpac)" />
        </CampoFormulario>
        <CampoFormulario id="nome" etiqueta="Nome" obrigatorio class="md:flex-1" v-slot="{ clases }">
          <input id="nome" v-model="novoPaciente.nomepac" type="text" required autocomplete="given-name" :class="clases"
            @blur="novoPaciente.nomepac = formatearNome(novoPaciente.nomepac)" />
        </CampoFormulario>
      </div>

      <!-- fila 2: data de nacemento, correo e teléfono -->
      <div class="flex flex-col gap-4 md:flex-row">
        <CampoFormulario id="nacemento" etiqueta="Fecha nacemento" class="md:w-44" v-slot="{ clases }">
          <input id="nacemento" v-model="novoPaciente.nacipac" type="date" autocomplete="bday" :class="[clases, 'text-center']" />
        </CampoFormulario>
        <CampoFormulario id="correo" etiqueta="Correo" :erro="correoInvalido" class="md:flex-1" v-slot="{ clases }">
          <input
            id="correo"
            v-model="novoPaciente.mailpac"
            type="email"
            autocomplete="email"
            :class="clases"
            :aria-invalid="correoInvalido"
            aria-describedby="correo-erro"
            @blur="validarCorreo"
            @input="correoInvalido && validarCorreo()"
          />
        </CampoFormulario>
        <CampoFormulario id="telefono" etiqueta="Telefono" obrigatorio :erro="telefonoIncorrecto" class="md:w-44" v-slot="{ clases }">
          <input
            id="telefono"
            v-model="novoPaciente.movilpac"
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
      </div>

      <!-- fila 3: dirección, provincia e municipio (os selects con ancho fixo: non cambian ao elixir outra opción) -->
      <div class="flex flex-col gap-4 md:flex-row">
        <CampoFormulario id="direccion" etiqueta="Dirección" class="md:flex-1" v-slot="{ clases }">
          <input id="direccion" v-model="novoPaciente.dirpac" type="text" autocomplete="street-address" :class="clases" />
        </CampoFormulario>
        <CampoFormulario id="provincia" etiqueta="Provincia" class="md:w-60" v-slot="{ clases }">
          <!-- @change: ao cambiar de provincia baleiramos o municipio (se non, quedaría gardado o da provincia anterior) e cargamos os novos municipios -->
          <select id="provincia" v-model="novoPaciente.propac" :class="clases" @change="novoPaciente.munipac = ''; cargarMunicipios()">
            <option value="">Selecciona una provincia</option>
            <option v-for="provincia in provincias" :key="provincia.id" :value="provincia.nm">
              {{ provincia.nm }}
            </option>
          </select>
        </CampoFormulario>
        <!-- municipio: o ancho colle o 99 % dos nomes; os ~20 máis longos córtanse só co select pechado -->
        <CampoFormulario id="municipio" etiqueta="Municipio" class="md:w-64" v-slot="{ clases }">
          <select id="municipio" v-model="novoPaciente.munipac" :class="clases">
            <option value="">Selecciona un municipio</option>
            <option v-for="municipio in municipios" :key="municipio.id" :value="municipio.nm">
              {{ municipio.nm }}
            </option>
          </select>
        </CampoFormulario>
      </div>

      <!-- política de privacidade, erros e botóns, centrados -->
      <div class="flex flex-col items-center gap-4">
        <label class="flex items-start gap-2">
          <input v-model="novoPaciente.lopdpac" type="checkbox" class="mt-1 size-5 shrink-0 accent-acento" />
          <span>
            Acceptar a
            <a :href="$router.resolve({ name: 'PoliticaPrivacidad'}).href" target="_blank" rel="noopener noreferrer" class="underline">
              Politica de privacidade e confidencialidade.
            </a>
          </span>
        </label>

        <!-- mensaxes de erro: xuntas enriba de Gardar, cun exemplo válido.
             Manteñen os id para que o aria-describedby de cada campo siga apuntando á súa mensaxe -->
        <CaixaErros v-if="documentoInvalido || correoInvalido || telefonoIncorrecto">
          <p v-if="documentoInvalido" id="dni-erro" role="alert">
            DNI/NIE non válido. Exemplo: 12345678Z ou X1234567L
          </p>
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
          <!-- axuda de Gardar ("Para gardar falta…"): un botón disabled non recibe o rato, así que o tooltip
               móstrao o span que o envolve (group-hover), só en pantallas con rato (pointer-fine).
               Sen rato (táctiles, só teclado) o texto vese debaixo dos botóns. Os lectores de pantalla len o texto
               de abaixo grazas a aria-describedby (aínda que estea oculto) -->
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
          <!-- Eliminar só aparece cando hai un paciente cargado (✏️ ou 🔍); separado dos outros para non premelo sen querer -->
          <BotonAccion
            v-if="editando"
            variante="perigo"
            class="mt-4 w-full md:mt-0 md:ml-10 md:w-27"
            title="Eliminar"
            :disabled="gardando"
            @click="eliminarPacienteCargado"
          >
            Eliminar
          </BotonAccion>
        </div>
        <!-- texto da axuda debaixo dos botóns: visible por defecto (táctiles, só teclado…) e oculto só cando hai rato
             (pointer-fine), onde xa sae o tooltip. Os lectores de pantalla léno sempre (aria-describedby) -->
        <p v-if="motivoNonGardar" id="axuda-gardar" class="text-sm pointer-fine:hidden">{{ motivoNonGardar }}</p>
      </div>
    </form>

    <!-- título da listaxe co botón para xerar o PDF da listaxe (filtrada) -->
    <TituloSeccion>
      <ClipboardList class="size-5" aria-hidden="true" /> Listaxe de pacientes
      <template #accion>
        <BotonAccion variante="secundario" :disabled="pacientesFiltrados.length === 0" @click="exportarPacientes">
          <Printer class="size-5" aria-hidden="true" /> PDF
        </BotonAccion>
      </template>
    </TituloSeccion>
    <!-- mentres non se edita, o que se escribe no formulario filtra a táboa -->
    <p v-if="filtroActivo" class="mb-2 text-sm italic">
      Mostrando {{ pacientesFiltrados.length }} de {{ pacientes.length }} pacientes (filtrados polo formulario)
    </p>
    <!-- no móbil a táboa desprázase en horizontal dentro do seu contedor (non a páxina enteira) -->
    <div v-if="pacientesFiltrados.length > 0" class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <caption class="sr-only">Listaxe de pacientes</caption>
        <thead class="bg-acento-suave text-titulo">
          <tr>
            <th v-for="cabeceira in cabeceiras" :key="cabeceira" scope="col" class="border border-acento-claro p-3 font-semibold">
              {{ cabeceira }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, index) in pacientesFiltrados" :key="p._id" class="bg-white">
            <!-- números (nº, DNI, data, teléfono) centrados; o texto á esquerda -->
            <td class="border border-acento-claro p-3 text-center">{{ index + 1 }}</td>
            <td class="border border-acento-claro p-3 text-center">{{ p.dnipac }}</td>
            <td class="border border-acento-claro p-3">{{ p.apelpac }}</td>
            <td class="border border-acento-claro p-3">{{ p.nomepac }}</td>
            <td class="border border-acento-claro p-3 text-center">{{ p.nacipac }}</td>
            <td class="border border-acento-claro p-3 text-center">{{ p.movilpac }}</td>
            <td class="border border-acento-claro p-3">{{ p.mailpac }}</td>
            <td class="border border-acento-claro p-3">{{ p.dirpac }}</td>
            <td class="border border-acento-claro p-3">{{ p.propac }}</td>
            <td class="border border-acento-claro p-3">{{ p.munipac }}</td>
            <td class="border border-acento-claro p-3">
              <!-- pacientes.indexOf(p): a posición na listaxe completa (co filtro, o index da fila non é o mesmo) -->
              <div class="flex justify-center gap-2">
                <BotonAccion variante="icona" title="Editar" :aria-label="`Editar a ${p.nomepac} ${p.apelpac}`" @click="editarUsuario(pacientes.indexOf(p))">
                  <Pencil class="size-4" aria-hidden="true" />
                </BotonAccion>
                <BotonAccion variante="icona-perigo" title="Eliminar" :aria-label="`Eliminar a ${p.nomepac} ${p.apelpac}`" @click="eliminarPaciente(pacientes.indexOf(p))">
                  <Trash2 class="size-4" aria-hidden="true" />
                </BotonAccion>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else-if="filtroActivo">Ningún paciente coincide co filtro.</p>
    <p v-else>Non hai pacientes cargados.</p>
  </TarxetaPanel>
</template>

<!--XXXXXXXXXXXXXXXXXXXXXX  ZONA DE SCRIPTS  XXXXXXXXXXXXXXXXXXXXXXXX -->

<script setup>

/// Zona de declaracións

import { ref, reactive, computed, onMounted } from "vue";
import { obtenerMunicipios, obtenerProvincias } from "../api/municipios.js";
import { 
  getPacientes, 
  savePaciente, 
  deletePaciente, 
  modifyPaciente, 
  getPacienteByDni 
} from "../api/pacientes.js";

import {
  alertaExito,
  alertaError,
  alertaConfirmacion, 
  alertaInfo,
  alertaEliminar
} from '../utils/alertas.js'
import { generarPDF } from "../utils/pdf.js";
import { Users, ClipboardList, Search, BrushCleaning, Printer, Pencil, Trash2 } from "lucide-vue-next";
import TarxetaPanel from "./comun/TarxetaPanel.vue";
import TituloSeccion from "./comun/TituloSeccion.vue";
import CampoFormulario from "./comun/CampoFormulario.vue";
import CaixaErros from "./comun/CaixaErros.vue";
import BotonAccion from "./comun/BotonAccion.vue";

// cabeceiras da táboa (así o <th> escríbese unha soa vez)
const cabeceiras = ["#", "DNI/NIE", "Apelido", "Nome", "Fecha nacemento", "Telefono", "Correo", "Dirección", "Provincia", "Municipio", "Accións"];
import { usePacienteStore } from "../store/pacienteStore.js";

const pacientes = ref([]); //almacena la lista de pacientes e os seus cambios
const provincias = ref([]); //almacena a lista de provincias e os seus cambios
const municipios = ref([]);

const documentoInvalido = ref(false)
const correoInvalido = ref(false)
const telefonoIncorrecto = ref(false)
const editando = ref(false);
// true mentres se envía un gardado ou un borrado ao servidor: bloquea Gardar e Eliminar para non envialo dúas veces
// (se a BD tarda en responder, un segundo clic gardaría outra vez cando volvese a conexión)
const gardando = ref(false);

// store de Pinia: o paciente cargado no formulario, para que a páxina de Citas saiba de quen son as citas.
// Regra: seleccionado para Citas = cargado no formulario (se o formulario se baleira, deselecciónase)
const pacienteStore = usePacienteStore();

const LETRAS_DNI = "TRWAGMYFPDXBNJZSQVHLCKE"

// campos do formulario que se comparan para saber se hai cambios sen gardar
const CAMPOS = ["dnipac", "nomepac", "apelpac", "nacipac", "mailpac", "movilpac", "dirpac", "propac", "munipac", "lopdpac"];
// copia dos datos do paciente tal como se cargou (✏️ ou 🔍); null se o formulario é dun paciente novo
const copiaOrixinal = ref(null);

const novoPaciente = reactive({
  dnipac: "",
  nomepac: "",
  apelpac: "",
  nacipac: "",
  mailpac: "",
  movilpac: "",
  dirpac: "",
  propac: "",
  munipac: "",
  lopdpac: false
});

// por que non se pode gardar aínda ("" se xa se pode). Gardar desactívase mentres non estea baleiro,
// e o texto móstrase como axuda ao pasar o rato por riba do botón
const motivoNonGardar = computed(() => {
  if (gardando.value) {
    return "Gardando…";
  }
  if (documentoInvalido.value || correoInvalido.value || telefonoIncorrecto.value) {
    return "Corrixe os campos marcados en vermello para gardar";
  }
  const falta = [];
  if (novoPaciente.dnipac.trim() === "") falta.push("DNI/NIE");
  if (novoPaciente.apelpac.trim() === "") falta.push("Apelido");
  if (novoPaciente.nomepac.trim() === "") falta.push("Nome");
  if (novoPaciente.movilpac.trim() === "") falta.push("Teléfono");
  if (!novoPaciente.lopdpac) falta.push("aceptar a política de privacidade");
  return falta.length ? "Para gardar falta: " + falta.join(", ") : "";
});

// campos do formulario que filtran a táboa (todos menos a casiña da política de privacidade)
const CAMPOS_FILTRO = CAMPOS.filter((campo) => campo !== "lopdpac");

// texto para comparar sen ter en conta maiúsculas nin acentos ("José" → "jose")
function normalizar(texto) {
  return String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// hai filtro se non estamos editando e hai algo escrito nalgún campo
const filtroActivo = computed(() =>
  !editando.value && CAMPOS_FILTRO.some((campo) => normalizar(novoPaciente[campo]) !== "")
);

// pacientes que coinciden co escrito no formulario: cada campo cuberto ten que estar contido no do paciente
// (ao editar un paciente móstrase a listaxe completa)
const pacientesFiltrados = computed(() => {
  if (!filtroActivo.value) {
    return pacientes.value;
  }
  return pacientes.value.filter((p) =>
    CAMPOS_FILTRO.every((campo) => normalizar(p[campo]).includes(normalizar(novoPaciente[campo])))
  );
});

/// Zona de ciclo de vida

// ao abrir a páxina: carga as provincias e a lista de pacientes (cada unha co seu aviso se falla)
onMounted(async() => {
  try {
    provincias.value = await obtenerProvincias(); //carga a lista de provincias desde a API
  } catch (error) {
    console.error("Erro ao cargar as provincias:", error);
    alertaError("Non se puideron cargar as provincias. Contacte co administrador do sistema.");
  }
  await cargarPacientes();
  await recuperarSeleccionado();
});

// carga os municipios da provincia elixida no selector (ou baleira a lista se non hai provincia)
async function cargarMunicipios() {
  if (novoPaciente.propac === "") {
    municipios.value=[];
    return;
  }

  const provincia = provincias.value.find(
    p => p.nm === novoPaciente.propac
  );

//obtener los municipios de la provincia seleccionada
municipios.value = await obtenerMunicipios(provincia.id); 
}

// Zona de métodos ou funcións

// XXXXXXXXXXXXXXXXXXXXXX  FUNCIONES PRINCIPALES  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// botón Gardar: modifica o paciente se estamos editando (pedindo confirmación), ou créao se é novo
async function guardarPaciente() {
  // validamos DNI, correo e teléfono tamén aquí: se se preme Enter dentro dun campo, o @blur non se executa
  // e o dato sen validar chegaría á BD. Se algún non vale, mostramos o erro e non gardamos.
  validarDocumento();
  validarCorreo();
  validarTelefono();
  if (documentoInvalido.value || correoInvalido.value || telefonoIncorrecto.value) {
    return;
  }

  if (editando.value) {
    // se non se cambiou nada non hai nada que gardar
    if (!haiCambiosSenGardar()) {
      alertaInfo("Non hai cambios que gardar.");
      return;
    }
    // pedimos confirmación; ao confirmar xa non se mostra mensaxe de éxito (evitamos dúas ventás seguidas):
    // o usuario ve o cambio na táboa. Só se avisa se algo falla
    const confirmacion = await alertaConfirmacion(`Seguro que queres gardar os cambios de ${novoPaciente.nomepac} ${novoPaciente.apelpac}?`);
    if (!confirmacion.isConfirmed) {
      return;
    }
  }

  gardando.value = true;
  try {
    if (editando.value) {
      await modifyPaciente(novoPaciente.dnipac, novoPaciente);
      console.log("Paciente modificado correctamente");
    } else {
      await savePaciente(novoPaciente);
      console.log("Paciente gardado correctamente");
      alertaExito("Paciente gardado correctamente."); // gardar un novo non pide confirmación, así que si se avisa
    }
    limpiarFormpac(); //baleira o formulario e sae do modo edición (e deselecciona o paciente para Citas)
  } catch (error) {
    console.error("Erro ao gardar paciente:", error);
    if (error.response?.status === 409) {
      // o backend responde 409 cando o DNI xa existe: é un erro que o usuario pode corrixir el mesmo
      alertaError("Xa existe un paciente con este DNI/NIE.");
    } else {
      alertaError("Erro ao gardar o paciente. Contacte co administrador do sistema.");
    }
    return;
  } finally {
    gardando.value = false; // tanto se foi ben como se fallou, desbloqueamos
  }
  await cargarPacientes(); // recarga a lista (ten o seu propio aviso se falla: o paciente si se gardou)
}

// botón 🗑️: borra o paciente da BD e da táboa
async function eliminarPaciente(index) {
  if (gardando.value) {
    return; // xa hai un gardado ou borrado en curso
  }
  const p = pacientes.value[index]; // o paciente da lista 
  // pide confirmación; Swal devolve un obxecto, por iso comprobamos isConfirmed
  // alertaEliminar: botón vermello "Eliminar" e Cancelar seleccionado, para non borrar por costume
  const confirmacion = await alertaEliminar(`Seguro que queres eliminar a ${p.nomepac} ${p.apelpac}?`);
  if (!confirmacion.isConfirmed) {
    return; //se o usuario cancela, non se borra nada
  }
  gardando.value = true;
  try {
    await deletePaciente(p.dnipac); //elimina o paciente da base de datos
    pacientes.value.splice(index, 1); //elimina o paciente da lista
    // se era o paciente cargado no formulario, baleirámolo (se non, Gardar intentaría modificar un paciente que xa non existe)
    // (limpiarFormpac tamén o deselecciona para Citas, xa que non existe)
    if (editando.value && novoPaciente.dnipac === p.dnipac) {
      limpiarFormpac();
    }
    console.log("Paciente eliminado correctamente"); // sen mensaxe de éxito: xa se confirmou e a fila desaparece da táboa
  } catch (error) {
    console.error("Erro ao eliminar paciente:", error);
    alertaError("Erro ao eliminar o paciente. Contacte co administrador do sistema.");
  } finally {
    gardando.value = false;
  }
}

// botón Eliminar do formulario: busca na lista o paciente cargado e bórrao con eliminarPaciente
function eliminarPacienteCargado() {
  const index = pacientes.value.findIndex((p) => p.dnipac === novoPaciente.dnipac);
  if (index !== -1) {
    eliminarPaciente(index);
  }
}

// botón ✏️: carga o paciente da táboa no formulario e activa o modo edición
// (se no formulario hai datos sen gardar, pregunta antes de substituílos)
async function editarUsuario(index){
  if (!(await confirmarDescartar())) {
    return;
  }
  await cargarNoFormulario(pacientes.value[index]);
}

// Tab no campo DNI o tel: se o filtro deixa un só paciente na táboa, cárgao no formulario
function cargarSeUnico() {
  if (!editando.value && filtroActivo.value && pacientesFiltrados.value.length === 1) {
    cargarNoFormulario(pacientesFiltrados.value[0]);
  }
}

// carga un paciente no formulario en modo edición e selecciónao para Citas (úsano ✏️, 🔍 e recuperarSeleccionado)
async function cargarNoFormulario(paciente) {
  limpiarFormpac(); // baleiramos antes: Object.assign deixaría os datos vellos nos campos que este paciente non teña
  Object.assign(novoPaciente, paciente);
  //evitar que se cargue o _id de MongoDB no formulario
  delete novoPaciente._id;
  editando.value = true;
  await cargarMunicipios();
  copiaOrixinal.value = fotoFormulario(); // para saber despois se se cambiou algo
  seleccionarPaciente(novoPaciente); // o paciente cargado queda seleccionado para Citas
}

// ao volver a esta páxina (ao saír dela o formulario pérdese): se hai un paciente seleccionado, cárgao outra vez no formulario.
// Así "cargado no formulario" e "seleccionado para Citas" sempre coinciden
async function recuperarSeleccionado() {
  const dni = pacienteStore.dnipac;
  if (!dni) {
    return;
  }
  const paciente = pacientes.value.find((p) => p.dnipac === dni);
  if (paciente) {
    await cargarNoFormulario(paciente);
  } else {
    pacienteStore.limpiarPaciente(); // xa non existe (por exemplo, borrado noutra pestana)
  }
}

// botón 🧹: baleira o formulario, sae do modo edición e quita as mensaxes de erro
const limpiarFormpac = () => {
  Object.keys(novoPaciente).forEach((key) => {
    if (typeof novoPaciente[key] === "boolean"){
      novoPaciente[key] = false;   //reinicia los booleanos a false
    } else {
      novoPaciente[key] = ""; //reinicia el resto
    }
  })
  editando.value = false;
  documentoInvalido.value = false;
  correoInvalido.value = false;
  telefonoIncorrecto.value = false;
  municipios.value = []; // baleira tamén a lista de municipios da provincia anterior
  copiaOrixinal.value = null;
  pacienteStore.limpiarPaciente(); // formulario baleiro = ningún paciente seleccionado para Citas
};

// botón 🧹: se hai datos sen gardar pide confirmación antes de baleirar o formulario
// (limpiarFormpac úsase tamén despois de gardar ou eliminar, e aí non debe preguntar)
async function limparConConfirmacion() {
  if (await confirmarDescartar()) {
    limpiarFormpac(); // tamén deselecciona o paciente para Citas
  }
}

// botón 🔍: busca o paciente polo DNI na BD e cárgao no formulario para editalo
async function buscarPaciente() {
  validarDocumento();
  if (documentoInvalido.value) {
    return; // o DNI non é válido: o erro xa se mostra enriba de Gardar, non fai falta buscar
  }
  const dni = novoPaciente.dnipac.trim();
  if (!dni) {
    alertaInfo("Introduce un DNI/NIE para buscar un paciente.");
    return;
  }
  // se se escribiron outros datos (ademais do DNI, que é o que se busca), pregunta antes de substituílos
  if (!(await confirmarDescartar(true))) {
    return;
  }
  try {
    const paciente = await getPacienteByDni(dni);
    await cargarNoFormulario(paciente);
    console.log("Paciente atopado", paciente); // sen mensaxe: os datos aparecen no formulario
  } catch(error){
    if (error.response?.status === 404 ){
      // non existe: saímos do modo edición para que Gardar cree un paciente novo en vez de modificar un que non existe
      // (co DNI e 🔍 bloqueados ao editar isto xa non debería pasar desde o formulario, pero queda como seguridade)
      editando.value = false;
      alertaError("Non se atopou ningún paciente con este DNI/NIE.");
    } else {
      console.error("Erro ao buscar paciente:", error);
      alertaError("Erro ao buscar o paciente. Contacte co administrador do sistema.");
    }
  }
}

// botón 🖨️ PDF: abre nunha pestana nova a listaxe que se ve na táboa (filtrada se hai filtro).
// Só DNI, apelido, nome e teléfono: son datos persoais, exportamos só o necesario
function exportarPacientes() {
  const total = pacientesFiltrados.value.length;
  generarPDF(
    "Listaxe de pacientes",
    ["DNI/NIE", "Apelido", "Nome", "Teléfono"],
    pacientesFiltrados.value.map((p) => [p.dnipac, p.apelpac, p.nomepac, p.movilpac]),
    `${total} ${total === 1 ? "paciente" : "pacientes"}` + (filtroActivo.value ? " (listaxe filtrada)" : "")
  );
}

// garda no store o paciente (DNI, nome e apelido) para usalo en Citas
function seleccionarPaciente(paciente) {
  pacienteStore.seleccionarPaciente(paciente);
}

// XXXXXXXXXXXXXXXXXXXXXX  FUNCIONES AUXILIARES  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

// carga a lista de pacientes da BD; se falla (backend ou MongoDB caídos) avisa en vez de deixar a táboa baleira sen máis
async function cargarPacientes() {
  try {
    pacientes.value = await getPacientes();
  } catch (error) {
    console.error("Erro ao cargar os pacientes:", error);
    alertaError("Non se puido cargar a lista de pacientes. Contacte co administrador do sistema.");
  }
}

// "foto" dos datos do formulario como texto, para comparar o estado actual co do paciente cargado
function fotoFormulario() {
  return JSON.stringify(CAMPOS.map((campo) => novoPaciente[campo] ?? ""));
}

// hai datos no formulario que se perderían?
// - paciente cargado (✏️/🔍): se algo cambiou desde que se cargou
// - paciente novo: se se escribiu algo (a casiña da política non conta; o DNI tampouco se ignorarDni, para 🔍)
function haiCambiosSenGardar(ignorarDni = false) {
  if (copiaOrixinal.value !== null) {
    return fotoFormulario() !== copiaOrixinal.value;
  }
  return CAMPOS.some((campo) =>
    campo !== "lopdpac" &&
    !(ignorarDni && campo === "dnipac") &&
    String(novoPaciente[campo] ?? "").trim() !== ""
  );
}

// se hai datos sen gardar, pregunta se se descartan. Devolve true se se pode continuar
async function confirmarDescartar(ignorarDni = false) {
  if (!haiCambiosSenGardar(ignorarDni)) {
    return true;
  }
  const confirmacion = await alertaConfirmacion("Hai datos sen gardar que se perderán. Queres descartalos?");
  return confirmacion.isConfirmed;
}

// comproba que un DNI (8 números + letra) ten a letra correcta
function validarDNI(valor) {
  if (!/^\d{8}[A-Z]$/.test(valor)) return false
  const numero = parseInt(valor.slice(0, 8), 10)
  return valor.charAt(8) === LETRAS_DNI[numero % 23]
}

// comproba que un NIE (X/Y/Z + 7 números + letra) ten a letra correcta
function validarNIE(valor) {
  if (!/^[XYZ]\d{7}[A-Z]$/.test(valor)) return false
  const prefixo = { X: "0", Y: "1", Z: "2" }[valor.charAt(0)]
  const numero = parseInt(prefixo + valor.slice(1, 8), 10)
  return valor.charAt(8) === LETRAS_DNI[numero % 23]
}

// valida o DNI/NIE (campo obrigatorio). Non borra o que escribiu o usuario: só marca o erro.
// Se está baleiro non cambia nada: un campo sen tocar non se marca, e un erro xa visible
// mantense ata que se escriba un DNI/NIE correcto
function validarDocumento() {
  const valor = novoPaciente.dnipac.trim().toUpperCase()
  if (valor === "") {
    return
  }
  documentoInvalido.value = !(validarDNI(valor) || validarNIE(valor))
  if (!documentoInvalido.value) {
    novoPaciente.dnipac = valor // se é correcto gardámolo normalizado (en maiúsculas e sen espazos)
  }
}

// valida o correo (campo opcional). Non borra o que escribiu o usuario: só marca o erro.
// O erro quítase cando o correo é correcto ou cando se deixa baleiro (é opcional)
function validarCorreo() {
  const valor = novoPaciente.mailpac.trim().toLowerCase()
  correoInvalido.value = valor !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
  if (!correoInvalido.value) {
    novoPaciente.mailpac = valor // se é correcto gardámolo normalizado (en minúsculas e sen espazos)
  }
}

// valida o teléfono (campo obrigatorio): móbil de 9 cifras que empeza por 6 ou 7.
// Igual que o DNI: non borra o valor, e un erro xa visible mantense ata que o número sexa correcto
function validarTelefono() {
  const valor = novoPaciente.movilpac.trim()
  if (valor === "") {
    return
  }
  telefonoIncorrecto.value = !/^[67]\d{8}$/.test(valor)
  if (!telefonoIncorrecto.value) {
    novoPaciente.movilpac = valor // se é correcto gardámolo sen espazos
  }
}

// pon en maiúscula a primeira letra de cada palabra (ex: "ana maría" → "Ana María")
function formatearNome(valor) {
  return valor
    .trim()        // quita os espazos do principio e do final (un nome só con espazos queda baleiro e Gardar desactívase)
    .split(/\s+/)  // separa polas palabras aínda que haxa varios espazos seguidos entre elas
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(" ")
  }
  
</script>

