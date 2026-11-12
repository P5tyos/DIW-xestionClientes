<template>
  <div class="w-full px-4 py-8 text-left md:px-8 md:py-12">
    <!-- presentación -->
    <TarxetaPanel class="mb-6 text-center">
      <h1 class="mb-4 text-4xl font-semibold text-titulo">Sobre Nosotros</h1>
      <p class="leading-relaxed">
        Sanidad Teis nace en 2020 con el objetivo de ofrecer una atención sanitaria
        moderna, cercana y digitalizada para los vecinos del barrio de Teis y
        alrededores.
      </p>
    </TarxetaPanel>

    <!-- misión e valores: unha columna no móbil, dúas desde md -->
    <div class="mb-6 grid gap-6 md:grid-cols-2">
      <TarxetaPanel>
        <h2 class="mb-2 text-2xl font-semibold text-titulo">Nuestra misión</h2>
        <p class="leading-relaxed">
          Facilitar el acceso a la atención médica mediante herramientas digitales
          que simplifican la gestión de historiales, citas y comunicación entre
          pacientes y profesionales sanitarios.
        </p>
      </TarxetaPanel>

      <TarxetaPanel>
        <h2 class="mb-2 text-2xl font-semibold text-titulo">Nuestros valores</h2>
        <!-- list-disc: o reset de Tailwind quita as viñetas das listas; aquí volvémolas poñer -->
        <ul class="list-disc space-y-2 pl-5 leading-relaxed">
          <li v-for="valor in valores" :key="valor.nome">
            <strong class="font-semibold text-titulo">{{ valor.nome }}:</strong> {{ valor.texto }}
          </li>
        </ul>
      </TarxetaPanel>
    </div>

    <!-- equipo: unha persoa por fila no móbil, tres desde md -->
    <TarxetaPanel>
      <h2 class="mb-4 text-2xl font-semibold text-titulo">Nuestro equipo</h2>
      <div class="grid gap-4 md:grid-cols-3">
        <div
          v-for="persoa in equipo"
          :key="persoa.nome"
          class="rounded-md border-l-4 border-acento bg-acento-suave p-5"
        >
          <h3 class="mb-2 font-semibold text-titulo">{{ persoa.nome }}</h3>
          <p class="leading-relaxed">{{ persoa.posto }}</p>
        </div>
      </div>
    </TarxetaPanel>
  </div>
</template>

<script setup>
import TarxetaPanel from "./comun/TarxetaPanel.vue";

// valores do centro
const valores = [
  { nome: "Cercanía", texto: "atención personalizada, adaptada a cada paciente." },
  { nome: "Innovación", texto: "uso de tecnología para mejorar la experiencia sanitaria." },
  { nome: "Confidencialidad", texto: "máxima protección de los datos personales." },
];

// persoas do equipo
const equipo = [
  { nome: "Dra. Marta Iglesias Rodríguez", posto: "Directora médica — Medicina General" },
  { nome: "Dr. Alejandro Souto Pérez", posto: "Pediatría" },
  { nome: "Lucía Fernández Vázquez", posto: "Administración y atención al paciente" },
];
</script>
