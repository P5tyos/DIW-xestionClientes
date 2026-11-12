<template>
  <!-- contedor da app: mesmo ancho en todas as páxinas, menú arriba, páxina no medio e pé abaixo.
       Sen id="app": ese id xa o ten o div de index.html onde se monta Vue (non pode haber dous).
       text-center é PROVISIONAL para as páxinas aínda sen migrar (centraban o texto); as migradas poñen o seu propio aliñamento -->
  <div class="mx-auto flex min-h-screen w-full max-w-6xl flex-col py-4 text-center">
    <NavBar />
    <!-- Aquí se carga a páxina de cada ruta -->
    <router-view />
    <FooTer />
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import FooTer from './components/FooTer.vue'
</script>
