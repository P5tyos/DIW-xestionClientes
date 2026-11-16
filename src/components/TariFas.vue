<!-- eslint-disable vue/singleline-html-element-content-newline -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="w-full px-4 py-8 text-left md:px-8 md:py-12">
    <TarxetaPanel>
      <TituloSeccion>Tarifas</TituloSeccion>
      <label class="mb-4 flex items-center gap-2 text-sm">
        Servizo:
        <select v-model="filtroServizo" class="h-10 rounded-md border border-borde bg-white px-3">
          <option value="">Todos</option>
          <option value="Consulta médica">Consulta médica</option>
          <option value="Pediatría">Pediatría</option>
          <option value="Enfermería">Enfermería</option>
          <option value="Análises clínicas">Análises clínicas</option>
        </select>
      </label>
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
            <tr v-for="t in tarifasFiltradas" :key="t.id" class="bg-white">
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
import { ref, onMounted, computed } from "vue";
import { obtenerTarifas } from "../api/tarifas.js";
import TarxetaPanel from "./comun/TarxetaPanel.vue";
import TituloSeccion from "./comun/TituloSeccion.vue";

// as tarifas que chegan do backend (baleiro ata que chegan)
const tarifas = ref([]);
const filtroServizo = ref('');

// ao abrir a páxina: pedimos as tarifas ao backend
onMounted(async () => {
  tarifas.value = await obtenerTarifas();
});
  
// as tarifas que pasan o filtro (todas se o filtro está baleiro)
const tarifasFiltradas = computed(() =>
  tarifas.value.filter((t) => filtroServizo.value === '' || t.servizo === filtroServizo.value )
);

</script>