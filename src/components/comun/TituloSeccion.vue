<template>
  <!-- título de sección: a banda verde da guía. Se se lle pasa algo no slot "accion" (ex: botón PDF),
       vai á dereita da banda -->
  <div class="mb-4 flex items-center gap-4">
    <h2 class="flex flex-1 items-center justify-center gap-2 rounded-md bg-banda py-2 text-xl font-semibold text-titulo">
      <slot />
    </h2>
    <slot name="accion" />
  </div>
</template>
