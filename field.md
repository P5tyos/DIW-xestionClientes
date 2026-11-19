# Exam recipes

1. [Adding a new field to the Pacientes form](#adding-a-new-field-to-the-pacientes-form) (`NEW FIELD · STEP x/8` markers)
2. [A new page with data from a JSON file through the backend (Tarifas)](#recipe-2--a-new-page-with-data-from-a-json-file-through-the-backend-tarifas)
3. [A new page with data in a frontend file (Servicios médicos)](#recipe-3--a-new-page-with-data-in-a-frontend-file-servicios-médicos)
4. [A checkbox that shows or hides rows in a list (citas borradas)](#recipe-4--a-checkbox-that-shows-or-hides-rows-in-a-list-citas-borradas)

Recipes 2–4 copy the `step` comments that are in the code, in order, with notes on what each step does and what can go wrong.

---

# Adding a new field to the Pacientes form

Example field: **Alerxias** (`alerpac`), optional text.

> **Before submitting the project:** delete this file, and either remove every `NEW FIELD` marker
> with its commented-out lines, or uncomment them if the field is now part of the project.

## How to use the code

- **`//` lines (steps 1, 3, 7, 8):** remove the `//`.
- **Array lines (steps 4 and 6a):** they are a full replacement line. Delete the old line above, then uncomment the new one.
- **Template blocks (steps 5 and 6b):** remove the `<!--` and `-->` around them.

## STEP 1/8 · Schema: `backend/modelos/Paciente.js`

Add the field to the Mongoose schema.

- **Why:** Mongoose only saves fields that are in the schema. Without this line the form sends `alerpac`,
  but Mongoose silently drops it and nothing reaches the DB.
- **The routes** (`pacientes.rutas.js`) need **no change**: they pass the whole `req.body`.
- **Required field:** use `required: true`. Old patients without the field can still be edited,
  because `findOneAndUpdate` doesn't validate by default.

## STEP 2/8 · Restart the backend (no code)

Stop `npm start` and run it again. The backend runs with plain `node`, so it keeps the old schema until it restarts.

## STEP 3/8 · Form object: `novoPaciente` in `XestionPaciente.vue`

Add the key with its empty value:

| Kind of field | Empty value |
|---|---|
| text, select, date | `""` |
| checkbox | `false` |
| radio buttons | `null` |

- **Why:** `v-model` needs the key to exist from the start.
- **`limpiarFormpac`** needs **no change**: it loops over every key and resets it.

## STEP 4/8 · `CAMPOS`

Add the name to the array (replace the line).
With that, the "unsaved changes" question and the table filter include the new field automatically.

## STEP 5/8 · The input (template, new row 4)

- **Names must match:** `id`, `etiqueta` (the label text) and `v-model`: `id="alerxias"` ↔ `v-model="novoPaciente.alerpac"`.
- **Width:**
  - text field → `md:flex-1` (grows)
  - fixed-format field (date, code, number) → a fixed `md:w-*` and `text-center`
- **Required field:** add `obrigatorio` to `CampoFormulario` and `required` to the input (plus step 7).
- **A select?** Copy the Provincia block instead. **A checkbox?** Copy the privacy one.

## STEP 6/8 · The table

- **6a, `cabeceiras`:** add the header **before "Accións"**, so the buttons stay in the last column.
- **6b, the `<td>`:** in the **same position** as its header.
  - text → no extra class
  - numbers, dates, codes → `text-center`

## STEP 7/8 · Required check (ONLY if the field is required)

Add the line to `motivoNonGardar`. Gardar then stays disabled, and the hint says what's missing.
Also add `obrigatorio` + `required` in the template (step 5) and `required: true` in the schema (step 1).

## STEP 8/8 · PDF (ONLY if they ask for it)

In `exportarPacientes`, add the header to the headers array **and** the value to the row, in the same position.
`?? ""` writes an empty cell for old patients that don't have the field.

## Check that it works

1. `npm run build`: no errors.
2. Create a patient with the field filled in; it should appear in the table.
3. ✏️ that patient: the value is loaded in the form. Change it and save.
4. Optional: `curl http://localhost:3000/api/pacientes` to see `alerpac` in the JSON.


Gaps in the guide:

1. A field with validation (the biggest gap). If the exam says something like "add the Tarxeta Sanitaria, format XXXX…", the guide doesn't show validation. The pattern already exists in the code: copy the telephone field. A new validated field needs:

a flag ref, e.g. const tarxetaInvalida = ref(false)
a validarTarxeta() function (copy validarTelefono and change the regex)
@blur / @input / :aria-invalid / aria-describedby on the input
a <p id="tarxeta-erro" role="alert"> in the CaixaErros block (and its v-if)
the flag added in three places: the "Corrixe os campos…" line in motivoNonGardar, the re-validation in guardarPaciente, and the reset in limpiarFormpac
I can add this as an optional STEP 9 if you want.

2. If the field goes in Doctores instead of Pacientes, there are two traps:

limpiarFormdoc deletes every key that isn't in CAMPOS. So in Doctores, step 4 isn't optional: without it, the field disappears the first time you clear the form.
The duplicate check datosDoctor in doctores.rutas.js:7 lists every field by name. Add the new one there too, or two doctors that differ only in the new field would count as the same doctor.
3. Citas uses pacienteDNI and doctorId from the stores and has no filter, so most of the guide applies, but not all of it. That case is less likely, so I'd only look at it if you have time.

---

# Recipe 2 · A new page with data from a JSON file through the backend (Tarifas)

The data lives in a JSON file on the server. The backend reads it and sends it to the browser on request.
Use this when the exam gives you data "in the server" or "from an API".

Path of the data: `tarifas.json` → `server.js` (route `/api/tarifas`) → `api/tarifas.js` (axios) → `TariFas.vue` (table).

## STEP 1 · Create the JSON file: `backend/data/tarifas.json`

Code comment: *"step1: create tarifas.json"* (in `server.js`).

```json
{
  "tarifas": [
    { "id": 1, "servizo": "Consulta médica", "concepto": "Consulta presencial", "prezo": 55 },
    { "id": 2, "servizo": "Consulta médica", "concepto": "Consulta online", "prezo": 40 }
  ]
}
```

- **The outer key (`"tarifas"`) matters:** step 3 uses that exact name to take the list out.
- **Every row has an `id`:** the table needs it for `:key`.
- **Numbers without quotes** (`55`, not `"55"`), or you can't do maths with them later.
- **JSON is strict:** double quotes only, no comma after the last item, no comments.
  A single mistake and `JSON.parse` in step 2 fails, and the backend returns an error.

## STEP 2 · The backend route: `backend/server.js`

Code comment: *"step2: this step: load in the data from Json and transform it into a JS object"*.

```js
//ruta de la api para obtener TARIFAS
app.get('/api/tarifas', (req, res) => {
    //leemos el fichero Json
    const datos = fs.readFileSync('./backend/data/tarifas.json', 'utf-8')
    //convertimos el texto JSON en un objecto JavaScript
    const datosJson = JSON.parse(datos)
    //enviamos los datos como respuesta al cliente web
    res.json(datosJson)
})
```

Copy the `/api/municipios` route above it and change the URL and the file name.

- **Restart the backend** (stop `npm start`, run it again). `node` doesn't reload `server.js` changes by itself.
- **The path `./backend/data/...` is relative to where you run `npm start`:** always the project root.
- **Check it before going on:** open `http://localhost:3000/api/tarifas` in the browser. You should see the JSON.
  If that doesn't work, nothing in steps 3–6 will.
- **Changing the JSON later doesn't need a restart:** the file is read again on every request.

## STEP 3 · The axios file: `src/api/tarifas.js`

Code comment: *"step 3: create this file."*

```js
import axios from 'axios'

//direccion de nuestra API. this is where the data is coming from
const URL = 'http://localhost:3000/api/tarifas'

//obtener todas las tarifas
export async function obtenerTarifas() {
    const respuesta = await axios.get(URL)   // axios goes to the URL and gets all the data
    return respuesta.data.tarifas            // .tarifas = the outer key of the JSON (step 1)
}
```

From the comments in the file:
- *"this line is an async function that will return a promise"*: whoever calls it must use `await`.
- *"The await keyword is used to wait for the promise to resolve before continuing."*
- *"respuesta.data is that whole wrapper, and .tarifas opens it and takes out the list.
  The word must match the key in the JSON file exactly."*
  If you write `.tarifa` or `.Tarifas`, you get `undefined` and the table stays empty, with no error.

## STEP 4 · The page: `src/components/TariFas.vue` (no step comment in the code)

Copy `TariFas.vue` as the starting point. The parts that matter:

```js
import { ref, onMounted, computed } from "vue";
import { obtenerTarifas } from "../api/tarifas.js";

const tarifas = ref([]);          // empty until the data arrives

onMounted(async () => {           // when the page opens, ask the backend
  tarifas.value = await obtenerTarifas();
});
```

```html
<tr v-for="t in tarifas" :key="t.id">
  <td>{{ t.servizo }}</td>
  <td>{{ t.concepto }}</td>
  <td class="text-right">{{ t.prezo }} €</td>
</tr>
```

- **`ref([])`, not `ref()`:** the `v-for` runs before the data arrives, and it needs an empty list, not `undefined`.
- **Alignment (teacher's rule):** text left, amounts `text-right`.
- **File name:** follow the project's habit of two capitals (`TariFas.vue`, `IniCio.vue`, `AxendaDia.vue`). It comes from Vue's
  "multi-word component names" rule. That rule is switched off in `eslint.config.js`, so it's a convention, not an error.
  Whatever you choose, the `import` in step 5 must use exactly the same spelling (Linux is case-sensitive).
- **Optional, but good practice:** wrap the `await` in `try/catch` and show `alertaError(...)` if it fails.
  Without it, if the backend is off, the table is just empty and the error only appears in the console.

## STEP 5 · The route: `src/router/index.js`

The same as Servicios médicos' *"step 2 add it to the path"*:

```js
import TariFas from "../components/TariFas.vue"
...
    {path: '/tarifas', name: 'TariFas', component: TariFas},
```

- **Add it before the `NotFound` route** (the catch-all `/:pathMatch(.*)*`), which must stay last.
  A route after it is never reached.

## STEP 6 · The menu: `src/components/NavBar.vue`

The same as Servicios médicos' *"step 3.1 add it to the navbar"*: one line in the `ligazons` array.

```js
  { ruta: "/tarifas", texto: "Tarifas" },
```

`ruta` must be exactly the `path` from step 5.

## Extra · A filter with a select (what Tarifas has)

```html
<select v-model="filtroServizo">
  <option value="">Todos</option>
  <option value="Consulta médica">Consulta médica</option>
  ...
</select>
```

```js
const filtroServizo = ref('');
// the rows that pass the filter (all of them when the filter is empty)
const tarifasFiltradas = computed(() =>
  tarifas.value.filter((t) => filtroServizo.value === '' || t.servizo === filtroServizo.value)
);
```

Then the `v-for` uses `tarifasFiltradas` instead of `tarifas`.

- **The option values must match the JSON text exactly**, accents included ("Análises clínicas").
- **The options are written by hand:** if you add a new `servizo` to the JSON, add its `<option>` too.

## Check that it works

1. `http://localhost:3000/api/tarifas` shows the JSON (step 2).
2. The menu has the new link, and clicking it opens the page (steps 5–6).
3. The table shows every row; the filter leaves only the chosen service.
4. `npm run build`: no errors.

---

# Recipe 3 · A new page with data in a frontend file (Servicios médicos)

The data is fixed and lives in a `.js` file in `src/`, so there's no backend, no axios and no restart.
Use this for content that doesn't change: services, team members, opening hours…

## STEP 1 · Create the page: `src/components/ServiciosMedicos.vue`

Code comment: *"Step 1 create the vue file. and populate it with the minimum. copy the nearest match from other files"*.

Copy a similar simple page (`SobreNos.vue`) and leave only a title, so you can see it working before adding anything.

## STEP 2 · The route: `src/router/index.js`

Code comment: *"step 2 add it to the path. next inster into navBar"*.

```js
import ServiciosMedicos from "../components/ServiciosMedicos.vue"
...
    {path: '/servicios-medicos', name: 'ServiciosMedicos', component: ServiciosMedicos},
```

Before the `NotFound` route, as in recipe 2.

## STEP 3.1 · The menu: `src/components/NavBar.vue`

Code comment: *"step 3.1 add it to the navbar"*.

```js
  { ruta: "/servicios-medicos", texto: "Servicios Medicos" },
```

**Check now:** the link appears and opens your minimal page. Everything after this is just content.

## STEP 4.1 · The data file: `src/data/servizos.js`

Code comment: *"step 4.1 create this file for the data that will be shown in the page. it is for separating the data from the logic"*.

```js
export const servizos = [
  { id: "presencial", nome: "Consulta médica", subtitulo: "presencial", descricion: "…", inclue: ["…", "…"] },
  { id: "online",     nome: "Consulta médica", subtitulo: "online",     descricion: "…", inclue: ["…", "…"] },
];
```

- **`export`** lets the page import it (step 4.2).
- **Every object has a unique `id`:** used for `:key` and to know which one is selected.
- **Unlike JSON**, this is JavaScript: single quotes, comments and a trailing comma are all fine.

## STEP 4.2 · Import the data in the page

Code comment: *"step 4.2 tell this file, where the data lives"*.

```js
import { servizos } from "../data/servizos.js";
```

The `{ }` are needed because step 4.1 used a named `export const`.

## STEP 4.2B · Show the data (template)

Code comment: *"step 4.2B adding ther html that will show the data."*

```html
<button v-for="servizo in servizos" :key="servizo.id" type="button">
  {{ servizo.nome }} · {{ servizo.subtitulo }}
</button>
```

`servizos` isn't a `ref`, because the data never changes, so it's used directly without `.value`.

## STEP 5.1 · Remember which one is selected

Code comment: *"step 5.1 : implement a variable that remembers which option is clicked/selected by the user"*.

```js
import { ref } from "vue";
const seleccionado = ref(null);   // null = none selected
```

It must be a `ref` so that the page redraws when it changes.

## STEP 5.2 · Clicking selects it

Code comment: *"step 5.2 adding a "button" to show the selected data: depending on the value of "selecionado"."*

```html
<button
  v-for="servizo in servizos" :key="servizo.id" type="button"
  :class="seleccionado?.id === servizo.id ? 'bg-acento text-white' : 'bg-white'"
  @click="seleccionado = servizo"
>
```

- **`?.`** avoids a crash while `seleccionado` is still `null`.
- **Two full class strings in the ternary.** Never build a class name by joining text: Tailwind wouldn't generate it.
- **Accessibility:** add `:aria-pressed` (or `:aria-expanded` if it opens a panel) with the same condition.

## STEP 6.1 · Import a shared component

Code comment: *"step 6.1 inport a commun element"*.

```js
import BotonAccion from "./comun/BotonAccion.vue";
```

The shared components in `src/components/comun/` already have the style-guide look:
`BotonAccion`, `TarxetaPanel`, `TituloSeccion`, `CampoFormulario`, `CaixaErros`.

## STEP 6.2 · Show the details of the selected one

Code comment: *"step 6.2: load the data the medical service currently selected according to the seleccionado variable"*.

```html
<TarxetaPanel v-if="seleccionado">
  <h2>{{ seleccionado.nome }} · {{ seleccionado.subtitulo }}</h2>
  <p>{{ seleccionado.descricion }}</p>
  <ul>
    <li v-for="cousa in seleccionado.inclue" :key="cousa">{{ cousa }}</li>
  </ul>
  <BotonAccion to="/xestion-citas">Pedir cita</BotonAccion>
</TarxetaPanel>
```

- **`v-if="seleccionado"`:** without it, `seleccionado.nome` crashes while nothing is selected.
- **`BotonAccion to="…"`** turns the button into a link to another page.

**Note:** the current page has grown since these steps (photos, opening under the row, prices).
The steps above are the basic version, which is what an exam question would ask for.

---

# Recipe 4 · A checkbox that shows or hides rows in a list (citas borradas)

Citas are never deleted, only marked `"borrada"`. The list hides them unless a checkbox is ticked.
The same pattern works for any "show also…" / "only show…" option.

## STEP 1 · The new value: the Estado `<select>` in `XestionCitas.vue`

Code comment: *"filter step1 added new option"*.

```html
<option value="borrada">Borrada</option>
```

The `value` is what is saved in the DB; steps 2.2 and later compare against exactly this text.

## STEP 2.1 · The checkbox variable

Code comment: *"filtrar step 2.1 variable for the checkbox => true = a táboa tamén mostra as citas borradas"*.

```js
const mostrarBorradas = ref(false);   // false = hidden by default
```

## STEP 2.2 · Filter the list

Code comment: *"filter step 2.2 goes through a list and keeps only the items that pass a test. now incl. the new variable too"*.

Inside the `citasPaciente` computed, add one more `.filter`:

```js
    .filter((c) => mostrarBorradas.value || c.estado !== "borrada")
```

How to read it: keep the cita **if** the box is ticked (keep everything) **or** it isn't `"borrada"`.

- **It must be inside a `computed`:** then ticking the box re-runs it and the table updates by itself.
- **`.value`** is needed in the script.

## STEP 2.3 · The checkbox (template)

Code comment: *"Filter Step 2.3 creates the checkbox"*.

```html
<label class="flex items-center gap-2 text-sm">
  <input v-model="mostrarBorradas" type="checkbox" /> Mostrar as citas borradas
</label>
```

- **`v-model` on a checkbox** gives `true`/`false`.
- **The `<input>` is inside the `<label>`,** so clicking the text also ticks the box, and screen readers read the text as its name.

## Check that it works

1. Mark a cita as Borrada with ✏️ and save: it disappears from the list.
2. Tick the checkbox: it comes back. Untick: it's hidden again.
