/**
 * DatosUsuario.js
 * Lógica de la página de perfil del usuario.
 * Gestiona datos personales, cambio de contraseña,
 * historial de reservas y listado de favoritos.
 * Encuentra tu Cargador — Informática II
 * Autores: Gabriel Kaakedjian, Gabriel Peña
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    const datoNombre             = document.getElementById('datoNombre');
    const datoApellido           = document.getElementById('datoApellido');
    const datoNombreUsuario      = document.getElementById('datoNombreUsuario');
    const textoUsuario           = document.getElementById('textoUsuario');
    const contrasenaActual       = document.getElementById('contrasenaActual');
    const contrasenaNueva        = document.getElementById('contrasenaNueva');
    const confirmarContrasena    = document.getElementById('confirmarContrasena');
    const botonCambiarContrasena = document.getElementById('botonCambiarContrasena');
    const mensajeContrasena      = document.getElementById('mensajeContrasena');
    const contenedorReservas     = document.getElementById('contenedorReservas');
    const contenedorFavoritos    = document.getElementById('contenedorFavoritos');

    const buscarReserva        = document.getElementById('buscarReserva');
    const filtroEstadoReserva  = document.getElementById('filtroEstadoReserva');
    const buscarFavorito       = document.getElementById('buscarFavorito');
    const filtroTipoFavorito   = document.getElementById('filtroTipoFavorito');
    const filtroEstadoFavorito = document.getElementById('filtroEstadoFavorito');

    let todasLasReservas  = [];
    let todosLosFavoritos = [];

    const nombreUsuario = localStorage.getItem('nombreUsuario');
    if (textoUsuario && nombreUsuario) {
        textoUsuario.textContent = nombreUsuario;
    }

    async function cargarDatosUsuario() {
        try {
            const datos = await obtenerDatosUsuario();
            datoNombre.textContent        = datos.nombre;
            datoApellido.textContent      = datos.apellido;
            datoNombreUsuario.textContent = datos.nombreUsuario;
        } catch (error) {
            console.error('Error al cargar datos del usuario:', error.message);
        }
    }

    botonCambiarContrasena.addEventListener('click', async () => {
        const actual    = contrasenaActual.value.trim();
        const nueva     = contrasenaNueva.value.trim();
        const confirmar = confirmarContrasena.value.trim();

        if (!actual || !nueva || !confirmar) {
            mostrarMensaje(mensajeContrasena, 'Todos los campos son obligatorios.', true);
            return;
        }

        if (nueva.length < 8) {
            mostrarMensaje(mensajeContrasena, 'La nueva contraseña debe tener al menos 8 caracteres.', true);
            return;
        }

        if (nueva !== confirmar) {
            mostrarMensaje(mensajeContrasena, 'Las contraseñas nuevas no coinciden.', true);
            return;
        }

        try {
            await cambiarContrasena(actual, nueva);
            mostrarMensaje(mensajeContrasena, 'Contraseña actualizada correctamente.', false);
            contrasenaActual.value    = '';
            contrasenaNueva.value     = '';
            confirmarContrasena.value = '';
        } catch (error) {
            mostrarMensaje(mensajeContrasena, error.message, true);
        }
    });

    async function cargarReservas() {
        try {
            const reservas       = await obtenerReservas();
            todasLasReservas     = reservas;
            renderizarReservas(reservas);
        } catch (error) {
            contenedorReservas.innerHTML = '<p class="texto-vacio">Error al cargar las reservas.</p>';
            console.error('Error al cargar reservas:', error.message);
        }
    }

    function renderizarReservas(reservas) {
        if (reservas.length === 0) {
            contenedorReservas.innerHTML = '<p class="texto-vacio">No hay reservas que coincidan con los filtros.</p>';
            return;
        }

        contenedorReservas.innerHTML = '';

        reservas.forEach(reserva => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'tarjeta-reserva';

            const fecha = new Date(reserva.fechaReserva).toLocaleDateString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            tarjeta.innerHTML = `
                <div class="reserva-info">
                    <span class="reserva-nombre">${reserva.nombreCargador}</span>
                    <span class="reserva-fecha">${reserva.direccion}</span>
                    <span class="reserva-fecha">${fecha}</span>
                </div>
                <div class="reserva-acciones">
                    <span class="badge-estado badge-${reserva.estado}">
                        ${etiquetaEstado(reserva.estado)}
                    </span>
                    ${reserva.estado === 'activa' ? `
                        <button class="boton-peligro" data-id="${reserva.id}">
                            Cancelar
                        </button>
                    ` : ''}
                </div>
            `;

            const botonCancelar = tarjeta.querySelector('.boton-peligro');
            if (botonCancelar) {
                botonCancelar.addEventListener('click', async () => {
                    try {
                        await cancelarReserva(reserva.id);
                        cargarReservas();
                    } catch (error) {
                        console.error('Error al cancelar reserva:', error.message);
                    }
                });
            }

            contenedorReservas.appendChild(tarjeta);
        });
    }

    function aplicarFiltrosReservas() {
        const busqueda = buscarReserva.value.trim().toLowerCase();
        const estado   = filtroEstadoReserva.value;

        const filtradas = todasLasReservas.filter(r => {
            const coincideNombre = !busqueda || r.nombreCargador.toLowerCase().includes(busqueda);
            const coincideEstado = !estado   || r.estado === estado;
            return coincideNombre && coincideEstado;
        });

        renderizarReservas(filtradas);
    }

    buscarReserva.addEventListener('input',        aplicarFiltrosReservas);
    filtroEstadoReserva.addEventListener('change', aplicarFiltrosReservas);

    async function cargarFavoritos() {
        try {
            const favoritos  = await obtenerFavoritos();
            todosLosFavoritos = favoritos;
            renderizarFavoritos(favoritos);
        } catch (error) {
            contenedorFavoritos.innerHTML = '<p class="texto-vacio">Error al cargar los favoritos.</p>';
            console.error('Error al cargar favoritos:', error.message);
        }
    }

    function renderizarFavoritos(favoritos) {
        if (favoritos.length === 0) {
            contenedorFavoritos.innerHTML = '<p class="texto-vacio">No hay favoritos que coincidan con los filtros.</p>';
            return;
        }

        contenedorFavoritos.innerHTML = '';

        favoritos.forEach(favorito => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'tarjeta-favorito';

            tarjeta.innerHTML = `
                <div class="favorito-info">
                    <span class="favorito-nombre">${favorito.nombreCargador}</span>
                    <span class="favorito-direccion">${favorito.direccion}</span>
                </div>
                <div style="display:flex;align-items:center;gap:0.6rem;flex-shrink:0;">
                    <span class="badge-estado badge-${favorito.estado}">
                        ${etiquetaEstadoCargador(favorito.estado)}
                    </span>
                    <button class="boton-peligro" data-id="${favorito.idCargador}">
                        Eliminar
                    </button>
                </div>
            `;

            const botonEliminar = tarjeta.querySelector('.boton-peligro');
            botonEliminar.addEventListener('click', async () => {
                try {
                    await eliminarFavorito(favorito.idCargador);
                    cargarFavoritos();
                } catch (error) {
                    console.error('Error al eliminar favorito:', error.message);
                }
            });

            contenedorFavoritos.appendChild(tarjeta);
        });
    }

    function aplicarFiltrosFavoritos() {
        const busqueda = buscarFavorito.value.trim().toLowerCase();
        const tipo     = filtroTipoFavorito.value;
        const estado   = filtroEstadoFavorito.value;

        const filtrados = todosLosFavoritos.filter(f => {
            const coincideNombre = !busqueda || f.nombreCargador.toLowerCase().includes(busqueda);
            const coincideTipo   = !tipo     || f.tipo   === tipo;
            const coincideEstado = !estado   || f.estado === estado;
            return coincideNombre && coincideTipo && coincideEstado;
        });

        renderizarFavoritos(filtrados);
    }

    buscarFavorito.addEventListener('input',          aplicarFiltrosFavoritos);
    filtroTipoFavorito.addEventListener('change',     aplicarFiltrosFavoritos);
    filtroEstadoFavorito.addEventListener('change',   aplicarFiltrosFavoritos);

    function etiquetaEstado(estado) {
        const etiquetas = {
            activa:     'Activa',
            completada: 'Completada',
            cancelada:  'Cancelada'
        };
        return etiquetas[estado] || estado;
    }

    function etiquetaEstadoCargador(estado) {
        const etiquetas = {
            libre:         'Libre',
            ocupado:       'Ocupado',
            en_reparacion: 'En reparación'
        };
        return etiquetas[estado] || estado;
    }

    function mostrarMensaje(elemento, texto, esError) {
        elemento.textContent = texto;
        elemento.className   = 'mensaje-contrasena' + (esError ? ' error' : '');
        elemento.classList.remove('oculto');
    }

    cargarDatosUsuario();
    cargarReservas();
    cargarFavoritos();

});