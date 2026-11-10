<template>
  <div class="xestion-doctores">
    <h3>🩺 Xestión de doctores</h3>
    <form @submit.prevent="guardarDoctor">
      <!-- fila 1: ID, apelido, nome e colexiado -->
      <div class="fila">
        <div class="campo campo-id">
          <label for="id">ID:</label>
          <!-- o ID é o _id que xera MongoDB: baleiro nun doctor novo, vese ao cargar un (✏️) e non se pode editar -->
          <input id="id" v-model="novoDoctor._id" type="text" disabled class="centrado" />
          <!-- type="button" para que non envíe o formulario ao pulsalo -->
          <button type="button" @click="limparConConfirmacion" title="Limpar formulario" aria-label="Limpar formulario">
            🧹
          </button>
        </div>
        <div class="campo campo-apellido">
          <label for="apelido">Apelido:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="apelido" v-model="novoDoctor.apeldoc" type="text" required autocomplete="family-name"
            @blur="novoDoctor.apeldoc = formatearNome(novoDoctor.apeldoc)" />
        </div>
        <div class="campo campo-nome">
          <label for="nome">Nome:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="nome" v-model="novoDoctor.nomedoc" type="text" required autocomplete="given-name"
            @blur="novoDoctor.nomedoc = formatearNome(novoDoctor.nomedoc)" />
        </div>
        <!-- fieldset + legend: os lectores de pantalla len "Colexiado" antes de Si/Non.
             Nun doctor novo non hai ningún marcado (coledoc: null): hai que elixir, e baleiro non filtra -->
        <fieldset class="campo campo-colexiado">
          <legend>
            Colexiado:<span class="obrigatorio" aria-hidden="true">*</span>
          </legend>
          <label><input v-model="novoDoctor.coledoc" type="radio" name="coledoc" :value="true" />
            Si</label>
          <label><input v-model="novoDoctor.coledoc" type="radio" name="coledoc" :value="false" />
            Non</label>
        </fieldset>
      </div>
      <!-- fila 2: teléfono, correo e especialidade -->
      <!-- validación: o erro aparece ao saír do campo (@blur); mentres hai erro, revalídase con cada tecla (@input)
           e desaparece en canto o valor é correcto. O valor escrito nunca se borra -->
      <div class="fila">
        <div class="campo campo-telefono">
          <label for="telefono">Telefono:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input
            id="telefono"
            v-model="novoDoctor.movildoc"
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
        <div class="campo campo-correo">
          <label for="correo">Correo:</label>
          <input
            id="correo"
            v-model="novoDoctor.maildoc"
            type="email"
            autocomplete="email"
            :class="{ 'campo-erro': correoInvalido }"
            :aria-invalid="correoInvalido"
            aria-describedby="correo-erro"
            @blur="validarCorreo"
            @input="correoInvalido && validarCorreo()"
          />
        </div>
        <div class="campo campo-especialidade">
          <label for="especialidade">Especialidade:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <select id="especialidade" v-model="novoDoctor.espedoc" required>
            <option value="">Selecciona unha especialidade</option>
            <option v-for="especialidade in especialidades" :key="especialidade.id" :value="especialidade.nm">
              {{ especialidade.nm }}
            </option>
          </select>
        </div>
      </div>
      <div class="fila fila-gardar">
        <!-- mensaxes de erro: xuntas enriba de Gardar, cun exemplo válido.
             Teñen os id aos que apunta o aria-describedby de cada input -->
        <div v-if="correoInvalido || telefonoIncorrecto" class="erros">
          <p v-if="correoInvalido" id="correo-erro" class="mensaxe-erro" role="alert">
            Correo non válido. Exemplo: usuario@exemplo.com
          </p>
          <p v-if="telefonoIncorrecto" id="telefono-erro" class="mensaxe-erro" role="alert">
            Teléfono non válido: 9 cifras empezando por 6 ou 7. Exemplo: 612345678
          </p>
        </div>

        <!-- Gardar e Eliminar na mesma liña -->
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
          <!-- Eliminar só aparece cando hai un doctor cargado no formulario (✏️);
               type="button" para que non envíe o formulario (se non, tamén gardaría) -->
          <button
            v-if="editando"
            type="button"
            class="btn-eliminar"
            title="Eliminar"
            :disabled="gardando"
            @click="eliminarDoctorCargado"
          >
            Eliminar
          </button>
        </div>

        <p class="nota-obrigatorio">
          <span aria-hidden="true">*</span> campo obrigatorio
        </p>
      </div>
    </form>
    <!-- título da listaxe co botón para xerar o PDF da listaxe (filtrada) -->
    <div class="cabecera-listado">
      <h3>📋 Listaxe de doctores</h3>
      <button
        type="button"
        class="btn-pdf"
        :disabled="doctoresFiltrados.length === 0"
        @click="exportarDoctores"
      >
        🖨️ PDF
      </button>
    </div>
    <!-- mentres non se edita, o que se escribe no formulario filtra a táboa -->
    <p v-if="filtroActivo" class="info-filtro">
      Mostrando {{ doctoresFiltrados.length }} de {{ doctores.length }} doctores (filtrados polo formulario)
    </p>
    <table v-if="doctoresFiltrados.length > 0">
      <caption>
        Listaxe de doctores
      </caption>
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">ID</th>
          <th scope="col">Apelido</th>
          <th scope="col">Nome</th>
          <th scope="col">Colexiado</th>
          <th scope="col">Telefono</th>
          <th scope="col">Especialidade</th>
          <th scope="col">Accións</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(d, index) in doctoresFiltrados" :key="d._id">
          <!-- números e códigos (nº, ID, teléfono) centrados; o texto queda á esquerda -->
          <td class="centrado">{{ index + 1 }}</td>
          <td class="centrado">{{ d._id }}</td>
          <td>{{ d.apeldoc }}</td>
          <td>{{ d.nomedoc }}</td>
          <td>{{ d.coledoc ? "Si" : "Non" }}</td>
          <td class="centrado">{{ d.movildoc }}</td>
          <td>{{ d.espedoc }}</td>
          <td class="centrado">
            <!-- doctores.indexOf(d): a posición na listaxe completa (co filtro, o index da fila non é o mesmo) -->
            <button @click="editarDoctor(doctores.indexOf(d))" title="Editar" :aria-label="`Editar a ${d.nomedoc} ${d.apeldoc}`">
              ✏️
            </button>
            <button @click="eliminarDoctor(doctores.indexOf(d))" title="Eliminar"
              :aria-label="`Eliminar a ${d.nomedoc} ${d.apeldoc}`">
              🗑️
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else-if="filtroActivo">Ningún doctor coincide co filtro.</p>
    <p v-else>Non hai doctores cargados.</p>
  </div>
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
  if (novoDoctor.coledoc === null) falta.push("Colexiado");
  if (novoDoctor.movildoc.trim() === "") falta.push("Teléfono");
  if (novoDoctor.espedoc === "") falta.push("Especialidade");
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

<style scoped>
.xestion-doctores {
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

/* ID: ancho fixo para os 24 caracteres do _id de MongoDB (ex: 6acf2774877a95157e0a6358) */
.campo-id {
  flex: 0 0 auto;
}

.campo-id input {
  flex: none;
  width: 15em;
}

/* teléfono (9 cifras): ancho fixo, non encolle; o espazo que sobra vai para o correo */
.campo-telefono {
  flex: 0 0 auto;
}

.campo-telefono input {
  flex: none;
  width: 11em; /* sitio para 13 caracteres (prefixo internacional: 0034612345678) */
}

.campo-correo {
  flex: 2;
}

/* o selector só ocupa o que mide */
.campo-especialidade {
  flex: 0 0 auto;
  padding: 0.5rem 0;
}

/* ancho fixo = o da especialidade máis longa ("Medicina Preventiva y Salud Pública") */
#especialidade {
  width: 19.5em;
}

.campo label {
  min-width: 80px;
  /* ancho fixo para aliñar */
  font-weight: 500;
}

/* a label "ID:" só ocupa o que mide (sen o ancho mínimo de 80px das outras, que deixaba un oco);
   vai despois de .campo label para gañarlle */
.campo-id label {
  min-width: auto;
}

.campo input {
  flex: 1;
  min-width: 0;
  padding: 0.5rem;
  border: 1px solid #767676;
  /* contraste mínimo 3:1 para que se vexa o campo */
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

/* o fieldset dos radio sen o marco por defecto do navegador; só ocupa o que miden Si/Non */
.campo-colexiado {
  flex: 0 0 auto;
  border: none;
  margin: 0;
  padding: 0;
}

.campo-colexiado legend {
  float: left;
  /* a legend na mesma liña que os radio */
  min-width: 80px;
  font-weight: 500;
}

/* Si / Non non necesitan o ancho fixo das outras labels (vai despois de .campo label para gañarlle) */
.campo-colexiado label {
  min-width: auto;
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

/* ---------- fila de gardar: erros enriba dos botóns, centrados; nota á dereita ---------- */
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
  .xestion-doctores {
    padding: 1rem;
  }

  /* apila os campos verticalmente en móbiles */
  .fila {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
