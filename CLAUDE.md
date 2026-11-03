# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Sanidad Teis": a class project (DIW, a front-end module) for a health centre. Vue 3 + Vite SPA with a small Express + Mongoose backend in the same repo. Two management pages do CRUD: patients (`XestionPaciente.vue`) and doctors (`XestionDoctores.vue`). The student follows the teacher's pace, so keep changes scoped to what is asked and explain them; the user often wants the reasoning, not only the fix.

**Language:** the UI text and code comments are in **Galician** (e.g. "Gardar", "Limpar", `// baleira o formulario`). Write new comments in Galician to match. Some older comments and alert texts are in Spanish.

## Commands

```bash
docker compose up -d     # MongoDB 7 on :27017 (docker-compose.yml; credentials there and in .env MONGO_URI)
npm start                # Vite (:5173) + backend (node backend/server.js, :3000) via concurrently
npm run dev              # frontend only
npm run build            # production build → dist/ (quick way to catch template/compile errors)
npx eslint src           # lint (flat config in eslint.config.js); expect many formatting warnings, 0 errors
```

- There are **no automated tests**. Verify changes with `npm run build`, curl against `http://localhost:3000/api/...`, and the running app.
- The backend runs with plain `node` (no watch): **after any change under `backend/`, the server must be restarted** or it keeps serving the old code. This has caused "my fix doesn't work" confusion several times.
- Run commands from the repo root: `server.js` reads `./backend/data/*.json` with paths relative to the current directory.
- `.env` holds `MONGO_URI` (and `PORT`). Database `bbdd`, collections `pacientes` and `doctores`.

## Architecture

**Frontend (`src/`)**
- `router/index.js`: one route per page component in `src/components/` (no `views/` folder). The catch-all `NotFound` route goes last.
- `api/*.js`: one axios module per resource. The base URL `http://localhost:3000/api` is hard-coded in each file (not read from `.env`). `getPacientes`/`getDoctores` sort by surname (`localeCompare`, "es") on the client.
- `utils/alertas.js`: SweetAlert2 helpers (`alertaExito`, `alertaError`, `alertaInfo`, `alertaConfirmacion`). `alertaConfirmacion` resolves to a Swal **result object**, so check `.isConfirmed`, never the object itself (an object is always truthy, so Cancel would still delete).
- Management pages follow the same structure: a `reactive` form object (`novoPaciente` / `novoDoctor`), an `editando` ref, validation-flag refs, and functions grouped under comment headers ("Zona de declaracións", "ciclo de vida", "métodos", "funcións auxiliares"), each with a one-line comment.

**Backend (`backend/`)**
- `server.js`: Express app; mounts `rutas/pacientes.rutas.js` and `rutas/doctores.rutas.js`, and serves `/api/municipios` and `/api/especialidades` straight from the JSON files in `backend/data/`.
- `modelos/*.js`: Mongoose schemas with explicit `collection` names. Field names use a suffix per entity: `…pac` for patients (`dnipac`, `nomepac`, `apelpac`, `movilpac`, `propac`, `munipac`, `lopdpac`…) and `…doc` for doctors (`nomedoc`, `apeldoc`, `coledoc`, `movildoc`, `maildoc`, `espedoc`).

### How each entity is identified (they differ on purpose)

| | Patients | Doctors |
|---|---|---|
| Key | `dnipac` (DNI/NIE) | MongoDB `_id` |
| API | `/api/pacientes/:dni` (GET/PUT/DELETE) | `/api/doctores/:id` (PUT/DELETE), `findById…` |
| On load into form (✏️/🔍) | `delete novoPaciente._id` | **keep** `_id`; it is what `modifyDoctor` uses |
| On clear (`limpiarForm…`) | fields reset to `""`/`false` | also `delete novoDoctor._id` (an `_id: ""` breaks the next POST) |
| Create | POST checks the DNI and returns 409 if it already exists | POST/PUT return 409 only if **every** field equals another doctor's (`datosDoctor`; PUT excludes itself with `_id: { $ne }`) |

- PUT routes `delete req.body.dnipac`/`_id` so the identifier can't be changed through the body; the form also disables the DNI field (`:disabled="editando"`) while editing.
- The old unique index `iddoc_1` was dropped from `doctores` when doctors switched to `_id`. Removing a `unique` field from a schema does **not** drop its index; drop it manually or every save fails with E11000 on `null`.

### Form behaviour to preserve (both pages mirror each other; doctors have no 🔍, the filter replaces it)
- Field validation ("punish late, reward early"): the error appears on `@blur`; while it is shown, `@input` re-validates so it disappears as soon as the value is correct. **Never erase the user's value**; only normalise it (upper case, trim) once it is valid. Required fields (DNI, phone): an empty value doesn't change the flag (untouched fields aren't marked, a visible error persists until fixed). Optional fields (email): empty clears the error. Error messages sit together above Gardar (`.erros`), each with a valid example, and keep their `id` for the inputs' `aria-describedby`. Gardar is disabled while the computed `motivoNonGardar` is non-empty (errors shown, or missing required fields / privacy checkbox); that text is shown as a hover hint via the wrapping `span.axuda-gardar` (a disabled button gets no mouse events, so it has `pointer-events: none`).
- `guardarPaciente` re-runs `validarDocumento()`/`validarCorreo()`/`validarTelefono()` before saving, because pressing Enter submits without firing `@blur`. 🔍 also validates the DNI before searching.
- On success it calls `limpiarFormpac()`; on error the form keeps its data.
- Changing province resets `munipac` in the `@change` (not inside `cargarMunicipios`, which ✏️/🔍 also call and must keep the saved municipality).
- 🔍 is disabled while editing; a 404 on search sets `editando = false`.
- The "Eliminar" button next to Gardar only shows when `editando`. Deleting the patient loaded in the form clears it.
- Alerts (SweetAlert, texts in Galician): an action that first asks "Seguro que…?" (delete, modify) shows **no success message** afterwards, only an error if it fails; creating a new patient (no question) shows success. Loading a record (✏️/🔍) shows no popup. Backend 409 → specific "Xa existe…" message. Failing to load the list (`cargarPacientes`) or provinces shows an error.
- Unsaved data: `copiaOrixinal` holds a snapshot (`fotoFormulario()`) of the loaded patient; `haiCambiosSenGardar()` compares against it (or, for a new form, checks for any typed field except the privacy checkbox). 🧹 (`limparConConfirmacion`), ✏️ and 🔍 call `confirmarDescartar()` first; 🔍 ignores the DNI itself. Gardar on an unchanged loaded patient shows "Non hai cambios que gardar". `limpiarFormpac()` itself never asks (it's also used after save/delete). Leaving the page with unsaved data is not guarded.
- Filter: while not `editando`, the form doubles as a filter. `pacientesFiltrados` keeps patients where every filled `CAMPOS_FILTRO` field is *contained* in theirs, ignoring case and accents (`normalizar`). The table iterates `pacientesFiltrados`, so row actions must use `pacientes.indexOf(p)`, not the row `index`. Known side effects: typed filter text counts as unsaved data (✏️/🧹 ask), and partial DNI/phone get marked invalid on blur.
- PDF: `utils/pdf.js` `generarPDF(titulo, cabeceiras, filas, subtitulo)` (jsPDF + jspdf-autotable, palette green header) opens the PDF in a new tab via `window.open(doc.output("bloburl"))` (must run inside the click handler or popup blockers interfere; the tab has no real filename). Patients export only DNI, Apelido, Nome, Teléfono (privacy) of the filtered list.
- `gardando` locks Gardar/Eliminar while a save or delete request is in progress (prevents double submissions when the DB is slow or reconnecting); `motivoNonGardar` then reads "Gardando…".
- Doctors: `coledoc` starts as `null` (no radio checked) so Colexiado must be chosen and an empty value doesn't filter; `limpiarFormdoc` resets it to `null` and deletes every non-`CAMPOS` key (`_id`, `__v`). The doctors PDF leaves out the MongoDB `_id`.
- `Object.assign(form, record)` leaves extra keys (`_id`, `__v`) and keeps old values for keys the record doesn't have. Account for that when loading or clearing.

## Styling conventions
- `src/style.css` holds the global palette as CSS variables (one green hue: `--accent`, `--accent-dark`, `--accent-light`, `--accent-soft`, `--heading-bg`, `--text-h`, `--danger`) and the global alignment classes. Use the variables, not new hex colours; white text is only used on colours with ≥4.5:1 contrast.
- Alignment rule (teacher's requirement): text left (default), numbers/DNI/IDs/dates/phones `.centrado`, calculated amounts (future invoices) `.dereita`.
- Component styles are `scoped`. `#app` centres text globally, so each page panel sets `text-align: left`.
- Form rows are flex: `.campo { flex: 1; min-width: 0 }`. Fixed-format fields (DNI, ID, phone, date, selects, radio fieldset) get `flex: 0 0 auto` plus a fixed `width` in `em`; text fields share the rest. Select widths were measured for their longest option (`#municipio` intentionally fits ~99% of names).
- Rule order matters for same-specificity overrides (e.g. `.campo-id label` must come after `.campo label`).
- Tailwind is planned. Its Preflight reset will change defaults (headings, buttons, lists) on existing pages.
