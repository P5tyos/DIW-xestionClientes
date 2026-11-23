<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <!-- páxina de acceso: un panel estreito centrado (só dous campos, non precisa máis ancho) -->
  <TarxetaPanel class="mx-auto w-full max-w-md text-left">
    <TituloSeccion><LogIn class="size-5" aria-hidden="true" /> Acceso de usuario</TituloSeccion>

    <!-- de momento só o esqueleto: o envío non comproba nada (falta o backend de usuarios) -->
    <form class="flex flex-col gap-4" @submit.prevent="entrar">
      <!-- autocomplete: así o navegador e os xestores de contrasinais recoñecen o formulario de acceso -->
      <CampoFormulario id="usuario" etiqueta="Usuario" obrigatorio v-slot="{ clases }">
        <input id="usuario" v-model="usuario" type="text" autocomplete="username" required :class="clases" />
      </CampoFormulario>

      <CampoFormulario id="contrasinal" etiqueta="Contrasinal" obrigatorio v-slot="{ clases }">
        <input
          id="contrasinal"
          v-model="contrasinal"
          :type="verContrasinal ? 'text' : 'password'"
          autocomplete="current-password"
          required
          :class="clases"
        />
        <!-- 👁 mostra ou oculta o contrasinal; aria-pressed di se está visible -->
        <BotonAccion
          variante="icona"
          class="shrink-0"
          :aria-pressed="verContrasinal"
          :aria-label="verContrasinal ? 'Ocultar o contrasinal' : 'Mostrar o contrasinal'"
          :title="verContrasinal ? 'Ocultar o contrasinal' : 'Mostrar o contrasinal'"
          @click="verContrasinal = !verContrasinal"
        >
          <EyeOff v-if="verContrasinal" class="size-5" aria-hidden="true" />
          <Eye v-else class="size-5" aria-hidden="true" />
        </BotonAccion>
      </CampoFormulario>

      <!-- lembrar sesión á esquerda, contrasinal esquecido á dereita (no móbil, se non caben, un debaixo do outro) -->
      <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
        <label class="flex items-center gap-2">
          <input v-model="lembrar" type="checkbox" class="size-5 accent-acento" /> Lembrar a sesión
        </label>
        <!-- aínda non hai páxina para recuperalo: é un botón con aspecto de ligazón que avisa diso -->
        <button type="button" class="text-acento underline hover:text-acento-escuro" @click="contrasinalEsquecido">
          Esqueciches o contrasinal?
        </button>
      </div>

      <BotonAccion tipo="submit" class="w-full">Entrar</BotonAccion>
    </form>
  </TarxetaPanel>
</template>

<script setup>

/// Zona de declaracións

import { ref } from "vue";
import { LogIn, Eye, EyeOff } from "lucide-vue-next";
import { alertaInfo } from "../utils/alertas.js";
import TarxetaPanel from "./comun/TarxetaPanel.vue";
import TituloSeccion from "./comun/TituloSeccion.vue";
import CampoFormulario from "./comun/CampoFormulario.vue";
import BotonAccion from "./comun/BotonAccion.vue";

const usuario = ref(""); // nome de usuario escrito
const contrasinal = ref(""); // contrasinal escrito
const verContrasinal = ref(false); // true = o contrasinal vese en texto normal
const lembrar = ref(false); // checkbox "Lembrar a sesión"

/// Zona de métodos ou funcións

// botón Entrar: de momento só avisa (o acceso real precisa usuarios e contrasinais no backend)
function entrar() {
  alertaInfo("O acceso aínda non está dispoñible.");
}

// ligazón "Esqueciches o contrasinal?": de momento só avisa
function contrasinalEsquecido() {
  alertaInfo("A recuperación do contrasinal aínda non está dispoñible.");
}
</script>
