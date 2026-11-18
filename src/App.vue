<template>
  <!-- contedor da app: mesmo ancho en todas as páxinas (máx. 1280 px, para que caiba a táboa de pacientes), menú arriba, páxina no medio e pé abaixo.
       Sen id="app": ese id xa o ten o div de index.html onde se monta Vue (non pode haber dous) -->
  <div class="mx-auto flex min-h-screen w-full max-w-7xl flex-col py-4">
    <NavBar />
    <!-- Aquí se carga a páxina de cada ruta. <main> marca o contido principal para os lectores de pantalla;
         desde md crece (flex-1) para que, nas páxinas curtas, o pé quede abaixo da pantalla e non no medio -->
    <main class="md:flex-1">
      <router-view />
    </main>
    <FooTer />
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import FooTer from './components/FooTer.vue'
</script>
