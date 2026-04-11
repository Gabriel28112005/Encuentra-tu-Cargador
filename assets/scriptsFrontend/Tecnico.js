//Lógica del panel de técnico. Se configura la gestión de cargadores e incidencias.

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    const textoUsuario          = document.getElementById('textoUsuario');
    const nombreBienvenida      = document.getElementById('nombreBienvenida');
    const statLibres            = document.getElementById('statLibres');
    const statOcupados          = document.getElementById('statOcupados');
    const statReparacion        = document.getElementById('statReparacion');
    const statIncidencias       = document.getElementById('statIncidencias');
    const tarjetaIncidencias    = document.getElementById('tarjetaIncidencias');
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

    let todosLosCargadores  = [];
    let todasLasIncidencias = [];

    const paginas = { cargadores: 1, incidencias: 1 };
    const ELEMENTOS_POR_PAGINA = 10;

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

    // Función para navegar a una sección del panel (usada en el dashboard)
    window.irA = function(idSeccion) {
        const seccion = document.getElementById(idSeccion);
        if (seccion) seccion.scrollIntoView({ behavior: 'smooth' });
    };

    // Función para cargar tanto los cargadores como las incidencias al iniciar la página
    async function cargarTodo() {
        await Promise.all([
            cargarCargadores(),
            cargarIncidencias()
        ]);
        actualizarEstadisticas();
    }

    // Función para actualizar las estadísticas de los cargadores. La tarjeta de incidencias se muestra en rojo cuando hay pendientes y en azul cuando no hay ninguna
    function actualizarEstadisticas() {
        const pendientes        = todasLasIncidencias.filter(n => n.leida === 0).length;
        statLibres.textContent      = todosLosCargadores.filter(c => c.estado === 'libre').length;
        statOcupados.textContent    = todosLosCargadores.filter(c => c.estado === 'ocupado').length;
        statReparacion.textContent  = todosLosCargadores.filter(c => c.estado === 'en_reparacion').length;
        statIncidencias.textContent = pendientes;

        if (pendientes > 0) {
            tarjetaIncidencias.classList.add('tarjeta-estadistica--alerta');
        } else {
            tarjetaIncidencias.classList.remove('tarjeta-estadistica--alerta');
        }
    }

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

    // Función para cargar y mostrar los cargadores
    async function cargarCargadores() {
        try {
            todosLosCargadores = await obtenerCargadores();
            renderizarCargadores(todosLosCargadores);
        } catch (error) {
            contenedorCargadores.innerHTML = '<p class="texto-vacio">Error al cargar cargadores.</p>';
        }
    }

    // Funciones para el filtrado de los cargadores según su nombre, dirección, tipo y estado:
    function renderizarCargadores(cargadores) {
        if (cargadores.length === 0) {
            contenedorCargadores.innerHTML = '<p class="texto-vacio">No hay cargadores que coincidan.</p>';
            return;
        }

        const paginados = paginar(cargadores, paginas.cargadores);

        let html = `<table class="tabla-tecnico">
            <thead><tr>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Nivel de carga</th>
                <th>Coste</th>
                <th>Tiempo est.</th>
                <th>Acción</th>
            </tr></thead><tbody>`;

        paginados.forEach(c => {
            html += `<tr>
                <td>${c.nombre}</td>
                <td>${c.direccion}</td>
                <td>${etiquetaTipo(c.tipo)}</td>
                <td><span class="badge-estado badge-${c.estado}">${etiquetaEstado(c.estado)}</span></td>
                <td>${c.nivelBateria}%</td>
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

        contenedorCargadores.appendChild(crearPaginacion(
            cargadores.length,
            paginas.cargadores,
            () => { paginas.cargadores--; renderizarCargadores(cargadores); },
            () => { paginas.cargadores++; renderizarCargadores(cargadores); }
        ));
    }

    function aplicarFiltrosCargadores() {
        paginas.cargadores = 1;
        const busqueda  = buscarCargador.value.trim().toLowerCase();
        const tipo      = filtroTipoCargador.value;
        const estado    = filtroEstadoCargador.value;
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

    // Configuraciones para el modal que permite actualizar el estado del cargador.
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
        const id       = idCargadorActualizar.value;
        const estado   = modalNuevoEstado.value;
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

    // Configuraciones para la gestión de incidencias.
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

        const paginadas = paginar(incidencias, paginas.incidencias);

        let html = `<table class="tabla-tecnico">
            <thead><tr>
                <th>Cargador</th>
                <th>Reportado por</th>
                <th>Mensaje</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acción</th>
            </tr></thead><tbody>`;

        paginadas.forEach(n => {
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

        contenedorIncidencias.appendChild(crearPaginacion(
            incidencias.length,
            paginas.incidencias,
            () => { paginas.incidencias--; renderizarIncidencias(incidencias); },
            () => { paginas.incidencias++; renderizarIncidencias(incidencias); }
        ));
    }

    function aplicarFiltrosIncidencias() {
        paginas.incidencias = 1;
        const leida    = filtroLeidaIncidencia.value;
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

    // Actualización en tiempo real del estado de los cargadores mediante WebSocket
    const wsUrl = `ws://localhost:3000?rol=${localStorage.getItem('rol')}`;
    const ws    = new WebSocket(wsUrl);

    ws.addEventListener('message', (evento) => {
        try {
            const datos = JSON.parse(evento.data);

            // Actualizar tabla y estadísticas cuando cambia el estado de un cargador
            if (datos.tipo === 'estadoCargador') {
                const cargador = todosLosCargadores.find(c => c.id === datos.idCargador);
                if (cargador) {
                    cargador.estado = datos.estado;
                    actualizarEstadisticas();
                    renderizarCargadores(todosLosCargadores);
                }
            }

            // Actualizar estadísticas y tabla cuando llega una nueva incidencia
            if (datos.tipo === 'incidencia') {
                cargarIncidencias().then(() => actualizarEstadisticas());
            }

        } catch (error) {
            console.error('Error al procesar mensaje WebSocket:', error.message);
        }
    });

});