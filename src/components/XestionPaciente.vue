<template>
  <div class="xestion-pacientes">
    <h3>👥  Xestión de pacientes</h3>
    <form @submit.prevent="guardarPaciente">
      <div class="fila">
        <div class="campo campo-dni">
          <label for="dni">DNI/NIE:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input
            id="dni"
            v-model="novoPaciente.dnipac"
            type="text"
            required
            autocomplete="off"
            class="centrado"
            :class="{ 'campo-erro': documentoInvalido }"
            :aria-invalid="documentoInvalido"
            aria-describedby="dni-erro"
            :disabled="editando"
            @blur="validarDocumento"
            @input="documentoInvalido && validarDocumento()"/>
          <!-- validación: o erro aparece ao saír do campo (@blur); mentres hai erro, revalídase con cada tecla (@input)
               e desaparece en canto o valor é correcto. O valor escrito nunca se borra -->
          <!-- :disabled="editando" → cando cargamos un paciente (✏️ ou 🔍) o DNI vese pero non se pode cambiar; 🧹 desbloquéao -->
          <!-- type="button" para que non envíe o formulario ao pulsalo -->
          <!-- 🔍 tamén se bloquea mentres editamos: co DNI bloqueado só volvería cargar o mesmo paciente -->
          <button type="button" @click="buscarPaciente" :disabled="editando" title="Buscar" aria-label="Buscar paciente por DNI">🔍</button>
          <button type="button" @click="limparConConfirmacion" title="Limpar formulario" aria-label="Limpar formulario">🧹</button>
        </div>
        <div class="campo campo-apellido">
          <label for="apelido">Apelido:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="apelido" v-model="novoPaciente.apelpac" type="text" required autocomplete="family-name"
          @blur="novoPaciente.apelpac = formatearNome(novoPaciente.apelpac)"/>
        </div>
        <div class="campo campo-nome">
          <label for="nome">Nome:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="nome" v-model="novoPaciente.nomepac" type="text" required autocomplete="given-name"
          @blur="novoPaciente.nomepac = formatearNome(novoPaciente.nomepac)"/>
        </div>
      </div>
      <div class="fila">
        <div class="campo campo-nacimiento">
          <label for="nacemento">Fecha nacemento:</label>
          <input id="nacemento" v-model="novoPaciente.nacipac" type="date" autocomplete="bday" class="centrado" />
        </div>
        <div class="campo campo-correo">
          <label for="correo">Correo:</label>
          <input
            id="correo"
            v-model="novoPaciente.mailpac"
            type="email"
            autocomplete="email"
            :class="{ 'campo-erro': correoInvalido }"
            :aria-invalid="correoInvalido"
            aria-describedby="correo-erro"
            @blur="validarCorreo"
            @input="correoInvalido && validarCorreo()"
          />
        </div>
        <div class="campo campo-telefono">
          <label for="telefono">Telefono:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input
            id="telefono"
            v-model="novoPaciente.movilpac"
            type="tel"
            inputmode="numeric"
            required
            maxlength="9"
            autocomplete="tel"
            class="centrado"
            :class="{ 'campo-erro': telefonoIncorrecto }"
            :aria-invalid="telefonoIncorrecto"
            aria-describedby="telefono-erro"
            @blur="validarTelefono"
            @input="telefonoIncorrecto && validarTelefono()"
          />
        </div>
      </div>
      <div class="fila">
        <div class="campo">
          <label for="direccion">Dirección:</label>
          <input id="direccion" v-model="novoPaciente.dirpac" type="text" autocomplete="street-address" />
        </div>
        <div class="campo campo-provincia">
          <label for="provincia">Provincia:</label>
          <!-- @change: ao cambiar de provincia baleiramos o municipio (se non, quedaría gardado o da provincia anterior) e cargamos os novos municipios -->
          <select id="provincia" v-model="novoPaciente.propac" @change="novoPaciente.munipac = ''; cargarMunicipios()">
            <option value="">Selecciona una provincia</option>
            <option v-for="provincia in provincias" :key="provincia.id" :value="provincia.nm">
              {{ provincia.nm }}
            </option>
          </select>
        </div>
        <div class="campo campo-municipio">
          <label for="municipio">Municipio:</label>
          <select id="municipio" v-model="novoPaciente.munipac">
            <option value="">Selecciona un municipio</option>
            <option v-for="municipio in municipios" :key="municipio.id" :value="municipio.nm">
              {{ municipio.nm }}
            </option>
          </select>
        </div>
      </div>
      <div class="fila fila-gardar">
        <label>
          <input v-model="novoPaciente.lopdpac" type="checkbox" />Acceptar a 
          <a :href="$router.resolve({ name: 'PoliticaPrivacidad'}).href" target="_blank" rel="noopener noreferrer">
            Politica de privacidade e confidencialidade.
          </a>
        </label>

        <!-- Gardar e Eliminar na mesma liña -->
        <!-- mensaxes de erro: xuntas enriba de Gardar (ao lado dos inputs non había sitio), cun exemplo válido.
             Manteñen os id para que o aria-describedby de cada input siga apuntando á súa mensaxe -->
        <div v-if="documentoInvalido || correoInvalido || telefonoIncorrecto" class="erros">
          <p v-if="documentoInvalido" id="dni-erro" class="mensaxe-erro" role="alert">
            DNI/NIE non válido. Exemplo: 12345678Z ou X1234567L
          </p>
          <p v-if="correoInvalido" id="correo-erro" class="mensaxe-erro" role="alert">
            Correo non válido. Exemplo: usuario@exemplo.com
          </p>
          <p v-if="telefonoIncorrecto" id="telefono-erro" class="mensaxe-erro" role="alert">
            Teléfono non válido: 9 cifras empezando por 6 ou 7. Exemplo: 612345678
          </p>
        </div>

        <div class="botons-gardar">
          <!-- un botón disabled non recibe eventos do rato, así que a axuda (motivoNonGardar)
               móstrase ao pasar o rato por riba do span que o envolve -->
          <span class="axuda-gardar" :data-axuda="motivoNonGardar">
            <button
              type="submit"
              class="btn-guardar"
              :disabled="motivoNonGardar !== ''"
            >
              Gardar
            </button>
          </span>
          <!-- Limpiar ao lado de Gardar (onde xa está a man); fai o mesmo que 🧹 -->
          <button type="button" class="btn-limpar" @click="limparConConfirmacion">Limpiar</button>
          <!-- Eliminar só aparece cando hai un paciente cargado no formulario (✏️ ou 🔍);
               type="button" para que non envíe o formulario (se non, tamén gardaría) -->
          <button
            v-if="editando"
            type="button"
            class="btn-eliminar"
            title="Eliminar"
            :disabled="gardando"
            @click="eliminarPacienteCargado"
          >
            Eliminar
          </button>
        </div>

        <p class="nota-obrigatorio"><span aria-hidden="true">*</span> campo obrigatorio</p>
      </div>
    </form>
    <!-- título da listaxe co botón para xerar o PDF da listaxe (filtrada) -->
    <div class="cabecera-listado">
      <h3>📋 Listaxe de pacientes</h3>
      <button
        type="button"
        class="btn-pdf"
        :disabled="pacientesFiltrados.length === 0"
        @click="exportarPacientes"
      >
        🖨️ PDF
      </button>
    </div>
    <!-- mentres non se edita, o que se escribe no formulario filtra a táboa -->
    <p v-if="filtroActivo" class="info-filtro">
      Mostrando {{ pacientesFiltrados.length }} de {{ pacientes.length }} pacientes (filtrados polo formulario)
    </p>
    <table v-if="pacientesFiltrados.length > 0">
      <caption>Listaxe de pacientes</caption>
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">DNI/NIE</th>
          <th scope="col">Apelido</th>
          <th scope="col">Nome</th>
          <th scope="col">Fecha nacemento</th>
          <th scope="col">Telefono</th>
          <th scope="col">Correo</th>
          <th scope="col">Dirección</th>
          <th scope="col">Provincia</th>
          <th scope="col">Municipio</th>
          <th scope="col">Accións</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(p, index) in pacientesFiltrados" :key="p._id">
          <!-- números (nº, DNI, data, teléfono) centrados; o texto queda á esquerda -->
          <td class="centrado">{{ index + 1 }}</td>
          <td class="centrado">{{ p.dnipac }}</td>
          <td>{{ p.apelpac }}</td>
          <td>{{ p.nomepac }}</td>
          <td class="centrado">{{ p.nacipac }}</td>
          <td class="centrado">{{ p.movilpac }}</td>
          <td>{{ p.mailpac }}</td>
          <td>{{ p.dirpac }}</td>
          <td>{{ p.propac }}</td>
          <td>{{ p.munipac }}</td>
          <td class="centrado">
            <!-- pacientes.indexOf(p): a posición na listaxe completa (co filtro, o index da fila non é o mesmo) -->
            <button @click="editarUsuario(pacientes.indexOf(p))" title="Editar" :aria-label="`Editar a ${p.nomepac} ${p.apelpac}`">✏️</button>
            <button @click="eliminarPaciente(pacientes.indexOf(p))" title="Eliminar" :aria-label="`Eliminar a ${p.nomepac} ${p.apelpac}`">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else-if="filtroActivo">Ningún paciente coincide co filtro.</p>
    <p v-else>Non hai pacientes cargados.</p>
  </div>
</template>

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

<!--XXXXXXXXXXXXXXXXXXXXXX  ZONA DE ESTILOS  XXXXXXXXXXXXXXXXXXXXXXXX -->

<style scoped>
.xestion-pacientes {
  width: 100%;
  text-align: left; /* #app centra todo; aquí o texto vai á esquerda (táboa incluída) */
  background: white;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

h3 {
  margin-bottom: 1rem;
  font-weight: 600;
  background-color: var(--heading-bg);
  color: var(--text-h); /* texto escuro: o branco sobre este verde só tiña contraste 2:1 */
  text-align: center;
}

/* título da listaxe co botón do PDF ao lado */
.cabecera-listado {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.cabecera-listado h3 {
  flex: 1;
  margin: 0;
}

.btn-pdf {
  background-color: var(--accent);
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  cursor: pointer;
}

.btn-pdf:hover:enabled {
  background-color: var(--accent-dark);
}

.btn-pdf:disabled {
  background-color: #e0e0e0;
  color: #999;
  cursor: not-allowed;
}

.info-filtro {
  font-size: 0.85rem;
  font-style: italic;
}

/* ---------- formulario ---------- */
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

/* label e input na mesma liña; por defecto cada campo ocupa 1 parte da fila */
.campo {
  flex: 1;
  min-width: 0; /* deixa encoller o campo e o seu input (por defecto un input mide ~20 caracteres) para que a fila non se saia do panel */
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* campos máis anchos */
.campo-nome,
.campo-apellido {
  flex: 3;
}

/* DNI: só o ancho que precisa (9 caracteres), o resto da fila queda para nome e apelido */
.campo-dni {
  flex: 0 0 auto;
}

.campo-dni input {
  flex: none;
  width: 9em;
}

/* teléfono (9 cifras) e data: ancho fixo, non encollen; o espazo que sobra vai para os campos de texto */
.campo-telefono,
.campo-nacimiento {
  flex: 0 0 auto;
}

.campo-telefono input {
  flex: none;
  width: 11em; /* sitio para 13 caracteres (prefixo internacional: 0034612345678) */
}

.campo-nacimiento input {
  flex: none;
}

.campo-correo {
  flex: 2;
}

/* os selectores só ocupan o que miden, o resto queda para a dirección */
.campo-provincia,
.campo-municipio {
  flex: 0 0 auto;
  padding: 0.5rem 0;
}

/* ancho fixo para que o select non cambie de tamaño ao elixir outra opción */

/* provincia: cabe o texto máis longo ("Selecciona una provincia") */
#provincia {
  width: 14.5em;
}

/* municipio: cabe o 99% dos nomes; os ~20 máis longos (ex. "San Vicente del Raspeig/Sant Vicent del Raspeig")
   córtanse só co select pechado, na lista despregada vense enteiros */
#municipio {
  width: 16em;
}

.campo label {
  min-width: 80px; /* ancho fixo para aliñar */
  font-weight: 500;
}

.campo-nacimiento label {
  white-space: nowrap;
}

.campo input {
  flex: 1;
  min-width: 0;
  padding: 0.5rem;
  border: 1px solid #767676; /* contraste mínimo 3:1 para que se vexa o campo */
  border-radius: 6px;
  box-sizing: border-box;
}

/* os select coa mesma altura que os input */
.campo select {
  padding: 0.5rem;
}

/* botóns de icona (🔍 🧹 ✏️ 🗑️): mesmo ancho, e o alto igual ao ancho (cadrados) */
.campo button,
td button {
  aspect-ratio: 1;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ---------- validación ---------- */
/* input con erro: borde vermello máis marcado. O box-shadow engrosa o borde sen cambiar
   o tamaño do input (un border máis groso movería os campos da fila) */
input.campo-erro {
  border-color: #b00020;
  box-shadow: 0 0 0 2px #b00020;
  background-color: #ffe6e6;
}

/* caixa coas mensaxes de erro, enriba dos botóns */
.erros {
  padding: 0.4rem 1rem;
  border-left: 4px solid #b00020;
  background-color: #ffe6e6;
}

.mensaxe-erro {
  margin: 0.2rem 0;
  font-size: 0.85rem;
  color: #b00020;
}

/* asterisco de campo obrigatorio */
.obrigatorio {
  color: #b00020;
  margin-left: 0.15rem;
}

/* ---------- fila de gardar: checkbox enriba do botón, centrados; nota á dereita ---------- */
.fila-gardar {
  position: relative;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
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

/* Gardar e Eliminar un ao lado do outro */
.botons-gardar {
  display: flex;
  gap: 1rem;
}

/* Eliminar: mesma forma que Gardar, en vermello (texto branco con contraste 5:1) */
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

/* Eliminar: terceiro botón, cun espazo maior antes para non premelo sen querer */
.btn-eliminar {
  margin-left: 2.5rem;
  background-color: var(--danger);
  color: white;
  border: none;
  padding: 0.4rem 1.5rem;
  cursor: pointer;
}

.btn-eliminar:disabled {
  opacity: 0.6;
  cursor: wait;
}

.btn-eliminar:hover:enabled {
  background-color: #9a3b3b;
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

.nota-obrigatorio {
  position: absolute;
  right: 0;
  bottom: 0;
  margin: 0;
  font-size: 0.7rem;
}

/* ---------- táboa ---------- */
table {
  width: 100%;
  margin-top: 1rem;
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

td:last-child {
  white-space: nowrap;
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

@media (max-width: 768px) {
  .xestion-pacientes {
    padding: 1rem;
  }

  /* apila os campos verticalmente en móbiles */
  .fila {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
