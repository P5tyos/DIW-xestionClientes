<template>
  <!-- caixa de erros do formulario (enriba de Gardar): borde esquerdo e texto vermellos sobre vermello claro.
       Cada mensaxe vai no slot como un <p> co seu id (para o aria-describedby do campo) e role="alert" -->
  <div class="w-full max-w-2xl space-y-1 rounded-md border-l-4 border-perigo bg-perigo-suave px-4 py-2 text-sm text-perigo">
    <slot />
  </div>
</template>
