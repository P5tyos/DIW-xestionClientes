<!-- eslint-disable vue/singleline-html-element-content-newline -->
<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="w-full px-4 py-8 text-left md:px-8 md:py-12">
    <TarxetaPanel>
      <TituloSeccion>Axenda do día</TituloSeccion>

      <!-- o control do filtro (como o select de Tarifas) -->
      <!-- data á esquerda, botón PDF á dereita -->
      <div class="mb-4 flex items-center justify-between gap-2">
        <label class="flex items-center gap-2 text-sm">
          Data:
          <input
            v-model="dataEscollida"
            type="date"
            class="h-10 rounded-md border border-borde bg-white px-3"
          />
        </label>
        <BotonAccion
          variante="secundario"
          :disabled="citasDoDia.length === 0"
          @click="exportarCitas"
        >
          <Printer class="size-5" aria-hidden="true" /> PDF
        </BotonAccion>
      </div>

      <!-- franxa de días (estilo Ryanair): o escollido no medio, coas súas citas contadas -->
      <!-- no móbil só se ve o día escollido (os outros levan "hidden md:block"); 5 días dende md -->
      <div class="mb-6 flex items-center gap-2">
        <BotonAccion
          variante="icona"
          aria-label="Día anterior"
          @click="dataEscollida = sumarDias(dataEscollida, -1)"
        >
          <ChevronLeft class="size-5" aria-hidden="true" />
        </BotonAccion>
        <div class="grid flex-1 grid-cols-1 gap-2 md:grid-cols-5">
          <button
            v-for="d in dias"
            :key="d"
            type="button"
            class="rounded-md p-2 text-center shadow-md"
            :class="
              d === dataEscollida
                ? 'bg-acento text-white'
                : 'hidden bg-white text-titulo md:block'
            "
            :aria-pressed="d === dataEscollida"
            @click="dataEscollida = d"
          >
            <span class="block font-semibold">{{ diaMes(d) }}</span>
            <span class="block text-sm capitalize">{{ nomeDia(d) }}</span>
            <span class="block text-sm"
              >{{ contarCitas(d) }}
              {{ contarCitas(d) === 1 ? "cita" : "citas" }}</span
            >
          </button>
        </div>
        <BotonAccion
          variante="icona"
          aria-label="Día seguinte"
          @click="dataEscollida = sumarDias(dataEscollida, 1)"
        >
          <ChevronRight class="size-5" aria-hidden="true" />
        </BotonAccion>
      </div>

      <!-- a táboa (como a de citas); se non hai citas, a mensaxe do v-else -->
      <div v-if="citasDoDia.length > 0" class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <caption class="sr-only">
            Citas do día
          </caption>
          <thead class="bg-acento-suave text-titulo">
            <tr>
              <th
                v-for="cab in cabeceiras"
                :key="cab"
                scope="col"
                class="border border-acento-claro p-3 font-semibold"
              >
                {{ cab }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in citasDoDia" :key="c._id" class="bg-white">
              <td class="border border-acento-claro p-3 text-center">
                {{ c.hora }}
              </td>
              <td class="border border-acento-claro p-3 text-center">
                {{ c.pacienteDNI }}
              </td>
              <td class="border border-acento-claro p-3">
                {{
                  c.doctorId
                    ? `${c.doctorId.nomedoc} ${c.doctorId.apeldoc}`
                    : "(doctor eliminado)"
                }}
              </td>
              <td class="border border-acento-claro p-3">{{ c.motivo }}</td>
              <td class="border border-acento-claro p-3">{{ c.estado }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else>Non hai citas para este día.</p>
    </TarxetaPanel>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { getCitas } from "../api/citas.js"; // o mensaxeiro xa existe: non hai nada que facer no backend
import TarxetaPanel from "./comun/TarxetaPanel.vue";
import TituloSeccion from "./comun/TituloSeccion.vue";
import BotonAccion from "./comun/BotonAccion.vue";
import { ChevronLeft, ChevronRight, Printer } from "lucide-vue-next";
import { generarPDF } from "../utils/pdf.js";

// unha data de JS → texto "AAAA-MM-DD" (o formato de fecha)
function aTexto(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const hoxe = aTexto(new Date());

// "AAAA-MM-DD" + n días → outro "AAAA-MM-DD" (T12:00 = mediodía, evita sorpresas co cambio de hora)
function sumarDias(data, n) {
  const d = new Date(data + "T12:00");
  d.setDate(d.getDate() + n);
  return aTexto(d);
}

// a franxa de 5 días: 2 antes, o escollido no medio, 2 despois
const dias = computed(() =>
  [-2, -1, 0, 1, 2].map((n) => sumarDias(dataEscollida.value, n)),
);

// cantas citas (sen borradas) ten un día
function contarCitas(data) {
  return citas.value.filter((c) => c.fecha === data && c.estado !== "borrada")
    .length;
}

// "2026-11-28" → "28/11" e "sábado"
function diaMes(data) {
  return data.split("-").reverse().slice(0, 2).join("/");
}
function nomeDia(data) {
  return new Date(data + "T12:00").toLocaleDateString("es-ES", {
    weekday: "long",
  });
}

const cabeceiras = ["Hora", "DNI paciente", "Doctor", "Motivo", "Estado"];

const citas = ref([]); // todas as citas (como tarifas en TariFas.vue)
const dataEscollida = ref(hoxe); // a memoria do filtro: ao entrar, hoxe

// se se borra a data (ou queda a medio escribir), volvemos a hoxe para que a franxa nunca mostre NaN
watch(dataEscollida, (valor) => {
  if (!valor) dataEscollida.value = hoxe;
});

// ao abrir a páxina: pedimos as citas (como en TariFas.vue)
onMounted(async () => {
  citas.value = await getCitas();
});

// as citas do día escollido, sen as borradas, ordenadas por hora
const citasDoDia = computed(() =>
  citas.value
    .filter((c) => c.fecha === dataEscollida.value)
    .filter((c) => c.estado !== "borrada")
    .sort((a, b) => a.hora.localeCompare(b.hora)),
);

//pdf button: opens a new tab with todays' appoitments in it
function exportarCitas() {
  const total = citasDoDia.value.length;
  generarPDF(
    `Axenda do día ${diaMes(dataEscollida.value)}`,
    ["Hora", "DNI paciente", "Doctor", "Motivo", "Estado"],
    citasDoDia.value.map((c) => [
      c.hora,
      c.pacienteDNI,
      c.doctorId
        ? `${c.doctorId.nomedoc} ${c.doctorId.apeldoc}`
        : "(doctor eliminado)",
      c.motivo,
      c.estado,
    ]),
    `${total} ${total === 1 ? "cita" : "citas"}`,
  );
}
</script>
