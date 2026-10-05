import { createRouter, createWebHistory } from "vue-router"

import IniCio from '../components/IniCio.vue'
import XestionPaciente from '../components/XestionPaciente.vue'
import SobreNos from '../components/SobreNos.vue'
import AvisoLegal from '../components/AvisoLegal.vue'
import NotFound from '../components/NotFound.vue'
import PoliticaPrivacidad from "../components/PoliticaPrivacidad.vue"

const routes = [
    {path: '/', name: 'IniCio', component: IniCio},
    {path: '/xestion-pacientes', name: 'XestionPaciente', component: XestionPaciente},
    {path: '/sobrenos', name: 'SobreNos', component: SobreNos},
    {path: '/avisolegal', name: 'AvisoLegal', component: AvisoLegal},
    {path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound},
    {path: '/politica-privacidad', name: 'PoliticaPrivacidad', component: PoliticaPrivacidad}
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router