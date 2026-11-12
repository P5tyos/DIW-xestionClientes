<template>
  <!-- panel/tarxeta da guía de estilo: fondo branco, esquinas de 12 px, sombra e marxe interior
       (16 px no móbil, 32 px desde md). O contido vai no <slot />.
       Clases extra (ex: class="text-center") engádense ás de aquí -->
  <component :is="etiqueta" class="rounded-xl bg-white p-4 shadow-md md:p-8">
    <slot />
  </component>
</template>

<script setup>
defineProps({
  // etiqueta HTML do panel: "section" por defecto ("div", "article"… segundo o contido)
  etiqueta: { type: String, default: "section" },
});
</script>
