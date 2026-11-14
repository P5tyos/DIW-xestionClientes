<!--Step 1 create the vue file. and populate it with the minimum. 
    copy the nearest match from other files-->

<template>
  <div class="w-full px-4 py-8 text-left md:px-8 md:py-12">
    <TarxetaPanel class="mb-6 text-center">
      <h1 class="mb-4 text-4xl font-semibold text-titulo">Servicios médicos</h1>
      <p class="leading-relaxed">
        Elige el servicio que necesitas y te contamos en qué consiste.
      </p>
    </TarxetaPanel>
    <!-- step 4.2B  adding ther html that will show the data.
     un botón por servizo -->
    <div class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <!-- step 5.2  adding a "button" to show the selected data: depending on the value of "selecionado". -->
      <button
        v-for="servizo in servizos"
        :key="servizo.id"
        type="button"
        class="rounded-md p-3 text-center shadow-md"
        :class="seleccionado.id === servizo.id ? 'bg-acento text-white' : 'bg-white text-titulo'"
        :aria-pressed="seleccionado.id === servizo.id"
        @click="seleccionado = servizo"
      >
        <span class="block font-semibold">{{ servizo.nome }}</span>
        <span class="block text-sm">{{ servizo.subtitulo }}</span>
      </button>
    </div>
    <!-- step 6.2: load the data the medical service currently selected according to the seleccionado variable
    detalle do servizo escollido -->
    <TarxetaPanel>
      <h2 class="mb-2 text-2xl font-semibold text-titulo">
        {{ seleccionado.nome }} · {{ seleccionado.subtitulo }}
      </h2>
      <p class="mb-4 leading-relaxed">{{ seleccionado.descricion }}</p>

      <h3 class="mb-2 font-semibold text-titulo">Incluye</h3>
      <ul class="mb-6 list-disc space-y-2 pl-5 leading-relaxed">
        <li v-for="cousa in seleccionado.inclue" :key="cousa">{{ cousa }}</li>
      </ul>

      <BotonAccion to="/xestion-citas">Pedir cita</BotonAccion>
    </TarxetaPanel>
  </div>
</template>

<script setup>
import TarxetaPanel from "./comun/TarxetaPanel.vue";
import { servizos } from "../data/servizos.js"; //step 4.2 tell this file, where the data lives
import { ref } from "vue";
import BotonAccion from "./comun/BotonAccion.vue"; //step 6.1 inport a commun element

// step 5.1 : implement a variable that remembers which option is clicked/selected by the user
// o servizo escollido agora mesmo (ao entrar, o primeiro)
const seleccionado = ref(servizos[0]);   

</script>