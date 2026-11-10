import { defineStore } from 'pinia'

// doctor seleccionado (cargado en Doctores) para usalo na páxina de Citas.
// Os doctores identifícanse polo _id de MongoDB, así que gardamos ese en vez dun DNI
export const useDoctorStore = defineStore('doctor', {
  state: () => ({
        doctores: [],
        _id: null,
        nomedoc: null,
        apeldoc: null,
        espedoc: null,
  }),

  actions: {
    seleccionarDoctor(doctor) {
        this._id = doctor._id;
        this.nomedoc = doctor.nomedoc;
        this.apeldoc = doctor.apeldoc;
        this.espedoc = doctor.espedoc;
    },
    limpiarDoctor() {
        this._id = null;
        this.nomedoc = null;
        this.apeldoc = null;
        this.espedoc = null;
    },
  },
})
