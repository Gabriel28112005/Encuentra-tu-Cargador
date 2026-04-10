// Cliente HTTP centralizado para todas las llamadas a la API REST.

'use strict';

// Configuracion base
const URL_BASE = 'http://localhost:3000/api';

// Función para obtener las cabeceras de autenticación (incluyendo el JWT)

function obtenerCabeceras() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Función para manejar la respuesta de las peticiones fetch. Comprueba si la respuesta es correcta y la devuelve en JSON, o lanza un error con el mensaje del servidor.

async function manejarRespuesta(respuesta) {
    const datos = await respuesta.json();
    if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Error en la petición.');
    }
    return datos;
}

// Autentificación:

/**
 * Inicia sesión con las credenciales del usuario.
 * @param {string} nombreUsuario
 * @param {string} contrasena
 * @param {string} tipoDispositivo
 * @returns {Promise} Token JWT, rol y nombreUsuario
 */

async function login(nombreUsuario, contrasena, tipoDispositivo) {
    const respuesta = await fetch(`${URL_BASE}/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nombreUsuario, contrasena, tipoDispositivo })
    });
    return manejarRespuesta(respuesta);
}

/**
 * Cierra la sesión del usuario.
 * @returns {Promise}
 */

async function logout() {
    const respuesta = await fetch(`${URL_BASE}/logout`, {
        method:  'POST',
        headers: obtenerCabeceras()
    });
    return manejarRespuesta(respuesta);
}

// Cargadores

/**
 * Obtiene la lista de todos los cargadores.
 * @returns {Promise} Array de cargadores
 */

async function obtenerCargadores() {
    const respuesta = await fetch(`${URL_BASE}/cargadores`, {
        headers: obtenerCabeceras()
    });
    return manejarRespuesta(respuesta);
}

/**
 * Obtiene los detalles de un cargador concreto.
 * @param {number} id
 * @returns {Promise} Datos del cargador
 */

async function obtenerCargador(id) {
    const respuesta = await fetch(`${URL_BASE}/cargadores/${id}`, {
        headers: obtenerCabeceras()
    });
    return manejarRespuesta(respuesta);
}

/**
 * Crea un nuevo cargador (solo administrador).
 * @param {Object} datos
 * @returns {Promise}
 */

async function crearCargador(datos) {
    const respuesta = await fetch(`${URL_BASE}/cargadores`, {
        method:  'POST',
        headers: obtenerCabeceras(),
        body:    JSON.stringify(datos)
    });
    return manejarRespuesta(respuesta);
}

/**
 * Actualiza un cargador (administrador y técnico).
 * @param {number} id
 * @param {Object} datos
 * @returns {Promise}
 */

async function actualizarCargador(id, datos) {
    const respuesta = await fetch(`${URL_BASE}/cargadores/${id}`, {
        method:  'PUT',
        headers: obtenerCabeceras(),
        body:    JSON.stringify(datos)
    });
    return manejarRespuesta(respuesta);
}

/**
 * Elimina un cargador (solo administrador).
 * @param {number} id
 * @returns {Promise}
 */

async function eliminarCargador(id) {
    const respuesta = await fetch(`${URL_BASE}/cargadores/${id}`, {
        method:  'DELETE',
        headers: obtenerCabeceras()
    });
    return manejarRespuesta(respuesta);
}

// Reservas

/**
 * Obtiene las reservas del usuario autenticado.
 * Administrador y técnico obtienen todas las reservas.
 * @returns {Promise} Array de reservas
 */

async function obtenerReservas() {
    const respuesta = await fetch(`${URL_BASE}/reservas`, {
        headers: obtenerCabeceras()
    });
    return manejarRespuesta(respuesta);
}

/**
 * Crea una nueva reserva.
 * @param {number} idCargador
 * @returns {Promise}
 */

async function crearReserva(idCargador) {
    const respuesta = await fetch(`${URL_BASE}/reservas`, {
        method:  'POST',
        headers: obtenerCabeceras(),
        body:    JSON.stringify({ idCargador })
    });
    return manejarRespuesta(respuesta);
}

/**
 * Marca una reserva como completada y libera el cargador.
 * @param {number} id
 * @returns {Promise}
 */

async function completarReserva(id) {
    const respuesta = await fetch(`${URL_BASE}/reservas/${id}/completar`, {
        method:  'PUT',
        headers: obtenerCabeceras()
    });
    return manejarRespuesta(respuesta);
}

/**
 * Cancela una reserva.
 * @param {number} id
 * @returns {Promise}
 */

async function cancelarReserva(id) {
    const respuesta = await fetch(`${URL_BASE}/reservas/${id}`, {
        method:  'DELETE',
        headers: obtenerCabeceras()
    });
    return manejarRespuesta(respuesta);
}

// Favoritos

/**
 * Obtiene los cargadores favoritos del usuario autenticado.
 * @returns {Promise} Array de favoritos
 */

async function obtenerFavoritos() {
    const respuesta = await fetch(`${URL_BASE}/favoritos`, {
        headers: obtenerCabeceras()
    });
    return manejarRespuesta(respuesta);
}

/**
 * Añade un cargador a favoritos.
 * @param {number} idCargador
 * @returns {Promise}
 */

async function añadirFavorito(idCargador) {
    const respuesta = await fetch(`${URL_BASE}/favoritos`, {
        method:  'POST',
        headers: obtenerCabeceras(),
        body:    JSON.stringify({ idCargador })
    });
    return manejarRespuesta(respuesta);
}

/**
 * Elimina un cargador de favoritos.
 * @param {number} idCargador
 * @returns {Promise}
 */

async function eliminarFavorito(idCargador) {
    const respuesta = await fetch(`${URL_BASE}/favoritos/${idCargador}`, {
        method:  'DELETE',
        headers: obtenerCabeceras()
    });
    return manejarRespuesta(respuesta);
}

// Notificaciones

/**
 * Obtiene las notificaciones (administrador y técnico).
 * @returns {Promise} Array de notificaciones
 */

async function obtenerNotificaciones() {
    const respuesta = await fetch(`${URL_BASE}/notificaciones`, {
        headers: obtenerCabeceras()
    });
    return manejarRespuesta(respuesta);
}

/**
 * Reporta un cargador defectuoso.
 * @param {number} idCargador
 * @param {string} mensaje
 * @returns {Promise}
 */

async function reportarIncidencia(idCargador, mensaje) {
    const respuesta = await fetch(`${URL_BASE}/notificaciones`, {
        method:  'POST',
        headers: obtenerCabeceras(),
        body:    JSON.stringify({ idCargador, mensaje })
    });
    return manejarRespuesta(respuesta);
}

/**
 * Marca una notificación como leída.
 * @param {number} id
 * @returns {Promise}
 */

async function marcarNotificacionLeida(id) {
    const respuesta = await fetch(`${URL_BASE}/notificaciones/${id}/leida`, {
        method:  'PUT',
        headers: obtenerCabeceras()
    });
    return manejarRespuesta(respuesta);
}

// Usuarios (solo administrador)

/**
 * Obtiene la lista de todos los usuarios.
 * @returns {Promise} Array de usuarios
 */

async function obtenerUsuarios() {
    const respuesta = await fetch(`${URL_BASE}/usuarios`, {
        headers: obtenerCabeceras()
    });
    return manejarRespuesta(respuesta);
}

/**
 * Crea un nuevo usuario.
 * @param {Object} datos
 * @returns {Promise}
 */

async function crearUsuario(datos) {
    const respuesta = await fetch(`${URL_BASE}/usuarios`, {
        method:  'POST',
        headers: obtenerCabeceras(),
        body:    JSON.stringify(datos)
    });
    return manejarRespuesta(respuesta);
}

/**
 * Actualiza un usuario.
 * @param {number} id
 * @param {Object} datos
 * @returns {Promise}
 */

async function actualizarUsuario(id, datos) {
    const respuesta = await fetch(`${URL_BASE}/usuarios/${id}`, {
        method:  'PUT',
        headers: obtenerCabeceras(),
        body:    JSON.stringify(datos)
    });
    return manejarRespuesta(respuesta);
}

/**
 * Elimina un usuario.
 * @param {number} id
 * @returns {Promise}
 */

async function eliminarUsuario(id) {
    const respuesta = await fetch(`${URL_BASE}/usuarios/${id}`, {
        method:  'DELETE',
        headers: obtenerCabeceras()
    });
    return manejarRespuesta(respuesta);
}

// Sesiones (solo administrador)

/**
 * Obtiene el log completo de sesiones.
 * @returns {Promise} Array de sesiones
 */

async function obtenerSesiones() {
    const respuesta = await fetch(`${URL_BASE}/sesiones`, {
        headers: obtenerCabeceras()
    });
    return manejarRespuesta(respuesta);
}

// Datos usuario

/**
 * Obtiene los datos del perfil del usuario autenticado.
 * @returns {Promise} nombre, apellido y nombreUsuario
 */

async function obtenerDatosUsuario() {
    const respuesta = await fetch(`${URL_BASE}/datosusuario`, {
        headers: obtenerCabeceras()
    });
    return manejarRespuesta(respuesta);
}

/**
 * Actualiza la contraseña del usuario autenticado.
 * @param {string} contrasenaActual
 * @param {string} contrasenaNueva
 * @returns {Promise}
 */

async function cambiarContrasena(contrasenaActual, contrasenaNueva) {
    const respuesta = await fetch(`${URL_BASE}/datosusuario/contrasena`, {
        method:  'PUT',
        headers: obtenerCabeceras(),
        body:    JSON.stringify({ contrasenaActual, contrasenaNueva })
    });
    return manejarRespuesta(respuesta);
}