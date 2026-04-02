/**
 * Tecnico.js
 * Lógica del panel de técnico.
 * Gestiona cargadores e incidencias.
 * Encuentra tu Cargador — Informática II
 * Autores: Gabriel Kaakedjian, Gabriel Peña
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* ═══════════════════════════════════════════════════════════
       REFERENCIAS AL DOM
    ════════════════════════════════════════════════════════════ */
    const textoUsuario          = document.getElementById('textoUsuario');
    const nombreBienvenida      = document.getElementById('nombreBienvenida');
    const statCargadores        = document.getElementById('statCargadores');
    const statLibres            = document.getElementById('statLibres');
    const statReparacion        = document.getElementById('statReparacion');
    const statIncidencias       = document.getElementById('statIncidencias');
    const contenedorCargadores  = document.getElementById('contenedorCargadores');
    const contenedorIncidencias = document.getElementById('contenedorIncidencias');
    const buscarCargador        = document.getElementById('buscarCargador');
    const filtroTipoCargador    = document.getElementById('filtroTipoCargador');
    const filtroEstadoCargador  = document.getElementById('filtroEstadoCargador');
    const filtroLeidaIncidencia = document.getElementById('filtroLeidaIncidencia');
    const fondoModalEstado      = document.getElementById('fondoModalEstado');
    const modalNombreCargador   = document.getElementById('modalNombreCargador');
    const idCargadorActualizar  = document.getElementById('idCargadorActualizar');
    const modalNuevoEstado      = document.getElementById('modalNuevoEstado');
    const mensajeModalEstado    = document.getElementById('mensajeModalEstado');
    const botonCancelarEstado   = document.getElementById('botonCancelarEstado');
    const botonGuardarEstado    = document.getElementById('botonGuardarEstado');

    /* ═══════════════════════════════════════════════════════════
       ESTADO
    ════════════════════════════════════════════════════════════ */
    let todosLosCargadores     = [];
    let todasLasIncidencias    = [];

    /* ═══════════════════════════════════════════════════════════
       INICIALIZACIÓN
    ════════════════════════════════════════════════════════════ */
    const nombreUsuario = localStorage.getItem('nombreUsuario');
    const rol           = localStorage.getItem('rol');
    const badgeRol      = document.querySelector('.badge-rol');

    if (textoUsuario) {
        textoUsuario.textContent = nombreUsuario || '';
        textoUsuario.title       = `Nombre de usuario: ${nombreUsuario || ''}`;
    }
    if (badgeRol && rol) {
        badgeRol.title = `Rol: ${capitalizarPrimera(rol)}`;
    }
    if (nombreBienvenida) nombreBienvenida.textContent = nombreUsuario || '';

    cargarTodo();

    /* ═══════════════════════════════════════════════════════════
       NAVEGACIÓN — SCROLL A SECCIÓN
    ════════════════════════════════════════════════════════════ */
    window.irA = function(idSeccion) {
        const seccion = document.getElementById(idSeccion);
        if (seccion) seccion.scrollIntoView({ behavior: 'smooth' });
    };

    /* ═══════════════════════════════════════════════════════════
       CARGAR TODO AL INICIAR
    ════════════════════════════════════════════════════════════ */
    async function cargarTodo() {
        await Promise.all([
            cargarCargadores(),
            cargarIncidencias()
        ]);
        actualizarEstadisticas();
    }

    /* ═══════════════════════════════════════════════════════════
       ESTADÍSTICAS
    ════════════════════════════════════════════════════════════ */
    function actualizarEstadisticas() {
        statCargadores.textContent  = todosLosCargadores.length;
        statLibres.textContent      = todosLosCargadores.filter(c => c.estado === 'libre').length;
        statReparacion.textContent  = todosLosCargadores.filter(c => c.estado === 'en_reparacion').length;
        statIncidencias.textContent = todasLasIncidencias.filter(n => n.leida === 0).length;
    }

    /* ═══════════════════════════════════════════════════════════
       CARGADORES
    ════════════════════════════════════════════════════════════ */
    async function cargarCargadores() {
        try {
            todosLosCargadores = await obtenerCargadores();
            renderizarCargadores(todosLosCargadores);
        } catch (error) {
            contenedorCargadores.innerHTML = '<p class="texto-vacio">Error al cargar cargadores.</p>';
        }
    }

    function renderizarCargadores(cargadores) {
        if (cargadores.length === 0) {
            contenedorCargadores.innerHTML = '<p class="texto-vacio">No hay cargadores que coincidan.</p>';
            return;
        }

        let html = `<table class="tabla-tecnico">
            <thead><tr>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Coste</th>
                <th>Tiempo est.</th>
                <th>Acción</th>
            </tr></thead><tbody>`;

        cargadores.forEach(c => {
            html += `<tr>
                <td>${c.nombre}</td>
                <td>${c.direccion}</td>
                <td>${etiquetaTipo(c.tipo)}</td>
                <td><span class="badge-estado badge-${c.estado}">${etiquetaEstado(c.estado)}</span></td>
                <td>${c.coste} €/kWh</td>
                <td>${c.tiempoEstimado} min</td>
                <td>
                    <button class="boton-actualizar" onclick="abrirModalEstado(${c.id})">
                        Actualizar estado
                    </button>
                </td>
            </tr>`;
        });

        html += '</tbody></table>';
        contenedorCargadores.innerHTML = html;
    }

    function aplicarFiltrosCargadores() {
        const busqueda = buscarCargador.value.trim().toLowerCase();
        const tipo     = filtroTipoCargador.value;
        const estado   = filtroEstadoCargador.value;

        const filtrados = todosLosCargadores.filter(c => {
            const coincideNombre = !busqueda || c.nombre.toLowerCase().includes(busqueda) || c.direccion.toLowerCase().includes(busqueda);
            const coincideTipo   = !tipo     || c.tipo   === tipo;
            const coincideEstado = !estado   || c.estado === estado;
            return coincideNombre && coincideTipo && coincideEstado;
        });

        renderizarCargadores(filtrados);
    }

    buscarCargador.addEventListener('input',        aplicarFiltrosCargadores);
    filtroTipoCargador.addEventListener('change',   aplicarFiltrosCargadores);
    filtroEstadoCargador.addEventListener('change', aplicarFiltrosCargadores);

    /* ═══════════════════════════════════════════════════════════
       MODAL — ACTUALIZAR ESTADO CARGADOR
    ════════════════════════════════════════════════════════════ */
    window.abrirModalEstado = function(id) {
        const cargador = todosLosCargadores.find(c => c.id === id);
        if (!cargador) return;
        idCargadorActualizar.value      = cargador.id;
        modalNombreCargador.textContent = cargador.nombre;
        modalNuevoEstado.value          = cargador.estado;
        mensajeModalEstado.classList.add('oculto');
        fondoModalEstado.classList.remove('oculto');
    };

    botonCancelarEstado.addEventListener('click', () => {
        fondoModalEstado.classList.add('oculto');
    });

    botonGuardarEstado.addEventListener('click', async () => {
        const id     = idCargadorActualizar.value;
        const estado = modalNuevoEstado.value;
        const cargador = todosLosCargadores.find(c => c.id === parseInt(id));
        if (!cargador) return;

        try {
            await actualizarCargador(id, { ...cargador, estado });
            mostrarMensajeModal(mensajeModalEstado, 'Estado actualizado correctamente.', false);
            setTimeout(() => {
                fondoModalEstado.classList.add('oculto');
                cargarCargadores();
                actualizarEstadisticas();
            }, 1200);
        } catch (error) {
            mostrarMensajeModal(mensajeModalEstado, error.message, true);
        }
    });

    /* ═══════════════════════════════════════════════════════════
       INCIDENCIAS
    ════════════════════════════════════════════════════════════ */
    async function cargarIncidencias() {
        try {
            todasLasIncidencias = await obtenerNotificaciones();
            renderizarIncidencias(todasLasIncidencias);
        } catch (error) {
            contenedorIncidencias.innerHTML = '<p class="texto-vacio">Error al cargar incidencias.</p>';
        }
    }

    function renderizarIncidencias(incidencias) {
        if (incidencias.length === 0) {
            contenedorIncidencias.innerHTML = '<p class="texto-vacio">No hay incidencias que coincidan.</p>';
            return;
        }

        let html = `<table class="tabla-tecnico">
            <thead><tr>
                <th>Cargador</th>
                <th>Reportado por</th>
                <th>Mensaje</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acción</th>
            </tr></thead><tbody>`;

        incidencias.forEach(n => {
            const fecha = new Date(n.fechaEnvio).toLocaleDateString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            html += `<tr>
                <td>${n.nombreCargador}</td>
                <td>${n.nombreUsuario}</td>
                <td>${n.mensaje}</td>
                <td>${fecha}</td>
                <td><span class="badge-estado ${n.leida ? 'badge-leida' : 'badge-noleida'}">${n.leida ? 'Leída' : 'Sin leer'}</span></td>
                <td>${!n.leida ? `<button class="boton-marcar" onclick="marcarLeida(${n.id})">Marcar leída</button>` : ''}</td>
            </tr>`;
        });

        html += '</tbody></table>';
        contenedorIncidencias.innerHTML = html;
    }

    function aplicarFiltrosIncidencias() {
        const leida = filtroLeidaIncidencia.value;
        const filtradas = todasLasIncidencias.filter(n =>
            leida === '' || n.leida.toString() === leida
        );
        renderizarIncidencias(filtradas);
    }

    filtroLeidaIncidencia.addEventListener('change', aplicarFiltrosIncidencias);

    window.marcarLeida = async function(id) {
        try {
            await marcarNotificacionLeida(id);
            cargarIncidencias();
            actualizarEstadisticas();
        } catch (error) {
            console.error('Error al marcar incidencia:', error.message);
        }
    };

    /* ═══════════════════════════════════════════════════════════
       UTILIDADES
    ════════════════════════════════════════════════════════════ */
    function etiquetaTipo(tipo) {
        const etiquetas = { rapido: 'Carga rápida', estandar: 'Carga estándar', compatible: 'Carga lenta' };
        return etiquetas[tipo] || tipo;
    }

    function etiquetaEstado(estado) {
        const etiquetas = { libre: 'Libre', ocupado: 'Ocupado', en_reparacion: 'En reparación' };
        return etiquetas[estado] || estado;
    }

    function capitalizarPrimera(texto) {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    function mostrarMensajeModal(elemento, texto, esError) {
        elemento.textContent = texto;
        elemento.className   = 'mensaje-modal' + (esError ? ' error' : '');
        elemento.classList.remove('oculto');
    }

});