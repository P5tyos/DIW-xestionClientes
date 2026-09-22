<template>
  <div class="xestion-pacientes">
    <h4>👥 Xestión de pacientes</h4>
    <form @submit.prevent="gardarPaciente">
      <div class="fila">
        <div class="campo campo-dni">
          <label>DNI/CIF:</label>
          <input
            v-model="novoPaciente.dni"
            type="text"
            required
            style="text-align: center;"
            :class="{ 'campo-erro': documentoInvalido }"
            @blur="validarDocumento"/>
          <span v-if="documentoInvalido" class="mensaxe-erro" >DNI/NIE non válido</span>
        </div>
        <div class="campo campo-nome">
          <label>Nome:</label>
          <input v-model="novoPaciente.nome" type="text" required 
          @blur="novoPaciente.nome = formatearNome(novoPaciente.nome)"/>
        </div>
        <div class="campo campo-apellido">
          <label>Apelido:</label>
          <input v-model="novoPaciente.apellido" type="text" required 
          @blur="novoPaciente.apellido = formatearApellido(novoPaciente.apellido)"/>
        </div>
      </div>
      <div class="fila">
        <div class="campo campo-nacimiento">
          <label>Fecha nacemento:</label>
          <input v-model="novoPaciente.nacimiento" type="date" />
        </div>
        <div class="campo campo-correo">
          <label>Correo:</label>
          <input 
            v-model="novoPaciente.correo" 
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
            v-model="novoPaciente.telefono" 
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
          <input v-model="novoPaciente.direccion" type="text" />
        </div>
        <div class="campo campo-provincia">
          <label>Provincia:</label>
          <select v-model="novoPaciente.provincia">
            <option value="">Selecciona unha provincia</option>
            <option value="A Coruña">A Coruña</option>
            <option value="Lugo">Lugo</option>
            <option value="Ourense">Ourense</option>
            <option value="Pontevedra">Pontevedra</option>
          </select> 
        </div>
        <div class="campo campo-municipio">
          <label>Municipio:</label>
          <select v-model="novoPaciente.municipio">
            <option value="">Selecciona un municipio</option>
            <optgroup v-if="novoPaciente.provincia === 'A Coruña'">
              <option value="A Coruña">A Coruña</option>
              <option value="Santiago de Compostela">Santiago de Compostela</option>
              <option value="Ferrol">Ferrol</option>
              <option value="Oleiros">Oleiros</option>
              <option value="Culleredo">Culleredo</option>
              <option value="Arteixo">Arteixo</option>
              <option value="Carballo">Carballo</option>
              <option value="Cambre">Cambre</option>
              <option value="Narón">Narón</option>
              <option value="Betanzos">Betanzos</option>
              <option value="Ames">Ames</option>
              <option value="Teo">Teo</option>
            </optgroup>
            <optgroup v-if="novoPaciente.provincia === 'Lugo'">
              <option value="Burela">Burela</option>
              <option value="Foz">Foz</option>
              <option value="Ribadeo">Ribadeo</option>
              <option value="Lugo">Lugo</option>
              <option value="Monforte de Lemos">Monforte de Lemos</option>
              <option value="Sarria">Sarria</option>
              <option value="Mondoñedo">Mondoñedo</option>
              <option value="Viveiro">Viveiro</option>
              <option value="A Pontenova">A Pontenova</option>
              <option value="A Fonsagrada">A Fonsagrada</option>
              <option value="O Vicedo">O Vicedo</option>
              <option value="O Corgo">O Corgo</option>
            </optgroup>
            <optgroup v-if="novoPaciente.provincia === 'Ourense'">
              <option value="Ourense">Ourense</option>
              <option value="Verín">Verín</option>
              <option value="O Barco de Valdeorras">O Barco de Valdeorras</option>
              <option value="Ribadavia">Ribadavia</option>
              <option value="Allariz">Allariz</option>
              <option value="Celanova">Celanova</option>
              <option value="A Rúa">A Rúa</option>
              <option value="O Carballiño">O Carballiño</option>
              <option value="Xinzo de Limia">Xinzo de Limia</option>
              <option value="A Peroxa">A Peroxa</option>
              <option value="A Mezquita">A Mezquita</option>
              <option value="A Veiga">A Veiga</option>
            </optgroup>
            <optgroup v-if="novoPaciente.provincia === 'Pontevedra'">
              <option value="Pontevedra">Pontevedra</option>
              <option value="Vigo">Vigo</option>
              <option value="Vilagarcía de Arousa">Vilagarcía de Arousa</option>
              <option value="Marín">Marín</option>
              <option value="Redondela">Redondela</option>
              <option value="Cangas">Cangas</option>
              <option value="Moaña">Moaña</option>
              <option value="Bueu">Bueu</option>
              <option value="Ponteareas">Ponteareas</option>
              <option value="O Porriño">O Porriño</option>
              <option value="A Guarda">A Guarda</option>
              <option value="Baiona">Baiona</option>
              <option value="Tui">Tui</option>
              <option value="Salceda de Caselas">Salceda de Caselas</option>
              <option value="Soutomaior">Soutomaior</option>
              <option value="Forcarei">Forcarei</option>
              <option value="A Lama">A Lama</option>
            </optgroup>
          </select> 
        </div>
      </div>
      <div class="fila">
        <button
          type="submit"
          class="btn-guardar"
          :disabled="novoPaciente.dni === '' || novoPaciente.nome === ''"
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
          <td style="text-align: center">{{ p.dni }}</td>
          <td>{{ p.nome }}</td>
          <td>{{ p.apellido }}</td>
          <td>{{ p.nacimiento }}</td>
          <td>{{ p.telefono }}</td>
          <td>{{ p.correo }}</td>
          <td style="text-align: center">{{ p.direccion }}</td>
          <td style="text-align: center">{{ p.provincia }}</td>
          <td style="text-align: center">{{ p.municipio }}</td>
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

const pacientes = ref([]); //almacena la lista de pacientes e os seus cambios

const novoPaciente = reactive({
  dni: "",
  nome: "",
  apellido: "",
  nacimiento: "",
  telefono: "",
  correo: "",
  direccion: "",
  provincia: "",
  municipio: ""
});

const documentoInvalido = ref(false)
const correoInvalido = ref(false)
const telefonoIncorrecto = ref(false)

const LETRAS_DNI = "TRWAGMYFPDXBNJZSQVHLCKE"

/// Zona de ciclo de vida

onMounted(() => {
  //sempre se cargan estos pacientes de exemplo ao iniciar o componente
  pacientes.value = [
    {
      dni: "A000000C",
      nome: "Soldaduras SL",
      apellido: "Sánchez",
      nacimiento: "1990-01-01",
      correo: "soldadura@email.com",
      telefono: "981123456",
      direccion: "Calle Principal, 123" ,
      provincia: "A Coruña",
      municipio: "A Coruña"

    },
    {
      dni: "0000000C",
      nome: "María Pérez",
      apellido: "Pérez",
      nacimiento: "1985-01-30",
      correo: "maria@email.com",
      telefono: "981654321",
      direccion: "Calle Secundaria, 456",
      provincia: "Lugo",
      municipio: "Lugo"
    },
    {
      dni: "B1234567D",
      nome: "Xosé López",
      apellido: "López",
      nacimiento: "1992-12-10",
      correo: "xose@email.com",
      provincia: "Ourense",
      telefono: "981987654",
      direccion: "Calle Terciaria, 789",
      municipio: "Ourense"
    },
    {
      dni: "C9876543E",
      nome: "Construcións Modernas",
      apellido: "Modernas",
      nacimiento: "1988-08-20",
      correo: "construcion@email.com",
      telefono: "981456789",
      direccion: "Calle Cuarta, 101",
      provincia: "Pontevedra",
      municipio: "Cangas"
    },
  ];
});

/// Zona de métodos ou funcións

function gardarPaciente() {
  pacientes.value.push({ ...novoPaciente }); //engade o novo paciente á lista (copia do obxecto)
  Object.assign(novoPaciente, {
    dni: "",
    nome: "",
    apellido: "",
    nacimiento: "",
    correo: "",
    provincia: "",
    telefono: "",
    direccion: "",
    municipio: ""
  }); //reinicia o formulario
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
  const valor = novoPaciente.dni.trim().toUpperCase()
  const esValido = validarDNI(valor) || validarNIE(valor)

  documentoInvalido.value = !esValido

  if (esValido) {
    novoPaciente.dni = valor
  } else {
    novoPaciente.dni = ""
  }
  
}
function validarCorreo() {
  const valor = novoPaciente.correo.trim().toLowerCase()
  novoPaciente.correo = valor
  
  const esValido = correoInvalido.value = valor !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)

  correoInvalido.value = esValido
  
  if (esValido) {
    novoPaciente.correo = ""
  } else {
    novoPaciente.correo = valor
  }
}

function validarTelefono() {
  const valor = novoPaciente.telefono.trim()
  telefonoIncorrecto.value = valor !== "" && !/^[67]\d{8}$/.test(valor)
  
  if (telefonoIncorrecto.value) {
    novoPaciente.telefono = ""
  } else {
    novoPaciente.telefono = valor
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
// comprobar cooreo que tenga un formato correcto(nombreusuario@dominio.com), eliminar espacios e pasar a minúsculas 
function formatearCorreo(valor) {
  return valor.trim().toLowerCase() 

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
