
// GUARDAR EN CARPETA src/utils/alertas.js

import Swal from 'sweetalert2'

// Alerta de éxito
export const alertaExito = (mensaje, titulo = 'Correcto') => {
    return Swal.fire({
        icon: 'success',
        title: titulo,
        text: mensaje,
        confirmButtonText: 'Aceptar'
    })
}

// Alerta de error
export const alertaError = (mensaje, titulo = 'Erro') => {
    return Swal.fire({
        icon: 'error',
        title: titulo,
        text: mensaje,
        confirmButtonText: 'Aceptar'
    })
}

// Alerta informativa
export const alertaInfo = (mensaje, titulo = 'Información') => {
    return Swal.fire({
        icon: 'info',
        title: titulo,
        text: mensaje,
        confirmButtonText: 'Aceptar'
    })
}

// Confirmación de una acción
export const alertaConfirmacion = (mensaje, titulo = 'Atención!') => {
    return Swal.fire({
        icon: 'question',
        title: titulo,
        text: mensaje,
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        reverseButtons: false
    })
}


// Confirmación dun borrado (acción que non se pode desfacer): máis difícil de aceptar "por costume"
// - o botón principal di "Eliminar" e vai en vermello (non un "Aceptar" xenérico)
// - Cancelar vén seleccionado: Enter ou un clic rápido sen ler cancelan en vez de borrar
export const alertaEliminar = (mensaje, titulo = 'Eliminar?') => {
    return Swal.fire({
        icon: 'warning',
        title: titulo,
        text: mensaje,
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        confirmButtonColor: '#b84d4d', // --danger da paleta (Swal non le as variables CSS)
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        focusCancel: true
    })
}
