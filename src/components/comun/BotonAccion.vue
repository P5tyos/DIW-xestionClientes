<template>
  <!-- botón da guía de estilo. Con "to" é unha ligazón a outra páxina (RouterLink) co aspecto dun botón;
       sen "to" é un <button> normal. Atributos como disabled, title ou @click pasan solos ao elemento -->
  <component
    :is="to ? RouterLink : 'button'"
    :to="to"
    :type="to ? undefined : tipo"
    :class="[base, variantes[variante]]"
  >
    <slot />
  </component>
</template>

<script setup>
import { RouterLink } from "vue-router";

defineProps({
  // aspecto: "principal" (Gardar), "secundario" (Limpiar, PDF), "perigo" (Eliminar), "icona" (🔍 🧹 ✏️),
  // "icona-perigo" (🗑️ das táboas)
  variante: { type: String, default: "principal" },
  // se se indica, o botón é unha ligazón a esa ruta
  to: { type: [String, Object], default: null },
  // tipo do <button>: "button" por defecto (non envía formularios); "submit" para Gardar
  tipo: { type: String, default: "button" },
});

// clases comúns: 44 px de alto no móbil e 40 px desde md, foco visible e aspecto de desactivado
const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md text-base font-semibold no-underline md:h-10 " +
  "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-foco " +
  "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-desactivado disabled:text-texto-desactivado";

// clases de cada variante (escritas enteiras: Tailwind só xera as clases que atopa completas no código).
// Desactivado gaña ao hover: en Tailwind v4 as clases disabled: van despois das hover: no CSS
const variantes = {
  principal: "px-5 bg-acento text-white hover:bg-acento-escuro",
  secundario: "px-5 border border-acento bg-white text-acento hover:bg-acento-suave",
  perigo: "px-5 bg-perigo text-white hover:brightness-90",
  icona: "size-11 md:size-10 border border-borde bg-white text-titulo hover:bg-acento-suave",
  // icona de borrar: contorno e icona vermellos; ao pasar o rato, fondo vermello suave
  "icona-perigo": "size-11 md:size-10 border border-perigo bg-white text-perigo hover:bg-perigo-suave",
};
</script>
