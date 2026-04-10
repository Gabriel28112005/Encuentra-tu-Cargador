// Lógica de la página del perfil del usuario. En esta se gestionan los datos personales, el cambio de contraseña, el historial de reservas y el listado de favoritos.

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
 
    const paginas = { reservas: 1, favoritos: 1 };
    const ELEMENTOS_POR_PAGINA = 10;

    // Función auxiliar que genera el HTML de paginación estilo Gmail
    function crearPaginacion(total, paginaActual, onAnterior, onSiguiente) {
        const inicio = Math.min((paginaActual - 1) * ELEMENTOS_POR_PAGINA + 1, total);
        const fin    = Math.min(paginaActual * ELEMENTOS_POR_PAGINA, total);
        const div    = document.createElement('div');
        div.className = 'paginacion';
        div.innerHTML = `
            <span class="paginacion-info">${inicio}–${fin} de ${total}</span>
            <button class="paginacion-boton" id="btnAnterior" ${paginaActual === 1 ? 'disabled' : ''}>&#8249;</button>
            <button class="paginacion-boton" id="btnSiguiente" ${fin >= total ? 'disabled' : ''}>&#8250;</button>
        `;
        div.querySelector('#btnAnterior').addEventListener('click', onAnterior);
        div.querySelector('#btnSiguiente').addEventListener('click', onSiguiente);
        return div;
    }
 
    // Función auxiliar que pagina un array
    function paginar(array, pagina) {
        const inicio = (pagina - 1) * ELEMENTOS_POR_PAGINA;
        return array.slice(inicio, inicio + ELEMENTOS_POR_PAGINA);
    }
 
    const nombreUsuario = localStorage.getItem('nombreUsuario');
    if (textoUsuario && nombreUsuario) {
        textoUsuario.textContent = nombreUsuario;
        textoUsuario.title       = `Nombre de usuario: ${nombreUsuario}`;
    }

    // Mostrar/ocultar contraseña para cada campo del formulario de cambio de contraseña
    function configurarBotonOjo(botonId, inputId, ojoAbierto, ojoTachado) {
        const boton  = document.getElementById(botonId);
        const input  = document.getElementById(inputId);
        const abierto  = document.getElementById(ojoAbierto);
        const tachado  = document.getElementById(ojoTachado);

        boton.addEventListener('click', (evento) => {
            evento.preventDefault();
            evento.stopPropagation();

            const oculta = input.type === 'password';
            input.type = oculta ? 'text' : 'password';

            // Cuando la contraseña es visible se muestra el ojo tachado
            // Cuando la contraseña está oculta se muestra el ojo abierto
            abierto.classList.toggle('oculto', oculta);
            tachado.classList.toggle('oculto', !oculta);

            boton.setAttribute('aria-label', oculta ? 'Ocultar contraseña' : 'Mostrar contraseña');
        });
    }

    configurarBotonOjo('botonVerActual',   'contrasenaActual',    'ojoAbiertoActual',   'ojoTachadoActual');
    configurarBotonOjo('botonVerNueva',    'contrasenaNueva',     'ojoAbiertoNueva',    'ojoTachadoNueva');
    configurarBotonOjo('botonVerConfirmar','confirmarContrasena', 'ojoAbiertoConfirmar','ojoTachadoConfirmar');

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
 
        const paginadas = paginar(reservas, paginas.reservas);
        contenedorReservas.innerHTML = '';
 
        paginadas.forEach(reserva => {
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
                        <button class="boton-completar" data-id="${reserva.id}">
                            Completar
                        </button>
                        <button class="boton-peligro" data-id="${reserva.id}">
                            Cancelar
                        </button>
                    ` : ''}
                </div>
            `;

            // Marcar la reserva como completada y liberar el cargador
            const botonCompletar = tarjeta.querySelector('.boton-completar');
            if (botonCompletar) {
                botonCompletar.addEventListener('click', async () => {
                    try {
                        await completarReserva(reserva.id);
                        cargarReservas();
                    } catch (error) {
                        console.error('Error al completar reserva:', error.message);
                    }
                });
            }

            // Cancelar la reserva y liberar el cargador
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
 
        contenedorReservas.appendChild(crearPaginacion(
            reservas.length,
            paginas.reservas,
            () => { paginas.reservas--; renderizarReservas(reservas); },
            () => { paginas.reservas++; renderizarReservas(reservas); }
        ));
    }
 
    function aplicarFiltrosReservas() {
        paginas.reservas = 1;
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
 
        const paginados = paginar(favoritos, paginas.favoritos);
        contenedorFavoritos.innerHTML = '';
 
        paginados.forEach(favorito => {
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
 
        contenedorFavoritos.appendChild(crearPaginacion(
            favoritos.length,
            paginas.favoritos,
            () => { paginas.favoritos--; renderizarFavoritos(favoritos); },
            () => { paginas.favoritos++; renderizarFavoritos(favoritos); }
        ));
    }
 
    function aplicarFiltrosFavoritos() {
        paginas.favoritos = 1;
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