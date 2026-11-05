<template>
  <div class="xestion-citas">
    <h3>📅 Xestión de citas</h3>
    <!-- de momento só a estrutura: Gardar aínda non garda nada -->
    <form @submit.prevent>
      <!-- fila 1: ID da cita, data e hora -->
      <div class="fila">
        <div class="campo campo-id">
          <label for="id">ID:</label>
          <!-- o _id que xera MongoDB: non se edita -->
          <input id="id" v-model="novaCita._id" type="text" disabled class="centrado" />
          <button type="button" title="Limpar formulario" aria-label="Limpar formulario">🧹</button>
        </div>
        <div class="campo campo-fixo">
          <label for="data">Data:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="data" v-model="novaCita.fecha" type="date" required class="centrado" />
        </div>
        <div class="campo campo-fixo">
          <label for="hora">Hora:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="hora" v-model="novaCita.hora" type="time" required class="centrado" />
        </div>
      </div>
      <!-- fila 2: paciente (DNI) e doctor (_id) -->
      <div class="fila">
        <div class="campo campo-dni">
          <label for="dni">DNI paciente:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="dni" v-model="novaCita.dnipac" type="text" required class="centrado" />
        </div>
        <div class="campo">
          <label for="doctor">ID doctor:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="doctor" v-model="novaCita.doctorId" type="text" required class="centrado" />
        </div>
      </div>
      <!-- fila 3: motivo e estado -->
      <div class="fila">
        <div class="campo">
          <label for="motivo">Motivo:<span class="obrigatorio" aria-hidden="true">*</span></label>
          <input id="motivo" v-model="novaCita.motivo" type="text" required />
        </div>
        <div class="campo campo-fixo">
          <label for="estado">Estado:</label>
          <select id="estado" v-model="novaCita.estado">
            <option value="pendente">Pendente</option>
            <option value="realizada">Realizada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>
      <!-- fila 4: observacións (texto longo) -->
      <div class="fila">
        <div class="campo campo-observacions">
          <label for="observacions">Observacións:</label>
          <textarea id="observacions" v-model="novaCita.observacions" rows="3"></textarea>
        </div>
      </div>
      <div class="fila fila-gardar">
        <button type="submit" class="btn-guardar">Gardar</button>
        <p class="nota-obrigatorio"><span aria-hidden="true">*</span> campo obrigatorio</p>
      </div>
    </form>

    <h3>📋 Listaxe de citas</h3>
    <p>Non hai citas cargadas.</p>
  </div>
</template>

<script setup>
import { reactive } from "vue";

// datos do formulario (os mesmos campos que o modelo Cita do backend)
const novaCita = reactive({
  fecha: "",
  hora: "",
  dnipac: "",
  doctorId: "",
  motivo: "",
  estado: "pendente",
  observacions: "",
});
</script>

<style scoped>
.xestion-citas {
  width: 100%;
  text-align: left; /* #app centra todo; aquí o texto vai á esquerda */
  background: white;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

h3 {
  margin-bottom: 1rem;
  font-weight: 600;
  background-color: var(--heading-bg);
  color: var(--text-h);
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.fila {
  display: flex;
  gap: 1rem;
}

/* label e campo na mesma liña; os campos de texto repártense o espazo */
.campo {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.campo label {
  min-width: 80px;
  font-weight: 500;
}

.campo input,
.campo select,
.campo textarea {
  flex: 1;
  min-width: 0;
  padding: 0.5rem;
  border: 1px solid #767676;
  border-radius: 6px;
  box-sizing: border-box;
  font: inherit;
}

/* campos de formato fixo (data, hora, estado, DNI, ID): só o que miden */
.campo-fixo,
.campo-id,
.campo-dni {
  flex: 0 0 auto;
}

.campo-fixo input,
.campo-fixo select {
  flex: none;
}

.campo-id input {
  flex: none;
  width: 15em;
}

.campo-dni input {
  flex: none;
  width: 9em;
}

/* a label "ID:" sen o ancho mínimo das outras (vai despois de .campo label) */
.campo-id label {
  min-width: auto;
}

/* observacións: a label enriba do texto */
.campo-observacions {
  align-items: flex-start;
}

.campo-observacions textarea {
  resize: vertical;
}

.obrigatorio {
  color: #b00020;
  margin-left: 0.15rem;
}

.fila-gardar {
  position: relative;
  flex-direction: column;
  align-items: center;
}

.btn-guardar {
  background-color: var(--accent);
  color: white;
  border: none;
  padding: 0.4rem 1.5rem;
  cursor: pointer;
}

.btn-guardar:hover {
  background-color: var(--accent-dark);
}

.nota-obrigatorio {
  position: absolute;
  right: 0;
  bottom: 0;
  margin: 0;
  font-size: 0.7rem;
}

@media (max-width: 768px) {
  .xestion-citas {
    padding: 1rem;
  }

  .fila {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
