<template>
  <div class="w-full px-4 py-8 text-left md:px-8 md:py-12">
    <!-- vídeo de portada: só imaxe, sen texto enriba; o contido da páxina vai debaixo -->
    <figure class="mb-8">
      <!-- marco do vídeo: 60 % da altura da pantalla, así debaixo aínda asoma o contido
           (h-[60vh] é un valor acordado para esta páxina, excepción á regra de non inventar valores) -->
      <div class="relative h-[60vh] min-h-60 overflow-hidden rounded-xl bg-titulo shadow-md">
        <!-- vídeo decorativo: sen son, en bucle; aria-hidden porque non transmite información.
             Sen "autoplay": arráncase desde o script só se o usuario non pediu "movemento reducido".
             preload="none": a quen non o reproduce non se lle descarga, só ve o póster -->
        <video
          ref="video"
          class="block size-full object-cover"
          muted
          loop
          playsinline
          preload="none"
          poster="/video/inicio-poster.jpg"
          aria-hidden="true"
          tabindex="-1"
        >
          <!-- o navegador colle o primeiro formato que saiba reproducir (WebM pesa menos) -->
          <source src="/video/inicio.webm" type="video/webm" />
          <source src="/video/inicio.mp4" type="video/mp4" />
        </video>

        <!-- botón para parar/continuar o vídeo (WCAG 2.2.2: o que se move máis de 5 s ten que poder pararse) -->
        <button
          type="button"
          class="absolute right-3 bottom-3 inline-flex size-11 items-center justify-center rounded-full border border-white/60 bg-black/45 text-white hover:bg-black/70 focus-visible:outline-acento-claro"
          :aria-label="enPausa ? 'Reproducir o vídeo' : 'Pausar o vídeo'"
          :title="enPausa ? 'Reproducir vídeo' : 'Pausar vídeo'"
          @click="alternarVideo"
        >
          <Play v-if="enPausa" class="size-5" aria-hidden="true" />
          <Pause v-else class="size-5" aria-hidden="true" />
        </button>
      </div>

      <!-- crédito do vídeo (licenza Pexels: non obrigatorio, pero boa práctica). Detalles en public/video/CREDITOS.txt.
           Vai sobre unha etiqueta clara para que se lea encima da imaxe de fondo -->
      <figcaption class="mt-2 text-right text-sm">
        <span class="rounded-md bg-white/90 px-2 py-1">
          Vídeo: <a href="https://www.pexels.com/es-es/@mikhail-nilov/" target="_blank" rel="noopener noreferrer" class="underline">Mikhail Nilov</a>
          e outros autores de <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" class="underline">Pexels</a>
        </span>
      </figcaption>
    </figure>

    <!-- presentación -->
    <TarxetaPanel class="mx-auto mb-10 max-w-3xl text-center">
      <h1 class="mb-4 text-4xl leading-tight font-semibold text-titulo">Bienvenido a Sanidad Teis</h1>
      <p class="mb-4 text-xl font-semibold text-acento">Tu centro de salud de confianza en el barrio de Teis</p>
      <p class="leading-relaxed">
        En Sanidad Teis ofrecemos atención médica cercana, profesional y accesible
        para toda la familia. Contamos con un equipo comprometido con tu bienestar
        y con las últimas herramientas digitales para facilitar la gestión de tus
        datos y citas.
      </p>
    </TarxetaPanel>

    <!-- accesos rápidos: unha columna no móbil, tres desde md -->
    <section class="mb-10 grid gap-6 md:grid-cols-3">
      <TarxetaPanel v-for="tarxeta in tarxetas" :key="tarxeta.ruta" etiqueta="div" class="flex flex-col items-start">
        <h2 class="mb-2 text-2xl font-semibold text-titulo">{{ tarxeta.titulo }}</h2>
        <p class="mb-4 flex-1 leading-relaxed">{{ tarxeta.texto }}</p>
        <!-- motion-safe: o pequeno salto ao pasar o rato só para quen non pediu "movemento reducido" -->
        <BotonAccion :to="tarxeta.ruta" class="motion-safe:transition motion-safe:hover:-translate-y-0.5">
          {{ tarxeta.boton }}
        </BotonAccion>
      </TarxetaPanel>
    </section>

    <!-- contacto: unha columna no móbil, dúas desde md -->
    <TarxetaPanel class="mx-auto max-w-3xl">
      <h2 class="mb-4 text-2xl font-semibold text-titulo">Información de contacto</h2>
      <ul class="grid gap-x-8 gap-y-3 leading-normal md:grid-cols-2">
        <li v-for="dato in contacto" :key="dato.nome">
          <strong class="font-semibold text-titulo">{{ dato.nome }}:</strong> {{ dato.valor }}
        </li>
      </ul>
    </TarxetaPanel>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Play, Pause } from "lucide-vue-next";
import TarxetaPanel from "./comun/TarxetaPanel.vue";
import BotonAccion from "./comun/BotonAccion.vue";

// tarxetas de acceso rápido (así o HTML da tarxeta escríbese unha soa vez)
const tarxetas = [
  { titulo: "Gestión de Pacientes", texto: "Consulta, registra o modifica tus datos médicos.", ruta: "/xestion-pacientes", boton: "Acceder" },
  { titulo: "Sobre Nosotros", texto: "Conoce nuestro equipo y nuestra misión.", ruta: "/sobrenos", boton: "Ver más" },
  { titulo: "Aviso Legal", texto: "Información sobre privacidad y condiciones de uso.", ruta: "/avisolegal", boton: "Consultar" },
];

// datos de contacto
const contacto = [
  { nome: "Horario", valor: "Lunes a Viernes, 8:00 - 20:00" },
  { nome: "Dirección", valor: "Rúa de Eduardo Cabello, 12, 36216 Vigo, Pontevedra" },
  { nome: "Teléfono", valor: "986 45 12 30" },
  { nome: "Email", valor: "info@sanidadteis.gal" },
];

const video = ref(null);   // o elemento <video> da portada
const enPausa = ref(true); // empeza parado ata que se arranca (ou non) en onMounted

// ao abrir a páxina: o vídeo só se reproduce se o usuario non pediu "movemento reducido" no seu sistema
onMounted(() => {
  const movementoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!movementoReducido) {
    reproducir();
  }
});

// arranca o vídeo (sempre sen son: os navegadores só permiten reproducir sós os vídeos mudos)
function reproducir() {
  video.value.muted = true;
  video.value.play()
    .then(() => { enPausa.value = false; })
    .catch(() => { enPausa.value = true; }); // se o navegador o bloquea, quédase o póster e o botón ▶
}

// botón ⏸/▶: para ou continúa o vídeo
function alternarVideo() {
  if (video.value.paused) {
    reproducir();
  } else {
    video.value.pause();
    enPausa.value = true;
  }
}
</script>
