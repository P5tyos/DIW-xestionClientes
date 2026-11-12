<template>
  <div class="w-full px-4 py-8 text-left md:px-8 md:py-12">
    <TarxetaPanel class="mx-auto max-w-3xl">
      <!-- títulos en orde (h1 → h2): os lectores de pantalla navegan pola páxina usando eses niveis -->
      <h1 class="mb-6 text-4xl font-semibold text-titulo">Política de privacidad y confidencialidad</h1>

      <!-- cada apartado escríbese unha soa vez (os textos están no script) -->
      <section v-for="apartado in apartados" :key="apartado.titulo" class="mb-6">
        <h2 class="mb-2 text-xl font-semibold text-titulo">{{ apartado.titulo }}</h2>
        <p v-for="parrafo in apartado.parrafos" :key="parrafo" class="mb-3 leading-relaxed">{{ parrafo }}</p>
      </section>

      <!-- aviso destacado nunha caixa co verde suave da paleta -->
      <p class="rounded-md border-l-4 border-acento bg-acento-suave px-4 py-3 leading-relaxed">
        <strong class="font-semibold text-titulo">Importante:</strong> Este texto tiene carácter informativo y forma
        parte de un proyecto didáctico. No sustituye una política de privacidad
        legal ni el asesoramiento de un profesional en materia de protección de
        datos.
      </p>
    </TarxetaPanel>
  </div>
</template>

<script setup>
import TarxetaPanel from "./comun/TarxetaPanel.vue";

// apartados da política: título e parágrafos
const apartados = [
  {
    titulo: "Protección de datos y confidencialidad",
    parrafos: [
      "Para poder registrar y gestionar sus datos como paciente, es necesario aceptar las condiciones de confidencialidad y protección de datos.",
      "Sus datos personales y sanitarios serán tratados de forma confidencial y utilizados únicamente para las finalidades relacionadas con la gestión de su atención sanitaria y los servicios proporcionados por Sanidade Teis.",
    ],
  },
  {
    titulo: "¿Qué datos se recopilan?",
    parrafos: [
      "Para la gestión del paciente pueden solicitarse datos identificativos y de contacto, como nombre, apellidos, DNI/NIE, fecha de nacimiento, teléfono, correo electrónico y datos de domicilio.",
    ],
  },
  {
    titulo: "Confidencialidad",
    parrafos: [
      "La información facilitada por el paciente será tratada de manera confidencial y no será utilizada para fines distintos de los relacionados con la gestión y atención sanitaria.",
    ],
  },
  {
    titulo: "Protección de la información",
    parrafos: [
      "Se aplicarán las medidas necesarias para proteger los datos frente a accesos, modificaciones o usos no autorizados.",
    ],
  },
  {
    titulo: "Derechos del paciente",
    parrafos: [
      "El paciente puede ejercer sus derechos de acceso, rectificación, supresión, oposición y demás derechos reconocidos por la normativa vigente en materia de protección de datos.",
    ],
  },
  {
    titulo: "Aceptación",
    parrafos: [
      "Al marcar la casilla de aceptación, el paciente declara haber leído y comprendido esta información y acepta el tratamiento de sus datos de acuerdo con las condiciones indicadas.",
    ],
  },
];
</script>
