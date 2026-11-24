<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <!-- páxina de rexistro: mesmo panel estreito centrado que a de acceso -->
  <TarxetaPanel class="mx-auto w-full max-w-md text-left">
    <TituloSeccion><UserPlus class="size-5" aria-hidden="true" /> Rexistro de usuario</TituloSeccion>

    <!-- de momento só o esqueleto: non se garda nada (falta o backend de usuarios) -->
    <form class="flex flex-col gap-4" @submit.prevent="rexistrar">
      <!-- o usuario identifícase co seu DNI/NIE (petición do profesor); centrado, coma todos os DNI.
           autocomplete: "username" e "new-password" fan que os xestores de contrasinais ofrezan xerar e gardar un -->
      <CampoFormulario id="dni" etiqueta="DNI/NIE" :erro="documentoInvalido" v-slot="{ clases }">
        <input
          id="dni"
          v-model="dni"
          type="text"
          autocomplete="username"
          required
          :class="[clases, 'text-center']"
          :aria-invalid="documentoInvalido"
          aria-describedby="dni-erro"
          @blur="validarDocumento"
          @input="documentoInvalido && validarDocumento()"
        />
      </CampoFormulario>

      <!-- correo obrigatorio: serve para axudar ao usuario se esquece o contrasinal -->
      <CampoFormulario id="correo" etiqueta="Correo" :erro="correoInvalido" v-slot="{ clases }">
        <input
          id="correo"
          v-model="correo"
          type="email"
          autocomplete="email"
          required
          :class="clases"
          :aria-invalid="correoInvalido"
          aria-describedby="correo-erro"
          @blur="validarCorreo"
          @input="correoInvalido && validarCorreo()"
        />
      </CampoFormulario>

      <CampoFormulario id="contrasinal" etiqueta="Contrasinal" :erro="contrasinalNonValido" v-slot="{ clases }">
        <input
          id="contrasinal"
          v-model="contrasinal"
          :type="verContrasinal ? 'text' : 'password'"
          autocomplete="new-password"
          required
          :class="clases"
          :aria-invalid="contrasinalNonValido"
          :aria-describedby="contrasinalNonValido ? 'contrasinal-erro' : undefined"
          @blur="comprobarContrasinal"
          @input="revalidarContrasinal"
        />
        <!-- 👁 mostra ou oculta os dous contrasinais á vez; aria-pressed di se están visibles -->
        <BotonAccion
          variante="icona"
          class="shrink-0"
          :aria-pressed="verContrasinal"
          :aria-label="verContrasinal ? 'Ocultar os contrasinais' : 'Mostrar os contrasinais'"
          :title="verContrasinal ? 'Ocultar os contrasinais' : 'Mostrar os contrasinais'"
          @click="verContrasinal = !verContrasinal"
        >
          <EyeOff v-if="verContrasinal" class="size-5" aria-hidden="true" />
          <Eye v-else class="size-5" aria-hidden="true" />
        </BotonAccion>
      </CampoFormulario>

      <CampoFormulario id="repetir-contrasinal" etiqueta="Repetir contrasinal" :erro="nonCoinciden" v-slot="{ clases }">
        <input
          id="repetir-contrasinal"
          v-model="repetirContrasinal"
          :type="verContrasinal ? 'text' : 'password'"
          autocomplete="new-password"
          required
          :aria-invalid="nonCoinciden"
          :aria-describedby="nonCoinciden ? 'repetir-erro' : undefined"
          :class="clases"
          @blur="comprobarCoinciden"
          @input="revalidar"
        />
      </CampoFormulario>

      <!-- erro enriba do botón (coma nos outros formularios) -->
      <CaixaErros v-if="documentoInvalido || correoInvalido || contrasinalNonValido || nonCoinciden">
        <p v-if="documentoInvalido" id="dni-erro" role="alert">
          DNI/NIE non válido. Exemplo: 12345678Z ou X1234567L
        </p>
        <p v-if="correoInvalido" id="correo-erro" role="alert">
          Correo non válido. Exemplo: usuario@exemplo.com
        </p>
        <p v-if="contrasinalNonValido" id="contrasinal-erro" role="alert">
          O contrasinal debe ter polo menos 6 caracteres.
        </p>
        <p v-if="nonCoinciden" id="repetir-erro" role="alert">Os dous contrasinais teñen que ser iguais.</p>
      </CaixaErros>

      <BotonAccion tipo="submit" class="w-full">Crear conta</BotonAccion>

      <!-- volver ao acceso -->
      <p class="text-center text-sm">
        Xa tes conta? <RouterLink to="/acceso" class="text-acento underline hover:text-acento-escuro">Accede</RouterLink>
      </p>
    </form>
  </TarxetaPanel>
</template>

<script setup>

/// Zona de declaracións

import { Eye, EyeOff, UserPlus } from "lucide-vue-next";
import { ref } from "vue";
import { alertaInfo } from "../utils/alertas.js";
import BotonAccion from "./comun/BotonAccion.vue";
import CaixaErros from "./comun/CaixaErros.vue";
import CampoFormulario from "./comun/CampoFormulario.vue";
import TarxetaPanel from "./comun/TarxetaPanel.vue";
import TituloSeccion from "./comun/TituloSeccion.vue";

const dni = ref("");                    // DNI/NIE escrito (é o nome de usuario)
const correo = ref("");                 // correo escrito (para recuperar o contrasinal)
const contrasinal = ref("");            // contrasinal escrito
const repetirContrasinal = ref("");     // o contrasinal escrito outra vez
const verContrasinal = ref(false);      // true = os contrasinais vense en texto normal
const nonCoinciden = ref(false);        // true = móstrase o erro "teñen que ser iguais"
const documentoInvalido = ref(false);   // true = móstrase o erro do DNI/NIE
const correoInvalido = ref(false);      // true = móstrase o erro do correo
const contrasinalNonValido = ref(false);// true = móstrase o erro "polo menos 6 caracteres"
const LETRAS_DNI = "TRWAGMYFPDXBNJZSQVHLCKE";// letra de control segundo o resto de dividir entre 23

/// Zona de métodos ou funcións

// botón Crear conta: valida o DNI/NIE, o correo e o contrasinal; o rexistro real aínda non existe, así que só avisa.
// Valídanse tamén aquí porque, se se preme Enter dentro dun campo, o @blur non se executa
function rexistrar() {
  validarDocumento();
  validarCorreo();
  comprobarContrasinal();
  comprobarCoinciden();
  if (documentoInvalido.value || correoInvalido.value || nonCoinciden.value || contrasinalNonValido.value) {
    return;
  }
  alertaInfo("O rexistro de usuarios aínda non está dispoñible.");
}


/// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX Zona de funcións auxiliares XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX 

function comprobarContrasinal() {
  if (contrasinal.value === "") {
    return;
  }
  contrasinalNonValido.value = contrasinal.value.length < 6;
}

// revalida o contrasinal cando xa se amosou o erro e actualiza tamén a coincidencia
function revalidarContrasinal() {
  if (contrasinalNonValido.value) {
    comprobarContrasinal();
  }
  revalidar();
}

// ao saír de "Repetir contrasinal": marca o erro se non coincide co primeiro (baleiro non se marca: aínda non se escribiu)
function comprobarCoinciden() {
  if (repetirContrasinal.value !== "") {
    nonCoinciden.value = repetirContrasinal.value !== contrasinal.value;
  }
}

// mentres se escribe, se o erro xa se mostra, compróbase de novo para que desapareza en canto coincidan
function revalidar() {
  if (nonCoinciden.value) {
    nonCoinciden.value = repetirContrasinal.value !== contrasinal.value;
  }
}


// comproba que un DNI (8 números + letra) ten a letra correcta
function validarDNI(valor) {
  if (!/^\d{8}[A-Z]$/.test(valor)) return false;
  const numero = parseInt(valor.slice(0, 8), 10);
  return valor.charAt(8) === LETRAS_DNI[numero % 23];
}

// comproba que un NIE (X/Y/Z + 7 números + letra) ten a letra correcta
function validarNIE(valor) {
  if (!/^[XYZ]\d{7}[A-Z]$/.test(valor)) return false;
  const prefixo = { X: "0", Y: "1", Z: "2" }[valor.charAt(0)];
  const numero = parseInt(prefixo + valor.slice(1, 8), 10);
  return valor.charAt(8) === LETRAS_DNI[numero % 23];
}

// valida o DNI/NIE (campo obrigatorio). Non borra o que escribiu o usuario: só marca o erro.
// Se está baleiro non cambia nada: un campo sen tocar non se marca, e un erro xa visible
// mantense ata que se escriba un DNI/NIE correcto
function validarDocumento() {
  const valor = dni.value.trim().toUpperCase();
  if (valor === "") {
    return;
  }
  documentoInvalido.value = !(validarDNI(valor) || validarNIE(valor));
  if (!documentoInvalido.value) {
    dni.value = valor; // se é correcto gardámolo normalizado (en maiúsculas e sen espazos)
  }
}

// valida o correo (campo obrigatorio). Non borra o que escribiu o usuario: só marca o erro.
// Igual que o DNI: baleiro non cambia nada, e un erro xa visible mantense ata que o correo sexa correcto
function validarCorreo() {
  const valor = correo.value.trim().toLowerCase();
  if (valor === "") {
    return;
  }
  correoInvalido.value = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  if (!correoInvalido.value) {
    correo.value = valor; // se é correcto gardámolo normalizado (en minúsculas e sen espazos)
  }
}

</script>
