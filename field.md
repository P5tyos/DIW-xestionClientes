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
