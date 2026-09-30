<template>
  <div class="xestion-pacientes">
    <h4>👥 Xestión de pacientes</h4>
    <form @submit.prevent="guardarPaciente">
      <div class="fila">
        <div class="campo campo-dni">
          <label>DNI/CIF:</label>
          <input
            v-model="novoPaciente.dnipac"
            type="text"
            required
            style="text-align: center;"
            :class="{ 'campo-erro': documentoInvalido }"
            @blur="validarDocumento"/>
          <span v-if="documentoInvalido" class="mensaxe-erro" >DNI/NIE non válido</span>
        </div>
        <div class="campo campo-nome">
          <label>Nome:</label>
          <input v-model="novoPaciente.nomepac" type="text" required 
          @blur="novoPaciente.nomepac = formatearNome(novoPaciente.nomepac)"/>
        </div>
        <div class="campo campo-apellido">
          <label>Apelido:</label>
          <input v-model="novoPaciente.apelpac" type="text" required 
          @blur="novoPaciente.apelpac = formatearApellido(novoPaciente.apelpac)"/>
        </div>
      </div>
      <div class="fila">
        <div class="campo campo-nacimiento">
          <label>Fecha nacemento:</label>
          <input v-model="novoPaciente.nacipac" type="date" />
        </div>
        <div class="campo campo-correo">
          <label>Correo:</label>
          <input 
            v-model="novoPaciente.mailpac" 
            type="email" 
            required 
            style="text-align: center;"
            :class="{ 'campo-erro': correoInvalido }"
            @blur="validarCorreo"
          />
          <span v-if="correoInvalido" class="mensaxe-erro">Correo non válido</span>
        </div>
        <div class="campo campo-telefono">
          <label>Telefono:</label>
          <input 
            v-model="novoPaciente.movilpac" 
            type="text" 
            required
            maxlength="9"
            style="text-align: center;"
            :class="{'campo-erro' : telefonoIncorrecto }"
            @blur="validarTelefono"
          />
          <span v-if="telefonoIncorrecto" class="mensaxe-erro">Telefono non válido</span>
        </div>
      </div>
      <div class="fila">
        <div class="campo campo-direccion">
          <label>Dirección:</label>
          <input v-model="novoPaciente.dirpac" type="text" />
        </div>
        <div class="campo campo-provincia">
          <label>Provincia:</label>
          <select id="provincia" v-model="novoPaciente.propac" @change="cargarMunicipios"> //@change para cargar los municipios cuando se selecciona una provincia
            <option value="">Selecciona una provincia</option>
            <option v-for="provincia in provincias" :key="provincia.id" :value="provincia.nm">
              {{ provincia.nm }}
            </option>
          </select>
        </div>
        <div class="campo campo-municipio">
          <label>Municipio:</label>
          <select id="municipio" v-model="novoPaciente.munipac">
            <option value="">Selecciona un municipio</option>
            <option v-for="municipio in municipios" :key="municipio.id" :value="municipio.nm">
              {{ municipio.nm }}
            </option>
          </select>
        </div>
      </div>
      <div class="fila">
        <button
          type="submit"
          class="btn-guardar"
          :disabled="novoPaciente.dnipac === '' || novoPaciente.nomepac === ''"
        >
          Gardar
        </button>
      </div>
    </form>
    <h4>📋 Listaxe de pacientes</h4>
    <table v-if="pacientes.length > 0">
      <thead>
        <tr>
          <th>#</th>
          <th>DNI/CIF</th>
          <th>Nome</th>
          <th>Apelido</th>
          <th>Fecha nacemento</th>
          <th>Telefono</th>
          <th>Correo</th>
          <th>Dirección</th>
          <th>Provincia</th>
          <th>Municipio</th>
          <th>Accións</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(p, index) in pacientes" :key="index">
          <td>{{ index + 1 }}</td>
          <td style="text-align: center">{{ p.dnipac }}</td>
          <td>{{ p.nomepac }}</td>
          <td>{{ p.apelpac }}</td>
          <td>{{ p.nacipac }}</td>
          <td>{{ p.movilpac }}</td>
          <td>{{ p.mailpac }}</td>
          <td style="text-align: center">{{ p.dirpac }}</td>
          <td style="text-align: center">{{ p.propac }}</td>
          <td style="text-align: center">{{ p.munipac }}</td>
          <td style="text-align: center">
            <button @click="editarPaciente(index)" title="Editar">✏️</button>
            <button @click="eliminarPaciente(index)" title="Eliminar">🗑️</button>
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
import { getPacientes, savePaciente } from "../api/pacientes.js";


const pacientes = ref([]); //almacena la lista de pacientes e os seus cambios
const provincias = ref([]); //almacena a lista de provincias e os seus cambios
const municipios = ref([]);

const documentoInvalido = ref(false)
const correoInvalido = ref(false)
const telefonoIncorrecto = ref(false)

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
  munipac: ""
});


/// Zona de ciclo de vida

onMounted(async() => {
  //sempre se cargan estos pacientes de exemplo ao iniciar o componente
  provincias.value = await obtenerProvincias(); //carga a lista de provincias desde a API
  pacientes.value = await getPacientes();   //carga los usuarios guardados
});

// function para cargar todos los munic
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

async function guardarPaciente() {
  try {
        
    		const pacienteGuardado = await savePaciente(novoPaciente);
    		pacientes.value.push(pacienteGuardado);
    		console.log("Paciente gardado correctamente");
        pacientes.value = await getPacientes(); // Actualiza la lista de pacientes después de guardar

  } catch (error) {
    console.error("Error ao gardar paciente:", error);
  }
}

function eliminarPaciente(index) {
  pacientes.value.splice(index, 1); //elimina o paciente da lista
}

function editarPaciente(index) {
  const paciente = pacientes.value[index]; //carga os datos do paciente elixido no formulario
  Object.assign(novoPaciente, paciente); // carga os datos do paciente no formulario recorda v-model do formulario é novoPaciente
}

// Zona de funcións auxiliares
function validarDNI(valor) {
  if (!/^\d{8}[A-Z]$/.test(valor)) return false
  const numero = parseInt(valor.slice(0, 8), 10)
  return valor.charAt(8) === LETRAS_DNI[numero % 23]
}

function validarNIE(valor) {
  if (!/^[XYZ]\d{7}[A-Z]$/.test(valor)) return false
  const prefixo = { X: "0", Y: "1", Z: "2" }[valor.charAt(0)]
  const numero = parseInt(prefixo + valor.slice(1, 8), 10)
  return valor.charAt(8) === LETRAS_DNI[numero % 23]
}

function validarDocumento() {
  const valor = novoPaciente.dnipac.trim().toUpperCase()
  const esValido = validarDNI(valor) || validarNIE(valor)

  documentoInvalido.value = !esValido

  if (esValido) {
    novoPaciente.dnipac = valor
  } else {
    novoPaciente.dnipac = ""
  }
  
}
function validarCorreo() {
  const valor = novoPaciente.mailpac.trim().toLowerCase()
  novoPaciente.mailpac = valor
  
  const esValido = correoInvalido.value = valor !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)

  correoInvalido.value = esValido
  
  if (esValido) {
    novoPaciente.mailpac = ""
  } else {
    novoPaciente.mailpac = valor
  }
}

function validarTelefono() {
  const valor = novoPaciente.movilpac.trim()
  telefonoIncorrecto.value = valor !== "" && !/^[67]\d{8}$/.test(valor)
  
  if (telefonoIncorrecto.value) {
    novoPaciente.movilpac = ""
  } else {
    novoPaciente.movilpac = valor
  }
}

function formatearNome(valor) {
  return valor
    .split(" ")
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(" ")
}
function formatearApellido(valor) {
  return valor
    .split(" ")
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(" ")
}

</script>

<style scoped>
.xestion-pacientes {
  width: 100%;
  /* opcional para que no crezca demasiado en pantallas muy grandes */
  background: white;
  padding: 2rem;
  overflow: visible;
  border-radius: 2px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.fila {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.fila-centrada {
  justify-content: center;
}

.campo {
  display: flex;
  align-items: center;
  /* label e input en la misma línea */
  gap: 0.5rem;
  border-radius: 0px;
}

.campo-dni {
  flex: 3;
  /* ocupa menos espacio */
  border-radius: 0px;
}
.campo-nacimiento {
  flex: 1;
  /* ocupa menos espacio */
  border-radius: 0px;
}

.campo-nacimiento label {
  white-space: nowrap;
}

.campo-telefono {
  flex: 1;
  /* ocupa menos espacio */
  border-radius: 0px;
}

.campo-nome {
  flex: 3;
  /* ocupa más espacio */
  border-radius: 0px;
}
.campo-apellido {
  flex: 3;
  /* ocupa más espacio */
  border-radius: 0px;
}

.campo-correo {
  flex: 2;
  /* ocupa más espacio */
  border-radius: 0px;
}

.campo-telefono {
  flex: 1;
  /* ocupa menos espacio */
  border-radius: 0px;
}

.campo-direccion {
  flex: 1;
  /* ocupa menos espacio */
  border-radius: 0px;
}

.campo label {
  min-width: 80px;
  /* ancho fijo para alinear */
  font-weight: 500;
  font: bold;
}
.campo-municipio {
  flex: 1;
  /* ocupa menos espacio */
  border-radius: 0px;
  padding: 0.5rem;
}
.campo-provincia {
  flex: 1;
  /* ocupa menos espacio */
  border-radius: 0px;
  padding: 0.5rem;
}

.campo input {
  flex: 1;
  /* ocupa todo el espacio restante */
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
}

.btn-guardar {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.4rem 1.5rem;
  border-radius: 0px;
  cursor: pointer;
  margin: 0 auto;
  display: block;
}

.btn-guardar:hover {
  background-color: #0056b3;
  border-radius: 0px;
}

.button {
  background: none;
  border: 2px solid #ddd;
  cursor: pointer;
  font-size: 1rem;
}

.inline-control {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding-right: 5rem;
}

table {
  width: 100%;
  border-collapse: separate;
  margin-top: 1rem;
  font-size: 0.8rem;
  border: 1px solid #ddd;
}

th,
td {
  border: 1px solid #ddd;
  padding: 0.7rem;
  text-align: left;
}

td:last-child {
  white-space: nowrap;
}

th {
  text-align: center;
  background-color: #f8f9fa;
}

h4 {
  margin-bottom: 1rem;
  font-weight: 600;
  background-color: #068311;
  color: white;
}

input.campo-erro {
  border-color: #f28b82 !important;
  background-color: #ffe6e6;
}

.mensaxe-erro {
  display: block;
  font-size: 10px;
  color: red;
  padding-top: 0.5%;
}

@media (max-width: 768px) {
  .xestion-pacientes {
    padding: 1rem;
    /* reducir el padding en pantallas pequeñas */
  }

  .fila {
    flex-direction: column;
    /* apila los campos verticalmente en móviles */
    gap: 0.5rem;
    /* opcional: un pequeño espacio entre ellos */
  }
}
</style>
