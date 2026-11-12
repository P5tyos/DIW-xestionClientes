<template>
  <!-- pé de páxina: as ligazóns en verde moi claro (acento-suave, 4.6:1 sobre o verde) e brancas ao pasar o rato -->
  <footer class="mt-12 bg-acento px-4 py-3 text-sm text-white">
    <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
      <RouterLink
        to="/avisolegal"
        class="text-acento-suave underline hover:text-white focus-visible:outline-acento-claro"
      >
        Aviso Legal
      </RouterLink>
      <span>© {{ new Date().getFullYear() }} Sanidad Teis — Desenvolvido en Vue 3 por</span>
      <a
        href="https://github.com/P5tyos"
        target="_blank"
        rel="noopener"
        class="text-acento-suave underline hover:text-white focus-visible:outline-acento-claro"
        aria-label="Gergely Horvath en GitHub (ábrese nunha nova lapela)"
      >
        Gergely Horvath
      </a>
    </div>
  </footer>
</template>
