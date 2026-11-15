<template>
  <div class="w-full px-4 py-8 text-left md:px-8 md:py-12">
    <TarxetaPanel>
      <TituloSeccion>Tarifas</TituloSeccion>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <caption class="sr-only">Tarifas dos servizos</caption>
          <thead class="bg-acento-suave text-titulo">
            <tr>
              <th scope="col" class="border border-acento-claro p-3 font-semibold">Servizo</th>
              <th scope="col" class="border border-acento-claro p-3 font-semibold">Concepto</th>
              <th scope="col" class="border border-acento-claro p-3 font-semibold">Prezo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in tarifas" :key="t.id" class="bg-white">
              <td class="border border-acento-claro p-3">{{ t.servizo }}</td>
              <td class="border border-acento-claro p-3">{{ t.concepto }}</td>
              <td class="border border-acento-claro p-3 text-right">{{ t.prezo }} €</td>
            </tr>
          </tbody>
        </table>
      </div>
    </TarxetaPanel>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { obtenerTarifas } from "../api/tarifas.js";
import TarxetaPanel from "./comun/TarxetaPanel.vue";
import TituloSeccion from "./comun/TituloSeccion.vue";

// as tarifas que chegan do backend (baleiro ata que chegan)
const tarifas = ref([]);

// ao abrir a páxina: pedimos as tarifas ao backend
onMounted(async () => {
  tarifas.value = await obtenerTarifas();
});
</script>