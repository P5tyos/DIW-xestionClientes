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

// crea un xustificante dunha soa ficha (ex: unha cita para entregarlle ao paciente) e ábreo nunha pestana nova.
// - titulo: título baixo a banda verde
// - linas: lista de pares [etiqueta, valor], que se escriben un por liña ("Paciente: Ana López")
export const generarXustificante = (titulo, linas) => {
  const doc = new jsPDF();
  doc.setProperties({ title: titulo });
  const ancho = doc.internal.pageSize.getWidth();

  // banda verde arriba co nome do centro en branco
  doc.setFillColor(...VERDE);
  doc.rect(0, 0, ancho, 25, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Sanidad Teis", 14, 16);

  // título e data de emisión
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text(titulo, 14, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Data de emisión: ${new Date().toLocaleDateString("es-ES")}`, 14, 47);

  // datos: etiqueta en negriña e valor ao lado (os valores longos pártense en varias liñas)
  doc.setFontSize(12);
  let y = 62;
  linas.forEach(([etiqueta, valor]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${etiqueta}:`, 14, y);
    doc.setFont("helvetica", "normal");
    const texto = doc.splitTextToSize(String(valor ?? ""), ancho - 64);
    doc.text(texto, 50, y);
    y += 8 * texto.length;
  });

  // liña e aviso ao pé
  doc.setDrawColor(...VERDE);
  doc.line(14, y + 4, ancho - 14, y + 4);
  doc.setFontSize(10);
  doc.text("Por favor, chegue uns minutos antes da hora da cita.", 14, y + 12);

  window.open(doc.output("bloburl"), "_blank");
};
