<template>
  <nav class="navbar">
    <div class="logo">Sanidad Teis</div>

    <!-- NUEVO 
    <button class="hamburger" @click="isOpen = !isOpen">☰</button> -->

    <ul :class="['menu', { open: isOpen }]">
      <li><RouterLink to="/">Inicio</RouterLink></li>
      <li><RouterLink to="/xestion-pacientes">Pacientes</RouterLink></li>
      <li><RouterLink to="/sobrenos">Sobre nós</RouterLink></li>
    </ul>
  </nav>
</template>

<script setup>
import { ref } from "vue" // será boolean
const isOpen = ref(false) // actívase cuando fago click
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.1rem 6rem;
  background: #1b5c63; /* máis escuro para que o texto branco teña contraste suficiente */
  color: white;
}

.logo {
  font-weight: bold;
  font-size: 1rem;
}

.menu {
  display: flex;
  gap: 0.8rem;
  list-style: none;
}

.menu a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.menu a.router-link-active {
  border-bottom: 0.2rem solid #ffe66d;
}

/* foco visible ao navegar co teclado */
.menu a:focus-visible {
  outline: 3px solid #ffe66d;
  outline-offset: 2px;
}

/* NUEVO */
.hamburger {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
}

/* NUEVO (responsive) */
@media (max-width: 768px) {
  .hamburger {
    display: block;
  }

  .menu {
    display: none;
    position: absolute;
    top: 50px;
    right: 0;
    flex-direction: column;
    background: #1b4965;
    padding: 1rem;
  }

  .menu.open {
    display: flex;
  }
}
</style>
