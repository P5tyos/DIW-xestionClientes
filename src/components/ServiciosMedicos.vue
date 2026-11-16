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
     unha tarxeta (foto + nome) por servizo: 1 por fila no móbil, 3 por fila (2 filas) desde md.
     grid-flow-row-dense: o detalle (ancho completo) vai no código xusto despois da tarxeta premida;
     "dense" fai que as tarxetas seguintes enchan antes o oco da mesma fila, así o detalle queda debaixo da fila -->
    <div class="grid grid-flow-row-dense grid-cols-1 gap-6 md:grid-cols-3">
      <template v-for="servizo in servizos" :key="servizo.id">
        <!-- step 5.2  adding a "button" to show the selected data: depending on the value of "selecionado".
             premer abre o detalle; premer outra vez na mesma tarxeta péchao -->
        <button
          :id="`tarxeta-${servizo.id}`"
          type="button"
          class="overflow-hidden rounded-xl bg-white text-left shadow-md transition hover:shadow-xl motion-safe:hover:-translate-y-1"
          :class="seleccionado?.id === servizo.id ? 'ring-3 ring-acento' : ''"
          :aria-expanded="seleccionado?.id === servizo.id"
          :aria-controls="seleccionado?.id === servizo.id ? 'detalle-servizo' : undefined"
          @click="alternarServizo(servizo, $event)"
        >
          <!-- alt="" porque a foto é decorativa: o nome do servizo xa está no texto do botón -->
          <img :src="servizo.imaxe" alt="" width="600" height="400" loading="lazy" class="h-48 w-full object-cover" />
          <span class="block p-4">
            <span class="block text-lg font-semibold text-titulo">{{ servizo.nome }}</span>
            <span class="block text-sm">{{ servizo.subtitulo }}</span>
          </span>
        </button>

        <!-- step 6.2: load the data the medical service currently selected according to the seleccionado variable
             detalle do servizo escollido: só existe para a tarxeta aberta e ocupa toda a fila (col-span-full) -->
        <TarxetaPanel v-if="seleccionado?.id === servizo.id" id="detalle-servizo" class="col-span-full">
          <div class="mb-2 flex items-start justify-between gap-4">
            <h2 class="text-2xl font-semibold text-titulo">
              {{ servizo.nome }} · {{ servizo.subtitulo }}
            </h2>
            <BotonAccion variante="icona" class="shrink-0" title="Pechar" aria-label="Pechar o detalle" @click="pecharDetalle">
              <X class="size-5" aria-hidden="true" />
            </BotonAccion>
          </div>
          <p class="mb-4 leading-relaxed">{{ servizo.descricion }}</p>

          <h3 class="mb-2 font-semibold text-titulo">Incluye</h3>
          <!-- cada cousa incluída nunha tesela verde clara: 3 en liña desde md (enchen o ancho do panel), unha por fila no móbil -->
          <ul class="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <li v-for="cousa in servizo.inclue" :key="cousa" class="flex items-start gap-2 rounded-md bg-acento-suave p-3 leading-relaxed">
              <Check class="mt-1 size-4 shrink-0 text-acento" aria-hidden="true" />
              {{ cousa }}
            </li>
          </ul>

          <BotonAccion to="/xestion-citas">Pedir cita</BotonAccion>
        </TarxetaPanel>
      </template>
    </div>
  </div>
</template>

<script setup>
import TarxetaPanel from "./comun/TarxetaPanel.vue";
import { servizos } from "../data/servizos.js"; //step 4.2 tell this file, where the data lives
import { ref, nextTick } from "vue";
import BotonAccion from "./comun/BotonAccion.vue"; //step 6.1 inport a commun element
import { X, Check } from "lucide-vue-next";

// step 5.1 : implement a variable that remembers which option is clicked/selected by the user
// o servizo aberto agora mesmo (null = ningún: ao entrar non hai detalle aberto)
const seleccionado = ref(null);

// tarxeta premida: se xa estaba aberta péchaa; se non, ábrea (e pecha a que houbese aberta)
async function alternarServizo(servizo, evento) {
  const tarxeta = evento.currentTarget; // gárdase antes do await: despois xa non está no evento
  seleccionado.value = seleccionado.value?.id === servizo.id ? null : servizo;
  // ao abrir ou pechar un detalle as tarxetas móvense: esperamos a que Vue debuxe e,
  // se a tarxeta premida quedou fóra da pantalla, desprazamos o xusto para vela
  await nextTick();
  tarxeta.scrollIntoView({ block: "nearest" });
}

// botón ✕ do detalle: pecha e devolve o foco á tarxeta (se non, o foco perderíase co panel)
function pecharDetalle() {
  const id = seleccionado.value.id;
  seleccionado.value = null;
  document.getElementById(`tarxeta-${id}`).focus();
}
</script>
