// xeración de listaxes en PDF (jsPDF + AutoTable), común para pacientes, doctores, etc.
// Os compoñentes só preparan os datos (título, cabeceiras e filas); aquí créase o documento

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// verde da paleta (acento: #2E7D5C) en RGB, para a cabeceira da táboa (jsPDF non le as cores do CSS)
const VERDE = [46, 125, 92];

// crea un PDF cunha táboa e ábreo nunha pestana nova do navegador (para ver, imprimir ou descargar)
// - subtitulo: liña opcional baixo a data (ex: o filtro aplicado e o número de rexistros)
export const generarPDF = (titulo, cabeceiras, filas, subtitulo = "") => {
  const doc = new jsPDF();
  doc.setProperties({ title: titulo }); // título do documento (algúns visores móstrano na pestana)

  // título
  doc.setFontSize(18);
  doc.text(titulo, 14, 20);

  // data de xeración e subtítulo
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString("es-ES")}`, 14, 28);
  if (subtitulo) {
    doc.text(subtitulo, 14, 34);
  }

  // táboa: AutoTable reparte as filas e engade páxinas cando fai falta
  autoTable(doc, {
    startY: subtitulo ? 40 : 35,
    head: [cabeceiras],
    body: filas,
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: VERDE
    }
  });

  // abre o PDF nunha pestana nova. Faise dentro do clic do botón, así o navegador non o bloquea como ventá emerxente
  window.open(doc.output("bloburl"), "_blank");
};
