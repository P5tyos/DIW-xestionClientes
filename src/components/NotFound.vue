<template>
  <div class="w-full px-4 py-8 md:px-8 md:py-12">
    <TarxetaPanel class="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
      <h1 class="text-2xl font-semibold text-titulo">A páxina que buscas non se encontra.</h1>
      <p>Por favor, comproba a URL ou volve á páxina de inicio.</p>
      <!-- a imaxe ocupa como moito 384 px (max-w-sm) e encolle no móbil -->
      <img src="../assets/404.png" alt="404 Not Found" class="w-full max-w-sm" />
      <!-- o texto di "volve á páxina de inicio": aquí está a forma de facelo -->
      <BotonAccion to="/">Volver ao inicio</BotonAccion>
    </TarxetaPanel>
  </div>
</template>

<script setup>
import TarxetaPanel from "./comun/TarxetaPanel.vue";
import BotonAccion from "./comun/BotonAccion.vue";
</script>
