# Guía de estilo · Sanidad Teis

Regras de deseño para toda a aplicación. Todas as páxinas usan **só** estes valores, a través das clases de Tailwind.
As cores defínense unha vez en `src/style.css` (`@theme`) e convértense en clases (`bg-acento`, `text-titulo`…).

Regra xeral: **nada de valores inventados** (`w-[123px]`, `text-[17px]`, cores hex nas plantillas).
Única excepción: os anchos fixos dos campos de formato fixo (DNI, ID, teléfono, selects), que se mediron para o seu contido.

---

## 1. Cores

Paleta verde de 5 tons (do máis claro ao máis escuro): `#A8D5BA` · `#6BBF8A` · `#4B9B6E` · `#2E7D5C` · `#1B5E3A`,
máis un ton moi claro da mesma familia (`#EEF7F1`) para fondos suaves, que a paleta non trae.

| Nome (clase) | Valor | Uso |
|---|---|---|
| `acento` | `#2E7D5C` | Botón principal, menú, pé, ligazóns, borde do campo con foco |
| `acento-escuro` | `#1B5E3A` | Hover do botón principal |
| `titulo` | `#1B5E3A` | Títulos, etiquetas, texto sobre `banda` |
| `banda` | `#A8D5BA` | Fondo dos títulos de sección (banda verde) |
| `acento-claro` | `#A8D5BA` | Bordes de táboa, subliñado do menú activo |
| `foco` | `#4B9B6E` | Contorno de foco ao navegar co teclado |
| `acento-medio` | `#6BBF8A` | **Só decoración** (separadores, detalles): non leva texto enriba nin se usa como cor de texto |
| `acento-suave` | `#EEF7F1` | Cabeceiras de táboa, hover do botón secundario, fondo da páxina |
| `texto` | `#3a4a41` | Texto normal |
| `perigo` | `#a63d3d` | **Único vermello**: erros, asterisco de obrigatorio, botón Eliminar |
| `perigo-suave` | `#fdecec` | Fondo de campo con erro e da caixa de erros |
| `borde` | `#767676` | Borde de campos e botóns de icona |
| `desactivado` | `#f1f4f2` | Fondo de campos e botóns desactivados |
| `texto-desactivado` | `#5f6b65` | Texto de campos e botóns desactivados |

Contraste comprobado (mínimo **4.5:1** para texto, **3:1** para liñas e contornos):
branco sobre `acento` 5.0 · `titulo` sobre branco 7.8 · `titulo` sobre `banda` 4.8 · `acento` sobre `acento-suave` 4.6 ·
`perigo` sobre branco 6.3 e sobre `perigo-suave` 5.5 · `borde` sobre branco 4.5 · `foco` sobre branco 3.4 ·
`acento-claro` sobre `acento` (subliñado do menú) 3.1.
`#6BBF8A` e `#4B9B6E` non chegan a 4.5 con ningún texto, por iso non levan texto.

## 2. Tipografía

- Fonte do sistema (`font-sans`): sen descargas nin cuestións legais.
- Tamaño base **16 px**. Escala (só estes):

| Clase | Tamaño | Uso |
|---|---|---|
| `text-sm` | 14 px | Etiquetas, notas, táboas, mensaxes de erro |
| `text-base` | 16 px | Texto normal, campos, botóns |
| `text-xl` | 20 px | Títulos de sección (banda verde) |
| `text-2xl` | 24 px | Títulos de tarxeta |
| `text-4xl` | 36 px | Título principal da páxina (`h1`) |

- Dous pesos: `font-normal` e `font-semibold`.

## 3. Espazos (múltiplos de 4 px)

| Clase | Valor | Uso |
|---|---|---|
| `gap-2` | 8 px | Entre etiqueta e campo, entre botóns de icona |
| `gap-4` | 16 px | Entre campos dunha fila, entre filas, entre botóns |
| `mb-6` / `gap-6` | 24 px | Entre bloques (formulario → listaxe) |
| `p-8` (`p-4` en móbil) | 32 px | Dentro dos paneis |

## 4. Esquinas e sombras

- Campos e botóns: `rounded-md` (6 px). Paneis e tarxetas: `rounded-xl` (12 px).
- Sombra (`shadow-md`) só en paneis e tarxetas; nunca en campos nin botóns.

## 5. Compoñentes

### Botóns (altura 40 px: `h-10`)
| Variante | Clases |
|---|---|
| Principal (Gardar) | `bg-acento text-white hover:bg-acento-escuro` |
| Secundario (Limpiar, PDF) | `bg-white text-acento border border-acento hover:bg-acento-suave` |
| Perigo (Eliminar) | `bg-perigo text-white hover:brightness-90` — sempre separado dos outros |
| Icona (🔍 🧹 ✏️ 🗑️) | cadrado `size-10`, `border border-borde`, icona SVG de 20 px |

Comúns: `px-5 rounded-md text-base font-semibold`.
Desactivado: `disabled:bg-desactivado disabled:text-texto-desactivado disabled:cursor-not-allowed`.
Foco (teclado): `focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-foco`.

### Iconas
- Conxunto **Lucide** (`lucide-vue-next`, licenza ISC), en lugar de emoji: igual en todos os sistemas e coa cor da paleta.
- Tamaño 20 px (`size-5`), cor `currentColor` (colle a do botón). A icona leva `aria-hidden`; o botón leva `aria-label`.

### Campos (altura 40 px: `h-10`)
- Normal: `px-3 rounded-md border border-borde bg-white text-base`.
- Foco: `focus:border-acento focus:outline-none focus:ring-3 focus:ring-acento-claro`.
- Erro: `border-perigo bg-perigo-suave` + anel `ring-perigo`.
- Desactivado: `bg-desactivado text-texto-desactivado`.
- Etiqueta: `text-sm font-semibold text-titulo`, á esquerda do campo en pantalla ancha e enriba en móbil. Obrigatorio: `*` en `text-perigo`.

### Caixa de erros (enriba de Gardar)
`border-l-4 border-perigo bg-perigo-suave text-perigo text-sm px-4 py-2`. Cada erro cun exemplo válido.

### Título de sección (banda verde)
`bg-banda text-titulo text-xl font-semibold text-center rounded-md py-2 mb-4`.

### Táboas (grella completa)
- Táboa: `w-full text-sm border border-acento-claro`.
- Celas (`th`, `td`): `border border-acento-claro p-3`. Cabeceira: `bg-acento-suave font-semibold text-titulo`.

### Paneis e tarxetas
`bg-white rounded-xl shadow-md p-8` (`p-4` en móbil).

## 6. Disposición

- Ancho da páxina: o mesmo en todas.
- Formularios en filas; por debaixo de 768 px (`md`) as filas pasan a unha columna.
- Campos de formato fixo (DNI, ID, teléfono, data, selects, radios) con ancho fixo; os de texto repártense o resto.

## 7. Aliñamento (requisito do profesor)

Texto á esquerda · números, DNI, ID, datas e teléfonos centrados (`text-center`) · importes á dereita (`text-right tabular-nums`).

## 8. Accesibilidade (non negociable)

- Contraste ≥ 4.5:1 en todo texto.
- Foco visible en todo o que se pode usar co teclado.
- Elementos clicables de polo menos 40 × 40 px.
- O que se move máis de 5 s pódese parar; respectar "movemento reducido".
