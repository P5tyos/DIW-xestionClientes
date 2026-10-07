<template>
  <div class="xestion-pacientes">
    <h3>👥  Xestión de pacientes</h3>
    <form @submit.prevent="guardarPaciente">
      <div class="fila">
        <div class="campo campo-dni">
          <label for="dni">DNI/CIF:<span class="obrigatorio" aria-hidden="true">*</span></label>
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
            @focus="documentoInvalido = false"
            @blur="validarDocumento"/>
          <!-- type="button" para que non envíe o formulario ao pulsalo -->
          <button type="button" @click="buscarPaciente" title="Buscar" aria-label="Buscar paciente por DNI">🔍</button>
          <button type="button" @click="limpiarFormpac" title="Limpar formulario" aria-label="Limpar formulario">🧹</button>
          <span v-if="documentoInvalido" id="dni-erro" class="mensaxe-erro" role="alert">DNI/NIE non válido</span>
        </div>
        <div class="campo campo-nome">
          <label for="nome">Nome:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="nome" v-model="novoPaciente.nomepac" type="text" required autocomplete="given-name"
          @blur="novoPaciente.nomepac = formatearNome(novoPaciente.nomepac)"/>
        </div>
        <div class="campo campo-apellido">
          <label for="apelido">Apelido:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="apelido" v-model="novoPaciente.apelpac" type="text" required autocomplete="family-name"
          @blur="novoPaciente.apelpac = formatearNome(novoPaciente.apelpac)"/>
        </div>
      </div>
      <div class="fila">
        <div class="campo campo-nacimiento">
          <label for="nacemento">Fecha nacemento:</label>
          <input id="nacemento" v-model="novoPaciente.nacipac" type="date" autocomplete="bday" />
        </div>
        <div class="campo campo-correo">
          <label for="correo">Correo:</label>
          <input
            id="correo"
            v-model="novoPaciente.mailpac"
            type="email"
            autocomplete="email"
            class="centrado"
            :class="{ 'campo-erro': correoInvalido }"
            :aria-invalid="correoInvalido"
            aria-describedby="correo-erro"
            @focus="correoInvalido = false"
            @blur="validarCorreo"
          />
          <span v-if="correoInvalido" id="correo-erro" class="mensaxe-erro" role="alert">Correo non válido</span>
        </div>
        <div class="campo">
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
            @focus="telefonoIncorrecto = false"
            @blur="validarTelefono"
          />
          <span v-if="telefonoIncorrecto" id="telefono-erro" class="mensaxe-erro" role="alert">Telefono non válido</span>
        </div>
      </div>
      <div class="fila">
        <div class="campo">
          <label for="direccion">Dirección:</label>
          <input id="direccion" v-model="novoPaciente.dirpac" type="text" autocomplete="street-address" />
        </div>
        <div class="campo campo-provincia">
          <label for="provincia">Provincia:</label>
          <select id="provincia" v-model="novoPaciente.propac" @change="cargarMunicipios"> <!--@change para cargar los municipios cuando se selecciona una provincia-->
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

        <button
          type="submit"
          class="btn-guardar"
          :disabled="
            novoPaciente.dnipac === '' || 
              novoPaciente.nomepac === '' ||
              novoPaciente.apelpac === '' ||
              novoPaciente.movilpac === '' ||
              !novoPaciente.lopdpac "
        >
          Gardar
        </button>
        <p class="nota-obrigatorio"><span aria-hidden="true">*</span> campo obrigatorio</p>
      </div>
    </form>
    <h3>📋 Listaxe de pacientes</h3>
    <table v-if="pacientes.length > 0">
      <caption>Listaxe de pacientes</caption>
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">DNI/CIF</th>
          <th scope="col">Nome</th>
          <th scope="col">Apelido</th>
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
        <tr v-for="(p, index) in pacientes" :key="p._id">
          <td>{{ index + 1 }}</td>
          <td class="centrado">{{ p.dnipac }}</td>
          <td>{{ p.nomepac }}</td>
          <td>{{ p.apelpac }}</td>
          <td>{{ p.nacipac }}</td>
          <td>{{ p.movilpac }}</td>
          <td>{{ p.mailpac }}</td>
          <td class="centrado">{{ p.dirpac }}</td>
          <td class="centrado">{{ p.propac }}</td>
          <td class="centrado">{{ p.munipac }}</td>
          <td class="centrado">
            <button @click="editarUsuario(index)" title="Editar" :aria-label="`Editar a ${p.nomepac} ${p.apelpac}`">✏️</button>
            <button @click="eliminarPaciente(index)" title="Eliminar" :aria-label="`Eliminar a ${p.nomepac} ${p.apelpac}`">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Non hai pacientes cargados.</p>
  </div>
</template>

<script setup>

/// Zona de declaracións

import { ref, reactive, onMounted } from "vue";
import { obtenerMunicipios, obtenerProvincias } from "../api/municipios.js";
import { 
  getPacientes, 
  savePaciente, 
  deletePaciente, 
  modifyPaciente, 
  getPacienteByDni 
} from "../api/pacientes.js";


const pacientes = ref([]); //almacena la lista de pacientes e os seus cambios
const provincias = ref([]); //almacena a lista de provincias e os seus cambios
const municipios = ref([]);

const documentoInvalido = ref(false)
const correoInvalido = ref(false)
const telefonoIncorrecto = ref(false)
const editando = ref(false);

const LETRAS_DNI = "TRWAGMYFPDXBNJZSQVHLCKE"

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

/// Zona de ciclo de vida

// ao abrir a páxina: carga as provincias e a lista de pacientes
onMounted(async() => {
  //sempre se cargan estos pacientes de exemplo ao iniciar o componente
  provincias.value = await obtenerProvincias(); //carga a lista de provincias desde a API
  pacientes.value = await getPacientes();   //carga los usuarios guardados
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

/// Zona de métodos ou funcións

// botón Gardar: modifica o paciente se estamos editando, se non créao novo
async function guardarPaciente() {
  try {
        if (editando.value){
          const pacienteModificado = await modifyPaciente(novoPaciente.dnipac, novoPaciente);
          const index = pacientes.value.findIndex (
            (p) => p.dnipac === novoPaciente.dnipac
          );

          if (index !== -1){
            pacientes.value[index] =pacienteModificado;
          }
          console.log("Paciente modificado correctamente")
        } else {
          const pacienteGuardado = await savePaciente(novoPaciente);
          pacientes.value.push(pacienteGuardado);
          console.log("Paciente gardado correctamente");
        }
      editando.value = false;  //reiniciamos el estado de edicion
  } catch (error) {
    console.error("Error ao gardar paciente:", error);
  }
  pacientes.value = await getPacientes();
}

// botón 🗑️: borra o paciente da BD e da táboa
async function eliminarPaciente(index) {
  try {
    await deletePaciente(pacientes.value[index].dnipac); //elimina o paciente da base de datos
    pacientes.value.splice(index, 1); //elimina o paciente da lista
    console.log("Paciente eliminado correctamente");
    getPacientes(); // Actualiza la lista de pacientes después de eliminar
  } catch (error) {
    console.error("Error ao eliminar paciente:", error);
  }
}

// botón ✏️: carga o paciente da táboa no formulario e activa o modo edición
async function editarUsuario(index){
  const paciente=pacientes.value[index];
  Object.assign(novoPaciente, paciente);
  //evitar que se carge el _id n el formulasrio de MongoDB
  delete novoPaciente._id;
  editando.value = true;
  await cargarMunicipios();

}

// Zona de funcións auxiliares

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

// ao saír do campo DNI: valida DNI/NIE, mostra o erro e baleira o campo se non vale
function validarDocumento() {
  const valor = novoPaciente.dnipac.trim().toUpperCase()
  const esValido = validarDNI(valor) || validarNIE(valor)

  documentoInvalido.value = valor !== "" && !esValido

  if (esValido) {
    novoPaciente.dnipac = valor
  } else {
    novoPaciente.dnipac = ""
  }
  
}

// ao saír do campo Correo: valida o formato e baleira o campo se non vale
function validarCorreo() {
  const valor = novoPaciente.mailpac.trim().toLowerCase()
  correoInvalido.value = valor !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)

  if (correoInvalido.value) {
    novoPaciente.mailpac = ""
  } else {
    novoPaciente.mailpac = valor
  }
}

// ao saír do campo Teléfono: valida que sexa un móbil de 9 cifras (6 ou 7 ao principio)
function validarTelefono() {
  const valor = novoPaciente.movilpac.trim()
  telefonoIncorrecto.value = valor !== "" && !/^[67]\d{8}$/.test(valor)
  
  if (telefonoIncorrecto.value) {
    novoPaciente.movilpac = ""
  } else {
    novoPaciente.movilpac = valor
  }
}

// pon en maiúscula a primeira letra de cada palabra (ex: "ana maría" → "Ana María")
function formatearNome(valor) {
  return valor
    .split(" ")
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(" ")
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
  documentoInvalido.value = false;    // not sure of the value taht should be in dni, correo, movil
  correoInvalido.value = false ; 
  telefonoIncorrecto.value = false ;
};

// botón 🔍: busca o paciente polo DNI na BD e cárgao no formulario para editalo
async function buscarPaciente() {
  try {
    const dni = novoPaciente.dnipac.trim();
    if (!dni) {
      console.log ("introduce un dni!");
      return ;
    }
    const paciente= await getPacienteByDni(dni);
    Object.assign(novoPaciente, paciente);
    //evitar que se carge el _id de MongoDB no formulario
    delete novoPaciente._id;
    editando.value = true;
    await cargarMunicipios();

    console.log("Paciente encontrad", paciente);
  } catch(error){
      if (error.response?.status === 404 ){
        console.log("Paciente no encontrad");
      } else {
        console.log("Error al buscar paciente:",error)
      }
  }
}

</script>

<style scoped>
.xestion-pacientes {
  width: 100%;
  background: white;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

h3 {
  margin-bottom: 1rem;
  font-weight: 600;
  background-color: #46ce8a;
  color: white;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* campos máis anchos */
.campo-dni,
.campo-nome,
.campo-apellido {
  flex: 3;
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

.campo label {
  min-width: 80px; /* ancho fixo para aliñar */
  font-weight: 500;
}

.campo-nacimiento label {
  white-space: nowrap;
}

.campo input {
  flex: 1;
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

.centrado {
  text-align: center;
}

/* ---------- validación ---------- */
input.campo-erro {
  border-color: #b00020;
  background-color: #ffe6e6;
}

.mensaxe-erro {
  font-size: 0.8rem;
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
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.4rem 1.5rem;
  cursor: pointer;
}

.btn-guardar:hover:enabled {
  background-color: #0056b3;
}

.btn-guardar:disabled {
  background-color: #e0e0e0;
  color: #999;
  cursor: not-allowed;
  opacity: 0.7;
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
  border: 1px solid #ddd;
}

th,
td {
  border: 1px solid #ddd;
  padding: 0.7rem;
}

th {
  background-color: #f8f9fa;
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
