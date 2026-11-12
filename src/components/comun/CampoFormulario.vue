<template>
  <!-- campo do formulario: etiqueta enriba (4 px) e o campo debaixo, a todo o ancho do contedor.
       O campo vai no slot: este compoñente pásalle as clases da guía en "clases" (marco, altura, foco, erro…),
       así todos os campos (input, select, data) teñen o mesmo aspecto. Uso:
       <CampoFormulario id="dni" etiqueta="DNI/NIE" obrigatorio :erro="documentoInvalido" v-slot="{ clases }">
         <input id="dni" :class="clases" … />
       </CampoFormulario> -->
  <div class="flex min-w-0 flex-col gap-1">
    <label :for="id" class="text-sm font-semibold text-titulo">
      {{ etiqueta }}<span v-if="obrigatorio" class="ml-0.5 text-perigo" aria-hidden="true">*</span>
    </label>
    <!-- o campo (e, se fai falta, botóns ao seu lado: por iso a fila) -->
    <div class="flex items-center gap-2">
      <slot :clases="erro ? clasesErro : clasesNormal" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  id: { type: String, required: true },          // id do campo (une a etiqueta co campo)
  etiqueta: { type: String, required: true },    // texto da etiqueta
  obrigatorio: { type: Boolean, default: false }, // mostra o * vermello
  erro: { type: Boolean, default: false },        // campo marcado con erro
});

// clases comúns de todos os campos: 44 px de alto no móbil e 40 px desde md, marco gris, esquinas de 6 px
const base =
  "h-11 w-full min-w-0 rounded-md border px-3 text-base md:h-10 " +
  "focus:outline-none disabled:bg-desactivado disabled:text-texto-desactivado";

// normal: marco gris; con foco, marco verde e anel verde claro
const clasesNormal = base + " border-borde bg-white focus:border-acento focus:ring-3 focus:ring-acento-claro";
// con erro: marco e anel vermellos sobre fondo vermello claro (tamén con foco)
const clasesErro = base + " border-perigo bg-perigo-suave ring-2 ring-perigo";
</script>
