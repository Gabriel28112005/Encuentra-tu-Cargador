/// Lógica del panel de administrador.

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    const textoUsuario       = document.getElementById('textoUsuario');
    const nombreBienvenida   = document.getElementById('nombreBienvenida');
    const statUsuarios       = document.getElementById('statUsuarios');
    const statCargadores     = document.getElementById('statCargadores');
    const statReservas       = document.getElementById('statReservas');
    const statIncidencias    = document.getElementById('statIncidencias');

    // Contenedores de tablas
    const contenedorUsuarios       = document.getElementById('contenedorUsuarios');
    const contenedorCargadores     = document.getElementById('contenedorCargadores');
    const contenedorReservas       = document.getElementById('contenedorReservas');
    const contenedorFavoritos      = document.getElementById('contenedorFavoritos');
    const contenedorSesiones       = document.getElementById('contenedorSesiones');
    const contenedorNotificaciones = document.getElementById('contenedorNotificaciones');

    // Filtros usuarios
    const buscarUsuario    = document.getElementById('buscarUsuario');
    const filtroRolUsuario = document.getElementById('filtroRolUsuario');

    // Filtros cargadores
    const buscarCargador       = document.getElementById('buscarCargador');
    const filtroTipoCargador   = document.getElementById('filtroTipoCargador');
    const filtroEstadoCargador = document.getElementById('filtroEstadoCargador');

    // Filtros reservas
    const buscarReserva       = document.getElementById('buscarReserva');
    const filtroEstadoReserva = document.getElementById('filtroEstadoReserva');

    // Filtros favoritos
    const buscarFavorito = document.getElementById('buscarFavorito');

    // Filtros sesiones
    const buscarSesion = document.getElementById('buscarSesion');

    // Filtros notificaciones
    const filtroLeidaNotificacion = document.getElementById('filtroLeidaNotificacion');

    // Modal usuario
    const fondoModalUsuario       = document.getElementById('fondoModalUsuario');
    const tituloModalUsuario      = document.getElementById('tituloModalUsuario');
    const idUsuarioEditar         = document.getElementById('idUsuarioEditar');
    const modalNombreUsuario      = document.getElementById('modalNombreUsuario');
    const modalApellidoUsuario    = document.getElementById('modalApellidoUsuario');
    const modalNombreUsuarioInput = document.getElementById('modalNombreUsuarioInput');
    const modalContrasenaUsuario  = document.getElementById('modalContrasenaUsuario');
    const modalRolUsuario         = document.getElementById('modalRolUsuario');
    const mensajeModalUsuario     = document.getElementById('mensajeModalUsuario');
    const grupoContrasenaModal    = document.getElementById('grupoContrasenaModal');
    const botonNuevoUsuario       = document.getElementById('botonNuevoUsuario');
    const botonCancelarUsuario    = document.getElementById('botonCancelarUsuario');
    const botonGuardarUsuario     = document.getElementById('botonGuardarUsuario');

    // Modal cargador
    const fondoModalCargador     = document.getElementById('fondoModalCargador');
    const tituloModalCargador    = document.getElementById('tituloModalCargador');
    const idCargadorEditar       = document.getElementById('idCargadorEditar');
    const modalNombreCargador    = document.getElementById('modalNombreCargador');
    const modalDireccionCargador = document.getElementById('modalDireccionCargador');
    const modalLatitudCargador   = document.getElementById('modalLatitudCargador');
    const modalLongitudCargador  = document.getElementById('modalLongitudCargador');
    const modalTipoCargador      = document.getElementById('modalTipoCargador');
    const modalEstadoCargador    = document.getElementById('modalEstadoCargador');
    const modalTiempoCargador    = document.getElementById('modalTiempoCargador');
    const modalCosteCargador     = document.getElementById('modalCosteCargador');
    const mensajeModalCargador   = document.getElementById('mensajeModalCargador');
    const botonNuevoCargador     = document.getElementById('botonNuevoCargador');
    const botonCancelarCargador  = document.getElementById('botonCancelarCargador');
    const botonGuardarCargador   = document.getElementById('botonGuardarCargador');

    let todosLosUsuarios       = [];
    let todosLosCargadores     = [];
    let todasLasReservas       = [];
    let todosLosFavoritos      = [];
    let todasLasSesiones       = [];
    let todasLasNotificaciones = [];

    // Páginas actuales de cada sección
    const paginas = {
        usuarios:       1,
        cargadores:     1,
        reservas:       1,
        favoritos:      1,
        sesiones:       1,
        notificaciones: 1
    };

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

    // Scroll a la selección al hacer clic
    window.irA = function(idSeccion) {
        const seccion = document.getElementById(idSeccion);
        if (seccion) seccion.scrollIntoView({ behavior: 'smooth' });
    };

    // Cargar todo al iniciar
    async function cargarTodo() {
        await Promise.all([
            cargarUsuarios(),
            cargarCargadores(),
            cargarReservas(),
            cargarFavoritos(),
            cargarSesiones(),
            cargarNotificaciones()
        ]);
        actualizarEstadisticas();
    }

    // Estadísticas
    function actualizarEstadisticas() {
        statUsuarios.textContent    = todosLosUsuarios.length;
        statCargadores.textContent  = todosLosCargadores.length;
        statReservas.textContent    = todasLasReservas.length;
        statIncidencias.textContent = todasLasNotificaciones.filter(n => n.leida === 0).length;
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

    //Usuarios:
    async function cargarUsuarios() {
        try {
            todosLosUsuarios = await obtenerUsuarios();
            renderizarUsuarios(todosLosUsuarios);
        } catch (error) {
            contenedorUsuarios.innerHTML = '<p class="texto-vacio">Error al cargar usuarios.</p>';
        }
    }

    function renderizarUsuarios(usuarios) {
        if (usuarios.length === 0) {
            contenedorUsuarios.innerHTML = '<p class="texto-vacio">No hay usuarios que coincidan.</p>';
            return;
        }

        const paginados = paginar(usuarios, paginas.usuarios);

        let html = `<table class="tabla-admin">
            <thead><tr>
                <th>Nombre de usuario</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Rol</th>
                <th>Registro</th>
                <th>Acciones</th>
            </tr></thead><tbody>`;

        paginados.forEach(u => {
            const fecha = new Date(u.timestamp).toLocaleDateString('es-ES');
            html += `<tr>
                <td>${u.nombreUsuario}</td>
                <td>${u.nombre}</td>
                <td>${u.apellido}</td>
                <td><span class="badge-estado badge-${u.rol}">${capitalizarPrimera(u.rol)}</span></td>
                <td>${fecha}</td>
                <td>
                    <button class="boton-editar" onclick="editarUsuario(${u.id})">Editar</button>
                    <button class="boton-eliminar" onclick="eliminarUsuarioAdmin(${u.id})">Eliminar</button>
                </td>
            </tr>`;
        });

        html += '</tbody></table>';
        contenedorUsuarios.innerHTML = html;

        contenedorUsuarios.appendChild(crearPaginacion(
            usuarios.length,
            paginas.usuarios,
            () => { paginas.usuarios--; renderizarUsuarios(usuarios); },
            () => { paginas.usuarios++; renderizarUsuarios(usuarios); }
        ));
    }

    function aplicarFiltrosUsuarios() {
        paginas.usuarios = 1;
        const busqueda  = buscarUsuario.value.trim().toLowerCase();
        const rol       = filtroRolUsuario.value;
        const filtrados = todosLosUsuarios.filter(u => {
            const coincideNombre = !busqueda || u.nombreUsuario.toLowerCase().includes(busqueda) || u.nombre.toLowerCase().includes(busqueda);
            const coincideRol   = !rol      || u.rol === rol;
            return coincideNombre && coincideRol;
        });
        renderizarUsuarios(filtrados);
    }

    buscarUsuario.addEventListener('input',     aplicarFiltrosUsuarios);
    filtroRolUsuario.addEventListener('change', aplicarFiltrosUsuarios);

    // Nuevo usuario
    botonNuevoUsuario.addEventListener('click', () => {
        tituloModalUsuario.textContent = 'Nuevo usuario';
        idUsuarioEditar.value          = '';
        modalNombreUsuario.value       = '';
        modalApellidoUsuario.value     = '';
        modalNombreUsuarioInput.value  = '';
        modalContrasenaUsuario.value   = '';
        modalRolUsuario.value          = '3';
        grupoContrasenaModal.classList.remove('oculto');
        mensajeModalUsuario.classList.add('oculto');
        fondoModalUsuario.classList.remove('oculto');
    });

    window.editarUsuario = function(id) {
        const usuario = todosLosUsuarios.find(u => u.id === id);
        if (!usuario) return;
        tituloModalUsuario.textContent    = 'Editar usuario';
        idUsuarioEditar.value             = usuario.id;
        modalNombreUsuario.value          = usuario.nombre;
        modalApellidoUsuario.value        = usuario.apellido;
        modalNombreUsuarioInput.value     = usuario.nombreUsuario;
        modalContrasenaUsuario.value      = '';
        grupoContrasenaModal.classList.add('oculto');
        mensajeModalUsuario.classList.add('oculto');
        fondoModalUsuario.classList.remove('oculto');
    };

    window.eliminarUsuarioAdmin = async function(id) {
        if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;
        try {
            await eliminarUsuario(id);
            cargarUsuarios();
            actualizarEstadisticas();
        } catch (error) {
            alert('Error al eliminar el usuario: ' + error.message);
        }
    };

    botonCancelarUsuario.addEventListener('click', () => {
        fondoModalUsuario.classList.add('oculto');
    });

    botonGuardarUsuario.addEventListener('click', async () => {
        const id    = idUsuarioEditar.value;
        const datos = {
            nombre:        modalNombreUsuario.value.trim(),
            apellido:      modalApellidoUsuario.value.trim(),
            nombreUsuario: modalNombreUsuarioInput.value.trim(),
            idRol:         parseInt(modalRolUsuario.value),
            contrasena:    modalContrasenaUsuario.value.trim()
        };

        if (!datos.nombre || !datos.apellido || !datos.nombreUsuario) {
            mostrarMensajeModal(mensajeModalUsuario, 'Nombre, apellido y nombre de usuario son obligatorios.', true);
            return;
        }

        try {
            if (id) {
                await actualizarUsuario(id, datos);
            } else {
                if (!datos.contrasena) {
                    mostrarMensajeModal(mensajeModalUsuario, 'La contraseña es obligatoria para nuevos usuarios.', true);
                    return;
                }
                await crearUsuario(datos);
            }
            mostrarMensajeModal(mensajeModalUsuario, 'Usuario guardado correctamente.', false);
            setTimeout(() => {
                fondoModalUsuario.classList.add('oculto');
                cargarUsuarios();
                actualizarEstadisticas();
            }, 1200);
        } catch (error) {
            mostrarMensajeModal(mensajeModalUsuario, error.message, true);
        }
    });

    // Cargadores:
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

        const paginados = paginar(cargadores, paginas.cargadores);

        let html = `<table class="tabla-admin">
            <thead><tr>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Coste</th>
                <th>Tiempo</th>
                <th>Acciones</th>
            </tr></thead><tbody>`;

        paginados.forEach(c => {
            html += `<tr>
                <td>${c.nombre}</td>
                <td>${c.direccion}</td>
                <td>${etiquetaTipo(c.tipo)}</td>
                <td><span class="badge-estado badge-${c.estado}">${etiquetaEstado(c.estado)}</span></td>
                <td>${c.coste} €/kWh</td>
                <td>${c.tiempoEstimado} min</td>
                <td>
                    <button class="boton-editar" onclick="editarCargador(${c.id})">Editar</button>
                    <button class="boton-eliminar" onclick="eliminarCargadorAdmin(${c.id})">Eliminar</button>
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

    botonNuevoCargador.addEventListener('click', () => {
        tituloModalCargador.textContent = 'Nuevo cargador';
        idCargadorEditar.value          = '';
        modalNombreCargador.value       = '';
        modalDireccionCargador.value    = '';
        modalLatitudCargador.value      = '';
        modalLongitudCargador.value     = '';
        modalTipoCargador.value         = 'estandar';
        modalEstadoCargador.value       = 'libre';
        modalTiempoCargador.value       = '30';
        modalCosteCargador.value        = '0.20';
        mensajeModalCargador.classList.add('oculto');
        fondoModalCargador.classList.remove('oculto');
    });

    window.editarCargador = function(id) {
        const c = todosLosCargadores.find(c => c.id === id);
        if (!c) return;
        tituloModalCargador.textContent = 'Editar cargador';
        idCargadorEditar.value          = c.id;
        modalNombreCargador.value       = c.nombre;
        modalDireccionCargador.value    = c.direccion;
        modalLatitudCargador.value      = c.latitud;
        modalLongitudCargador.value     = c.longitud;
        modalTipoCargador.value         = c.tipo;
        modalEstadoCargador.value       = c.estado;
        modalTiempoCargador.value       = c.tiempoEstimado;
        modalCosteCargador.value        = c.coste;
        mensajeModalCargador.classList.add('oculto');
        fondoModalCargador.classList.remove('oculto');
    };

    window.eliminarCargadorAdmin = async function(id) {
        if (!confirm('¿Seguro que quieres eliminar este cargador?')) return;
        try {
            await eliminarCargador(id);
            cargarCargadores();
            actualizarEstadisticas();
        } catch (error) {
            alert('Error al eliminar el cargador: ' + error.message);
        }
    };

    botonCancelarCargador.addEventListener('click', () => {
        fondoModalCargador.classList.add('oculto');
    });

    botonGuardarCargador.addEventListener('click', async () => {
        const id    = idCargadorEditar.value;
        const datos = {
            nombre:         modalNombreCargador.value.trim(),
            direccion:      modalDireccionCargador.value.trim(),
            latitud:        parseFloat(modalLatitudCargador.value),
            longitud:       parseFloat(modalLongitudCargador.value),
            tipo:           modalTipoCargador.value,
            estado:         modalEstadoCargador.value,
            tiempoEstimado: parseInt(modalTiempoCargador.value),
            coste:          parseFloat(modalCosteCargador.value)
        };

        if (!datos.nombre || !datos.direccion || isNaN(datos.latitud) || isNaN(datos.longitud)) {
            mostrarMensajeModal(mensajeModalCargador, 'Nombre, dirección, latitud y longitud son obligatorios.', true);
            return;
        }

        try {
            if (id) {
                await actualizarCargador(id, datos);
            } else {
                await crearCargador(datos);
            }
            mostrarMensajeModal(mensajeModalCargador, 'Cargador guardado correctamente.', false);
            setTimeout(() => {
                fondoModalCargador.classList.add('oculto');
                cargarCargadores();
                actualizarEstadisticas();
            }, 1200);
        } catch (error) {
            mostrarMensajeModal(mensajeModalCargador, error.message, true);
        }
    });

    // Reservas:
    async function cargarReservas() {
        try {
            todasLasReservas = await obtenerReservas();
            renderizarReservas(todasLasReservas);
        } catch (error) {
            contenedorReservas.innerHTML = '<p class="texto-vacio">Error al cargar reservas.</p>';
        }
    }

    function renderizarReservas(reservas) {
        if (reservas.length === 0) {
            contenedorReservas.innerHTML = '<p class="texto-vacio">No hay reservas que coincidan.</p>';
            return;
        }

        const paginadas = paginar(reservas, paginas.reservas);

        let html = `<table class="tabla-admin">
            <thead><tr>
                <th>Usuario</th>
                <th>Cargador</th>
                <th>Dirección</th>
                <th>Fecha reserva</th>
                <th>Estado</th>
            </tr></thead><tbody>`;

        paginadas.forEach(r => {
            const fecha = new Date(r.fechaReserva).toLocaleDateString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            html += `<tr>
                <td>${r.nombreUsuario}</td>
                <td>${r.nombreCargador}</td>
                <td>${r.direccion}</td>
                <td>${fecha}</td>
                <td><span class="badge-estado badge-${r.estado}">${etiquetaEstadoReserva(r.estado)}</span></td>
            </tr>`;
        });

        html += '</tbody></table>';
        contenedorReservas.innerHTML = html;

        contenedorReservas.appendChild(crearPaginacion(
            reservas.length,
            paginas.reservas,
            () => { paginas.reservas--; renderizarReservas(reservas); },
            () => { paginas.reservas++; renderizarReservas(reservas); }
        ));
    }

    function aplicarFiltrosReservas() {
        paginas.reservas = 1;
        const busqueda  = buscarReserva.value.trim().toLowerCase();
        const estado    = filtroEstadoReserva.value;
        const filtradas = todasLasReservas.filter(r => {
            const coincide       = !busqueda || r.nombreUsuario.toLowerCase().includes(busqueda) || r.nombreCargador.toLowerCase().includes(busqueda);
            const coincideEstado = !estado   || r.estado === estado;
            return coincide && coincideEstado;
        });
        renderizarReservas(filtradas);
    }

    buscarReserva.addEventListener('input',        aplicarFiltrosReservas);
    filtroEstadoReserva.addEventListener('change', aplicarFiltrosReservas);

    // Favoritos:
    async function cargarFavoritos() {
        try {
            todosLosFavoritos = await obtenerFavoritos();
            renderizarFavoritos(todosLosFavoritos);
        } catch (error) {
            contenedorFavoritos.innerHTML = '<p class="texto-vacio">Error al cargar favoritos.</p>';
        }
    }

    function renderizarFavoritos(favoritos) {
        if (favoritos.length === 0) {
            contenedorFavoritos.innerHTML = '<p class="texto-vacio">No hay favoritos que coincidan.</p>';
            return;
        }

        const paginados = paginar(favoritos, paginas.favoritos);

        let html = `<table class="tabla-admin">
            <thead><tr>
                <th>Usuario</th>
                <th>Cargador</th>
                <th>Dirección</th>
                <th>Estado cargador</th>
                <th>Fecha guardado</th>
            </tr></thead><tbody>`;

        paginados.forEach(f => {
            const fecha = new Date(f.fechaGuardado).toLocaleDateString('es-ES');
            html += `<tr>
                <td>${f.nombreUsuario}</td>
                <td>${f.nombreCargador}</td>
                <td>${f.direccion}</td>
                <td><span class="badge-estado badge-${f.estado}">${etiquetaEstado(f.estado)}</span></td>
                <td>${fecha}</td>
            </tr>`;
        });

        html += '</tbody></table>';
        contenedorFavoritos.innerHTML = html;

        contenedorFavoritos.appendChild(crearPaginacion(
            favoritos.length,
            paginas.favoritos,
            () => { paginas.favoritos--; renderizarFavoritos(favoritos); },
            () => { paginas.favoritos++; renderizarFavoritos(favoritos); }
        ));
    }

    function aplicarFiltrosFavoritos() {
        paginas.favoritos = 1;
        const busqueda  = buscarFavorito.value.trim().toLowerCase();
        const filtrados = todosLosFavoritos.filter(f =>
            !busqueda || f.nombreUsuario.toLowerCase().includes(busqueda) || f.nombreCargador.toLowerCase().includes(busqueda)
        );
        renderizarFavoritos(filtrados);
    }

    buscarFavorito.addEventListener('input', aplicarFiltrosFavoritos);

    // Sesiones:
    async function cargarSesiones() {
        try {
            todasLasSesiones = await obtenerSesiones();
            renderizarSesiones(todasLasSesiones);
        } catch (error) {
            contenedorSesiones.innerHTML = '<p class="texto-vacio">Error al cargar sesiones.</p>';
        }
    }

    function renderizarSesiones(sesiones) {
        if (sesiones.length === 0) {
            contenedorSesiones.innerHTML = '<p class="texto-vacio">No hay sesiones registradas.</p>';
            return;
        }

        const paginadas = paginar(sesiones, paginas.sesiones);

        let html = `<table class="tabla-admin">
            <thead><tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>IP</th>
                <th>Dispositivo</th>
                <th>Fecha y hora</th>
            </tr></thead><tbody>`;

        paginadas.forEach(s => {
            const fecha = new Date(s.fechaHora).toLocaleDateString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
            const dispositivo = s.tipoDispositivo.substring(0, 40) + (s.tipoDispositivo.length > 40 ? '...' : '');
            html += `<tr>
                <td>${s.nombreUsuario}</td>
                <td><span class="badge-estado badge-${s.rol}">${capitalizarPrimera(s.rol)}</span></td>
                <td>${s.direccionIP}</td>
                <td title="${s.tipoDispositivo}">${dispositivo}</td>
                <td>${fecha}</td>
            </tr>`;
        });

        html += '</tbody></table>';
        contenedorSesiones.innerHTML = html;

        contenedorSesiones.appendChild(crearPaginacion(
            sesiones.length,
            paginas.sesiones,
            () => { paginas.sesiones--; renderizarSesiones(sesiones); },
            () => { paginas.sesiones++; renderizarSesiones(sesiones); }
        ));
    }

    function aplicarFiltrosSesiones() {
        paginas.sesiones = 1;
        const busqueda  = buscarSesion.value.trim().toLowerCase();
        const filtradas = todasLasSesiones.filter(s =>
            !busqueda || s.nombreUsuario.toLowerCase().includes(busqueda) || s.direccionIP.includes(busqueda)
        );
        renderizarSesiones(filtradas);
    }

    buscarSesion.addEventListener('input', aplicarFiltrosSesiones);

    // Notificaciones:
    async function cargarNotificaciones() {
        try {
            todasLasNotificaciones = await obtenerNotificaciones();
            renderizarNotificaciones(todasLasNotificaciones);
        } catch (error) {
            contenedorNotificaciones.innerHTML = '<p class="texto-vacio">Error al cargar notificaciones.</p>';
        }
    }

    function renderizarNotificaciones(notificaciones) {
        if (notificaciones.length === 0) {
            contenedorNotificaciones.innerHTML = '<p class="texto-vacio">No hay incidencias reportadas.</p>';
            return;
        }

        const paginadas = paginar(notificaciones, paginas.notificaciones);

        let html = `<table class="tabla-admin">
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
        contenedorNotificaciones.innerHTML = html;

        contenedorNotificaciones.appendChild(crearPaginacion(
            notificaciones.length,
            paginas.notificaciones,
            () => { paginas.notificaciones--; renderizarNotificaciones(notificaciones); },
            () => { paginas.notificaciones++; renderizarNotificaciones(notificaciones); }
        ));
    }

    function aplicarFiltrosNotificaciones() {
        paginas.notificaciones = 1;
        const leida    = filtroLeidaNotificacion.value;
        const filtradas = todasLasNotificaciones.filter(n =>
            leida === '' || n.leida.toString() === leida
        );
        renderizarNotificaciones(filtradas);
    }

    filtroLeidaNotificacion.addEventListener('change', aplicarFiltrosNotificaciones);

    window.marcarLeida = async function(id) {
        try {
            await marcarNotificacionLeida(id);
            cargarNotificaciones();
            actualizarEstadisticas();
        } catch (error) {
            console.error('Error al marcar notificación:', error.message);
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

    function etiquetaEstadoReserva(estado) {
        const etiquetas = { activa: 'Activa', completada: 'Completada', cancelada: 'Cancelada' };
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