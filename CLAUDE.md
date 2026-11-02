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
| Create | POST checks the DNI and returns 409 if it already exists | no duplicate check |

- PUT routes `delete req.body.dnipac`/`_id` so the identifier can't be changed through the body; the form also disables the DNI field (`:disabled="editando"`) while editing.
- The old unique index `iddoc_1` was dropped from `doctores` when doctors switched to `_id`. Removing a `unique` field from a schema does **not** drop its index; drop it manually or every save fails with E11000 on `null`.

### Form behaviour to preserve (patients; mirror on doctors)
- `guardarPaciente` re-runs `validarDocumento()`/`validarTelefono()` before saving, because pressing Enter submits without firing `@blur`.
- On success it calls `limpiarFormpac()`; on error the form keeps its data.
- Changing province resets `munipac` in the `@change` (not inside `cargarMunicipios`, which ✏️/🔍 also call and must keep the saved municipality).
- 🔍 is disabled while editing; a 404 on search sets `editando = false`.
- The "Eliminar" button next to Gardar only shows when `editando`. Deleting the patient loaded in the form clears it.
- `Object.assign(form, record)` leaves extra keys (`_id`, `__v`) and keeps old values for keys the record doesn't have. Account for that when loading or clearing.

## Styling conventions
- `src/style.css` holds the global palette as CSS variables (one green hue: `--accent`, `--accent-dark`, `--accent-light`, `--accent-soft`, `--heading-bg`, `--text-h`, `--danger`) and the global alignment classes. Use the variables, not new hex colours; white text is only used on colours with ≥4.5:1 contrast.
- Alignment rule (teacher's requirement): text left (default), numbers/DNI/IDs/dates/phones `.centrado`, calculated amounts (future invoices) `.dereita`.
- Component styles are `scoped`. `#app` centres text globally, so each page panel sets `text-align: left`.
- Form rows are flex: `.campo { flex: 1; min-width: 0 }`. Fixed-format fields (DNI, ID, phone, date, selects, radio fieldset) get `flex: 0 0 auto` plus a fixed `width` in `em`; text fields share the rest. Select widths were measured for their longest option (`#municipio` intentionally fits ~99% of names).
- Rule order matters for same-specificity overrides (e.g. `.campo-id label` must come after `.campo label`).
- Tailwind is planned. Its Preflight reset will change defaults (headings, buttons, lists) on existing pages.
