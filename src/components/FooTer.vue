<template>
  <footer class="footer-content footer">
    <div class="link-aviso">
      <router-link to="/avisolegal">Aviso Legal</router-link>
      <span>  © {{ new Date().getFullYear() }} Sanidad Teis — Desenvolvido en Vue 3 por </span>
      <a
        href="https://github.com/P5tyos"
        target="_blank"
        rel="noopener"
        aria-label="Gergely Horvath en GitHub (abre en una nueva pestaña)"
      > Gergely Horvath </a>
    </div>
  </footer>
</template>

<script setup></script>

<style scoped>
.footer {
  background: #1b5c63; /* máis escuro para que o texto branco teña contraste suficiente */
  color: white;
  text-align: center;
  padding: 0.2rem 6rem;
  margin-top: 3rem;
  font-size: 0.9rem;
}

.link-aviso {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin: 6px 0 1rem; /* mesmo espazo que tiña cando era <ul> */
  color: #f5f5f3;
}

.link-aviso a {
  color: #ffe66d;
  cursor: pointer;
}

.link-aviso a:visited {
  color: #e7d08b;
}

.link-aviso a:hover {
  color: #ffffff;
}

/* foco visible ao navegar co teclado */
.link-aviso a:focus-visible {
  outline: 3px solid #ffe66d;
  outline-offset: 2px;
}
</style>
