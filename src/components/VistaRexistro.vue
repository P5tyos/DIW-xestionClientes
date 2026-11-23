<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <!-- páxina de rexistro: mesmo panel estreito centrado que a de acceso -->
  <TarxetaPanel class="mx-auto w-full max-w-md text-left">
    <TituloSeccion><UserPlus class="size-5" aria-hidden="true" /> Rexistro de usuario</TituloSeccion>

    <!-- de momento só o esqueleto: non se garda nada (falta o backend de usuarios) -->
    <form class="flex flex-col gap-4" @submit.prevent="rexistrar">
      <!-- o usuario identifícase co seu DNI/NIE (petición do profesor); centrado, coma todos os DNI.
           autocomplete: "username" e "new-password" fan que os xestores de contrasinais ofrezan xerar e gardar un -->
      <CampoFormulario id="dni" etiqueta="DNI/NIE" obrigatorio v-slot="{ clases }">
        <input id="dni" v-model="dni" type="text" autocomplete="username" required :class="[clases, 'text-center']" />
      </CampoFormulario>

      <CampoFormulario id="contrasinal" etiqueta="Contrasinal" obrigatorio v-slot="{ clases }">
        <input
          id="contrasinal"
          v-model="contrasinal"
          :type="verContrasinal ? 'text' : 'password'"
          autocomplete="new-password"
          required
          :class="clases"
          @input="revalidar"
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

      <CampoFormulario id="repetir-contrasinal" etiqueta="Repetir contrasinal" obrigatorio :erro="nonCoinciden" v-slot="{ clases }">
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
      <CaixaErros v-if="nonCoinciden">
        <p id="repetir-erro" role="alert">Os dous contrasinais teñen que ser iguais.</p>
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

import { ref } from "vue";
import { UserPlus, Eye, EyeOff } from "lucide-vue-next";
import { alertaInfo } from "../utils/alertas.js";
import TarxetaPanel from "./comun/TarxetaPanel.vue";
import TituloSeccion from "./comun/TituloSeccion.vue";
import CampoFormulario from "./comun/CampoFormulario.vue";
import BotonAccion from "./comun/BotonAccion.vue";
import CaixaErros from "./comun/CaixaErros.vue";

const dni = ref(""); // DNI/NIE escrito (é o nome de usuario)
const contrasinal = ref(""); // contrasinal escrito
const repetirContrasinal = ref(""); // o contrasinal escrito outra vez
const verContrasinal = ref(false); // true = os contrasinais vense en texto normal
const nonCoinciden = ref(false); // true = móstrase o erro "teñen que ser iguais"

/// Zona de métodos ou funcións

// botón Crear conta: comproba que os contrasinais coinciden; o rexistro real aínda non existe, así que só avisa
function rexistrar() {
  comprobarCoinciden();
  if (nonCoinciden.value) {
    return;
  }
  alertaInfo("O rexistro de usuarios aínda non está dispoñible.");
}

/// Zona de funcións auxiliares

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
</script>
