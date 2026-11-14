<template>
  <!-- barra de navegación: no móbil logo + botón ☰ (o menú ábrese debaixo, en vertical); desde md, menú en liña.
       Esc pecha o menú aberto -->
  <nav class="flex flex-wrap items-center justify-between gap-2 bg-acento px-4 py-2 text-white md:px-8" @keydown.esc="aberto = false">
    <div class="flex items-center gap-2 font-semibold">
      <!-- logo: corazón vermello cunha cruz branca (decorativo: o nome xa vai ao lado).
           O seu vermello é o do logo, non unha cor da interface: única excepción á paleta -->
      <svg class="size-7" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill="#e63946"
          stroke="white"
          stroke-width="1"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
        <rect x="10.75" y="6.5" width="2.5" height="8" fill="white" />
        <rect x="8" y="9.25" width="8" height="2.5" fill="white" />
      </svg>
      Sanidad Teis
    </div>

    <!-- botón ☰ só no móbil (md:hidden). aria-expanded di aos lectores de pantalla se o menú está aberto.
         O contorno de foco vai en acento-claro: o "foco" da paleta non se vería sobre este verde -->
    <button
      type="button"
      class="inline-flex size-11 items-center justify-center rounded-md hover:bg-acento-escuro focus-visible:outline-acento-claro md:hidden"
      :aria-expanded="aberto"
      aria-controls="menu-principal"
      :aria-label="aberto ? 'Pechar o menú' : 'Abrir o menú'"
      @click="aberto = !aberto"
    >
      <X v-if="aberto" class="size-6" aria-hidden="true" />
      <Menu v-else class="size-6" aria-hidden="true" />
    </button>

    <!-- menú: no móbil só se ve se está aberto (ocupa toda a liña de abaixo); desde md sempre en liña.
         Páxina actual subliñada: [&.router-link-active] é máis específico que border-transparent, así gaña sempre -->
    <ul
      id="menu-principal"
      class="w-full flex-col gap-1 pb-2 md:flex md:w-auto md:flex-row md:gap-4 md:pb-0"
      :class="aberto ? 'flex' : 'hidden'"
    >
      <li v-for="ligazon in ligazons" :key="ligazon.ruta">
        <RouterLink
          :to="ligazon.ruta"
          class="block border-b-4 border-transparent px-2 py-2 font-semibold text-white no-underline focus-visible:outline-acento-claro md:px-0 md:py-1 [&.router-link-active]:border-acento-claro"
        >
          {{ ligazon.texto }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Menu, X } from "lucide-vue-next";

const aberto = ref(false); // menú do móbil aberto ou pechado

// as páxinas do menú (así o <li> escríbese unha soa vez)
const ligazons = [
  { ruta: "/", texto: "Inicio" },
  { ruta: "/servicios-medicos", texto: "Servicios Medicos" },  //step 3.1 add it to the navbar
  { ruta: "/xestion-pacientes", texto: "Pacientes" },
  { ruta: "/xestion-doctores", texto: "Doctores" },
  { ruta: "/xestion-citas", texto: "Citas" },
  { ruta: "/sobrenos", texto: "Sobre nós" },
];

// ao cambiar de páxina, o menú do móbil péchase só
const ruta = useRoute();
watch(() => ruta.path, () => {
  aberto.value = false;
});
</script>
