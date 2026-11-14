
//step 4.1 create this file for the data that will be shown in the page
//it is for separating the data from the logic 
// os servizos do centro: cada obxecto é un botón e o seu detalle

export const servizos = [
  {
    id: "presencial",
    nome: "Consulta médica",
    subtitulo: "presencial",
    descricion: "Visita con tu médico de familia en el centro, con cita previa.",
    inclue: ["Diagnóstico y tratamiento", "Seguimiento de enfermedades crónicas", "Partes de baja y alta"],
  },
  {
    id: "online",
    nome: "Consulta médica",
    subtitulo: "online",
    descricion: "Habla con tu médico por videollamada, sin desplazarte.",
    inclue: ["Dudas sobre síntomas o tratamientos", "Resultados de pruebas", "Seguimiento tras una consulta"],
  },
  {
    id: "pediatria",
    nome: "Pediatría",
    subtitulo: "niños y adolescentes",
    descricion: "Atención médica desde el nacimiento hasta los 14 años.",
    inclue: ["Revisiones del niño sano", "Calendario de vacunas", "Consultas por enfermedad"],
  },
  {
    id: "enfermeria",
    nome: "Enfermería",
    subtitulo: "curas y vacunas",
    descricion: "Cuidados de enfermería sin necesidad de pasar por el médico.",
    inclue: ["Curas y retirada de puntos", "Vacunación de adultos", "Control de tensión y glucosa"],
  },
  {
    id: "analisis",
    nome: "Análisis clínicos",
    subtitulo: "extracción de sangre",
    descricion: "Extracciones en el propio centro, de lunes a viernes por la mañana.",
    inclue: ["Análisis de sangre y orina", "Resultados en 48 horas", "Acude en ayunas si te lo indican"],
  },
  {
    id: "receta",
    nome: "Receta",
    subtitulo: "renovar medicación",
    descricion: "Renueva tu medicación habitual sin necesidad de una consulta completa.",
    inclue: ["Receta electrónica", "Revisión anual del tratamiento", "Recogida en tu farmacia"],
  },
];