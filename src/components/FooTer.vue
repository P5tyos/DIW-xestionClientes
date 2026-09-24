<template>
  <footer class="footer-content footer">
    <ul class="link-aviso">
      <router-link to="/avisolegal" color="white" >Aviso Legal</router-link>
      <span>  © {{ new Date().getFullYear() }} Sanidad Teis — Desenvolvido en Vue 3 por </span> 
      <a href="https://github.com/P5tyos" target="_blank"> Gergely Horvath </a>
    </ul>
  </footer>
</template>

<script setup></script>

<style scoped>
.footer {
  background: #569097;
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
  margin-top: 6px;
  color: #f5f5f3;
}

.link-aviso a {
  color: #c2a203;
  cursor: pointer;
}

.link-aviso a:visited {
  color: #e7d08b;
}

.link-aviso a:hover {
  color: #ffffff;
}
</style>
