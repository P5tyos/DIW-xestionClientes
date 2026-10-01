<template>
  <div class="xestion-pacientes">
    <h4>👥 Xestión de pacientes</h4>
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
            style="text-align: center;"
            :class="{ 'campo-erro': documentoInvalido }"
            :aria-invalid="documentoInvalido"
            aria-describedby="dni-erro"
            @focus="documentoInvalido = false"
            @blur="validarDocumento"/>
          <!-- type="button" para que non envíe o formulario ao pulsalo -->
          <button type="button" class="btn-buscar" title="Buscar" aria-label="Buscar paciente por DNI">
            <img src="../assets/buscar.png" alt="" class="icono-boton" />
          </button>
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
          <label for="correo">Correo:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input
            id="correo"
            v-model="novoPaciente.mailpac"
            type="email"
            required
            autocomplete="email"
            style="text-align: center;"
            :class="{ 'campo-erro': correoInvalido }"
            :aria-invalid="correoInvalido"
            aria-describedby="correo-erro"
            @focus="correoInvalido = false"
            @blur="validarCorreo"
          />
          <span v-if="correoInvalido" id="correo-erro" class="mensaxe-erro" role="alert">Correo non válido</span>
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
            style="text-align: center;"
            :class="{'campo-erro' : telefonoIncorrecto }"
            :aria-invalid="telefonoIncorrecto"
            aria-describedby="telefono-erro"
            @focus="telefonoIncorrecto = false"
            @blur="validarTelefono"
          />
          <span v-if="telefonoIncorrecto" id="telefono-erro" class="mensaxe-erro" role="alert">Telefono non válido</span>
        </div>
      </div>
      <div class="fila">
        <div class="campo campo-direccion">
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
        <button
          type="submit"
          class="btn-guardar"
          :disabled="novoPaciente.dnipac === '' || novoPaciente.nomepac === ''"
        >
          Gardar
        </button>
        <p class="nota-obrigatorio"><span aria-hidden="true">*</span> campo obrigatorio</p>
      </div>
    </form>
    <h4>📋 Listaxe de pacientes</h4>
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
            <button @click="editarPaciente(index)" title="Editar" :aria-label="`Editar a ${p.nomepac} ${p.apelpac}`">✏️</button>
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
import { getPacientes, savePaciente, deletePaciente } from "../api/pacientes.js";


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
        //pacientes.value = await getPacientes(); // Actualiza la lista de pacientes después de guardar

  } catch (error) {
    console.error("Error ao gardar paciente:", error);
  }
}

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

  documentoInvalido.value = valor !== "" && !esValido

  if (esValido) {
    novoPaciente.dnipac = valor
  } else {
    novoPaciente.dnipac = ""
  }
  
}
function validarCorreo() {
  const valor = novoPaciente.mailpac.trim().toLowerCase()
  correoInvalido.value = valor !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)

  if (correoInvalido.value) {
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

.campo-direccion {
  flex: 1;
  /* ocupa menos espacio */
  border-radius: 0px;
}

.campo label {
  min-width: 80px;
  /* ancho fijo para alinear */
  font-weight: 500;
}
.campo-municipio {
  flex: 0 0 auto;
  /* só ocupa o que mide o selector, o resto queda para a dirección */
  border-radius: 0px;
  padding: 0.5rem 0;
}
.campo-provincia {
  flex: 0 0 auto;
  /* só ocupa o que mide o selector, o resto queda para a dirección */
  border-radius: 0px;
  padding: 0.5rem 0;
}

.campo input {
  flex: 1;
  /* ocupa todo el espacio restante */
  padding: 0.5rem;
  border: 1px solid #767676; /* contraste mínimo 3:1 para que se vexa o campo */
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
  border-color: #b00020 !important;
  background-color: #ffe6e6;
}

.mensaxe-erro {
  display: block;
  font-size: 0.8rem;
  color: #b00020;
  padding-top: 0.5%;
}

/* asterisco de campo obrigatorio */
.obrigatorio {
  color: #b00020;
  margin-left: 0.15rem;
}

/* botón da lupa: un pouco máis alto que os de editar/eliminar, sen chegar á altura do input */
.btn-buscar {
  display: flex;
  align-items: center;
  padding: 0.2rem 0.4rem;
}

/* icona da lupa: a imaxe é de 512px, reducímola ao tamaño dun emoji */
.icono-boton {
  width: 1em;
  height: 1em;
  display: block;
}

/* o botón segue centrado e a nota vai á dereita na mesma liña */
.fila-gardar {
  position: relative;
}

.nota-obrigatorio {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.7rem;
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
