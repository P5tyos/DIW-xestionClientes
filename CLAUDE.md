# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Sanidad Teis": a class project (DIW, a front-end module) for a health centre. Vue 3 + Vite SPA with a small Express + Mongoose backend in the same repo. Management pages: patients (`XestionPaciente.vue`), doctors (`XestionDoctores.vue`) and appointments (`XestionCitas.vue`, model `Cita.js`, routes `/api/citas`; POST checks the patient's DNI exists → 404). The student follows the teacher's pace, so keep changes scoped to what is asked and explain them; the user often wants the reasoning, not only the fix.

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
- `utils/alertas.js`: SweetAlert2 helpers (`alertaExito`, `alertaError`, `alertaInfo`, `alertaConfirmacion`). `alertaConfirmacion` resolves to a Swal **result object**, so check `.isConfirmed`, never the object itself (an object is always truthy, so Cancel would still delete). Deletes use `alertaEliminar` instead (red "Eliminar" button, `focusCancel: true` so Enter/habit cancels).
- `store/` (Pinia, registered in `main.js`): `pacienteStore.js` (`usePacienteStore`: `dnipac`, `nomepac`, `apelpac`) and `doctorStore.js` (`useDoctorStore`: `_id`, `nomedoc`, `apeldoc`, `espedoc`). **Rule: selected for Citas = loaded in the Pacientes/Doctores form.** `cargarNoFormulario()` (used by ✏️, 🔍 and `recuperarSeleccionado`) selects; `limpiarFormpac()`/`limpiarFormdoc()` deselect, so saving, deleting the loaded record and 🧹 all clear the selection (saving does not select). Leaving a page destroys its form, so on mount `recuperarSeleccionado()` reloads the stored patient/doctor into the form. Pinia state is lost on a full reload (F5). The folder is `store/` (singular).
- `XestionCitas.vue`: row 1 (all read-only, one line on desktop) = ID cita (disabled), DNI paciente, Doctor (disabled input with the selected doctor's name, teacher's request) and ID doctor; DNI and ID are `RouterLink`s styled like fields (clicking opens Pacientes/Doctores, where the selected one is reloaded; "—" when none; `aria-labelledby` because a `<label for>` can't target a link), 🧹; row 2 = Data, Hora, Motivo, Estado; row 3 = Observacións. Patient/doctor come only from the stores. The list shows only the selected patient's citas (`citasPaciente`, patient name from the store), with a hint when none is selected. 🧹 there clears both stores. Citas can be created, listed and edited: ✏️ (Accións column) loads the cita into the form (`editando`, its `_id` shown in ID cita) and **selects the cita's own doctor** in `doctorStore`; Gardar then asks for confirmation and PUTs (`modifyCita`), with the same "Non hai cambios" / unsaved-changes (`copiaOrixinal`, `confirmarDescartar`) rules as the other pages. **Citas are never deleted** (teacher's rule: the data must be kept; only the `estado` changes; removal is done directly on the server). The doctor can't be changed while editing (going to Doctores destroys the Citas form).
- Management pages follow the same structure: a `reactive` form object (`novoPaciente` / `novoDoctor`), an `editando` ref, validation-flag refs, and functions grouped under comment headers ("Zona de declaracións", "ciclo de vida", "métodos", "funcións auxiliares"), each with a one-line comment.

**Backend (`backend/`)**
- `server.js`: Express app; mounts `rutas/pacientes.rutas.js` and `rutas/doctores.rutas.js`, and serves `/api/municipios` and `/api/especialidades` straight from the JSON files in `backend/data/`.
- `modelos/*.js`: Mongoose schemas with explicit `collection` names. Field names use a suffix per entity: `…pac` for patients (`dnipac`, `nomepac`, `apelpac`, `movilpac`, `propac`, `munipac`, `lopdpac`…) and `…doc` for doctors (`nomedoc`, `apeldoc`, `coledoc`, `movildoc`, `maildoc`, `espedoc`).

### How each entity is identified (they differ on purpose)

| | Patients | Doctors |
|---|---|---|
| Key | `dnipac` (DNI/NIE) | MongoDB `_id` |
| API | `/api/pacientes/:dni` (GET/PUT/DELETE) | `/api/doctores/:id` (PUT/DELETE), `findById…` |
| Citas link | `cita.dnipac` (plain String, no `ref`) | `cita.doctorId` (`ObjectId`, `ref: "Doctor"`, populated in `GET /api/citas`) |
| On load into form (✏️/🔍) | `delete novoPaciente._id` | **keep** `_id`; it is what `modifyDoctor` uses |
| On clear (`limpiarForm…`) | fields reset to `""`/`false` | also `delete novoDoctor._id` (an `_id: ""` breaks the next POST) |
| Create | POST checks the DNI and returns 409 if it already exists | POST/PUT return 409 only if **every** field equals another doctor's (`datosDoctor`; PUT excludes itself with `_id: { $ne }`) |

- PUT routes `delete req.body.dnipac`/`_id` so the identifier can't be changed through the body; the form also disables the DNI field (`:disabled="editando"`) while editing.
- The old unique index `iddoc_1` was dropped from `doctores` when doctors switched to `_id`. Removing a `unique` field from a schema does **not** drop its index; drop it manually or every save fails with E11000 on `null`.

### Form behaviour to preserve (both pages mirror each other; doctors have no 🔍, the filter replaces it)
- Field validation ("punish late, reward early"): the error appears on `@blur`; while it is shown, `@input` re-validates so it disappears as soon as the value is correct. **Never erase the user's value**; only normalise it (upper case, trim) once it is valid. Required fields (DNI, phone): an empty value doesn't change the flag (untouched fields aren't marked, a visible error persists until fixed). Optional fields (email): empty clears the error. Error messages sit together above Gardar (`.erros`), each with a valid example, and keep their `id` for the inputs' `aria-describedby`. Gardar is disabled while the computed `motivoNonGardar` is non-empty (errors shown, or missing required fields / privacy checkbox); that text is a hover tooltip (wrapping `span.group`, `pointer-fine:group-hover:block`; the disabled button has `disabled:pointer-events-none`) and also a `<p id="axuda-gardar">` under the buttons, visible unless there's a mouse (`pointer-fine:hidden`), referenced by `aria-describedby`. Headless Chrome reports `pointer: none` and can't emulate a mouse, so the tooltip can only be checked manually.
- `guardarPaciente` re-runs `validarDocumento()`/`validarCorreo()`/`validarTelefono()` before saving, because pressing Enter submits without firing `@blur`. 🔍 also validates the DNI before searching.
- On success it calls `limpiarFormpac()`; on error the form keeps its data.
- Changing province resets `munipac` in the `@change` (not inside `cargarMunicipios`, which ✏️/🔍 also call and must keep the saved municipality).
- 🔍 is disabled while editing; a 404 on search sets `editando = false`.
- Button row under the form: Gardar, then a secondary "Limpiar" button (same action as 🧹, which also stays at the top), then "Eliminar" with extra left margin (separated on purpose after an accidental delete). Eliminar only shows when `editando`. Deleting the patient loaded in the form clears it.
- Alerts (SweetAlert, texts in Galician): an action that first asks "Seguro que…?" (delete, modify) shows **no success message** afterwards, only an error if it fails; creating a new patient (no question) shows success. Loading a record (✏️/🔍) shows no popup. Backend 409 → specific "Xa existe…" message. Failing to load the list (`cargarPacientes`) or provinces shows an error.
- Unsaved data: `copiaOrixinal` holds a snapshot (`fotoFormulario()`) of the loaded patient; `haiCambiosSenGardar()` compares against it (or, for a new form, checks for any typed field except the privacy checkbox). 🧹 (`limparConConfirmacion`), ✏️ and 🔍 call `confirmarDescartar()` first; 🔍 ignores the DNI itself. Gardar on an unchanged loaded patient shows "Non hai cambios que gardar". `limpiarFormpac()` itself never asks (it's also used after save/delete). Leaving the page with unsaved data is not guarded.
- Filter: while not `editando`, the form doubles as a filter. `pacientesFiltrados` keeps patients where every filled `CAMPOS_FILTRO` field is *contained* in theirs, ignoring case and accents (`normalizar`). The table iterates `pacientesFiltrados`, so row actions must use `pacientes.indexOf(p)`, not the row `index`. Known side effects: typed filter text counts as unsaved data (✏️/🧹 ask), and partial DNI/phone get marked invalid on blur.
- PDF: `utils/pdf.js` `generarPDF(titulo, cabeceiras, filas, subtitulo)` (jsPDF + jspdf-autotable, palette green header) opens the PDF in a new tab via `window.open(doc.output("bloburl"))` (must run inside the click handler or popup blockers interfere; the tab has no real filename). Patients export only DNI, Apelido, Nome, Teléfono (privacy) of the filtered list.
- `gardando` locks Gardar/Eliminar while a save or delete request is in progress (prevents double submissions when the DB is slow or reconnecting); `motivoNonGardar` then reads "Gardando…".
- Doctors: `coledoc` starts as `null` (no radio checked) so Colexiado must be chosen and an empty value doesn't filter; `limpiarFormdoc` resets it to `null` and deletes every non-`CAMPOS` key (`_id`, `__v`). The doctors PDF leaves out the MongoDB `_id`.
- `Object.assign(form, record)` leaves extra keys (`_id`, `__v`) and keeps old values for keys the record doesn't have. Account for that when loading or clearing.

## Styling conventions
- **Tailwind CSS v4, utility classes only** (`@tailwindcss/vite`; config lives in CSS, no `tailwind.config.js`). No component has a `<style>` block. **`GUIA-ESTILO.md` is the reference** for every value (colours, text sizes, spacing, radii, component specs, mobile rules, accessibility).
- `src/style.css` (~60 lines): `@import "tailwindcss"`, an `@theme` with the palette as Galician-named tokens (`acento`, `acento-escuro`, `titulo`, `banda`, `acento-claro`, `foco`, `acento-suave`, `fondo`, `texto`, `perigo`, `perigo-suave`, `borde`, `desactivado`, `texto-desactivado` → classes like `bg-acento`, `text-titulo`), and **Tailwind's default colours are switched off** (`--color-*: initial`; only `white`/`black` re-added). Plus a `@layer base` with the background image, text/link colours and the focus outline. Colours used outside CSS must be updated by hand: `utils/pdf.js` (`VERDE` RGB) and `utils/alertas.js` (`confirmButtonColor`).
- Shared UI components in `src/components/comun/`: `BotonAccion` (variants `principal`/`secundario`/`perigo`/`icona`/`icona-perigo`; `to` → `RouterLink` styled as a button), `TarxetaPanel` (white panel), `TituloSeccion` (green band + `#accion` slot), `CampoFormulario` (label above + field classes via `v-slot="{ clases }"`), `CaixaErros`. Icons: `lucide-vue-next`, imported per icon, `aria-hidden` with the button carrying the `aria-label`.
- **Mobile first:** unprefixed classes are for phones, `md:` (768 px+) for desktop. Phones: one field per row, full-width 44 px buttons, ☰ menu, tables scroll inside an `overflow-x-auto` box. Page width max 1280 px (`max-w-7xl` in `App.vue`).
- Form pages: the page panel has `rounded-t-none` (flush with the menu); labels above fields; fixed-format fields have fixed `md:w-*` widths, text fields `md:flex-1`; Gardar/Limpiar/Eliminar are `md:w-27`, Eliminar separated (`md:ml-10`). No "campo obrigatorio" note (the red `*` plus the Gardar hint explain it; inputs have `required`).
- Inicio starts with a decorative video (`h-[60vh]`, page-content width, no text on it) and the welcome card below. Files: `public/video/inicio.webm` + `.mp4` + poster (~1–1.4 MB, 1280×720, 18 s loop, no audio; sources/license in `public/video/CREDITOS.txt`, credit in the `figcaption` on a light chip). It starts from the script (no `autoplay` attribute) only if `prefers-reduced-motion` is not set, has a ⏸/▶ button (WCAG 2.2.2), `preload="none"` and `aria-hidden`. Self-hosted on purpose (a YouTube embed would need cookie consent).
- Alignment (teacher's rule): text left, numbers/DNI/IDs/dates/phones `text-center`, future amounts `text-right tabular-nums`.
- Tailwind pitfalls seen here: two utilities setting the same property on one element don't override by order in the class list (use a more specific variant, e.g. `[&.router-link-active]:border-acento-claro`); never build class names by concatenation (Tailwind only generates full class strings it finds in the source); `hover:` and `pointer-fine:` don't apply in headless Chrome (`pointer: none`), so hover styles can only be checked by hand.
