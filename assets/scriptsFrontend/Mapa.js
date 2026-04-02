/**
 * Mapa.js
 * Lógica del mapa interactivo de cargadores con Leaflet.js
 * Encuentra tu Cargador — Informática II
 * Autores: Gabriel Kaakedjian, Gabriel Peña
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* ═══════════════════════════════════════════════════════════
       REFERENCIAS AL DOM
    ════════════════════════════════════════════════════════════ */
    const panelDetalle         = document.getElementById('panelDetalle');
    const botonCerrarPanel     = document.getElementById('botonCerrarPanel');
    const panelNombre          = document.getElementById('panelNombre');
    const panelEstado          = document.getElementById('panelEstado');
    const panelTipo            = document.getElementById('panelTipo');
    const panelCoste           = document.getElementById('panelCoste');
    const panelTiempo          = document.getElementById('panelTiempo');
    const panelDireccion       = document.getElementById('panelDireccion');
    const botonReservar        = document.getElementById('botonReservar');
    const botonFavorito        = document.getElementById('botonFavorito');
    const botonNavegador       = document.getElementById('botonNavegador');
    const botonIncidencia      = document.getElementById('botonIncidencia');
    const inputBusqueda        = document.getElementById('inputBusqueda');
    const botonBusqueda        = document.getElementById('botonBusqueda');
    const filtroTipo           = document.getElementById('filtroTipo');
    const filtroEstado         = document.getElementById('filtroEstado');
    const textoUsuario         = document.getElementById('textoUsuario');
    const fondoModalIncidencia = document.getElementById('fondoModalIncidencia');
    const textoIncidencia      = document.getElementById('textoIncidencia');
    const botonCancelarInc     = document.getElementById('botonCancelarIncidencia');
    const botonEnviarInc       = document.getElementById('botonEnviarIncidencia');
    const mensajeIncidencia    = document.getElementById('mensajeIncidencia');
    const modalNombreCargador  = document.getElementById('modalNombreCargador');
    const fondoModalReserva    = document.getElementById('fondoModalReserva');
    const modalNombreReserva   = document.getElementById('modalNombreReserva');
    const botonCancelarReserva = document.getElementById('botonCancelarReserva');
    const botonConfirmarReserva= document.getElementById('botonConfirmarReserva');
    const mensajeReserva       = document.getElementById('mensajeReserva');

    /* ═══════════════════════════════════════════════════════════
       ESTADO DE LA APLICACIÓN
    ════════════════════════════════════════════════════════════ */
    let cargadorActivo  = null;
    let marcadores      = [];
    let todosLosCargadores = [];

    /* ═══════════════════════════════════════════════════════════
       MOSTRAR NOMBRE DE USUARIO EN CABECERA
    ════════════════════════════════════════════════════════════ */
    const nombreUsuario = localStorage.getItem('nombreUsuario');
    if (textoUsuario && nombreUsuario) {
        textoUsuario.textContent = nombreUsuario;
    }

    /* ═══════════════════════════════════════════════════════════
       INICIALIZAR MAPA CON LEAFLET
    ════════════════════════════════════════════════════════════ */
    const latitud  = parseFloat(localStorage.getItem('latitud'))  || 40.4168;
    const longitud = parseFloat(localStorage.getItem('longitud')) || -3.7038;

    const mapa = L.map('mapa', { zoomControl: true }).setView([latitud, longitud], 14);

    // Teselas de OpenStreetMap (gratuito)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(mapa);

    // Marcador de posición del usuario
    const iconoUsuario = L.divIcon({
        className: '',
        html: '<div style="width:14px;height:14px;border-radius:50%;background:#1a56db;border:3px solid white;box-shadow:0 0 0 3px rgba(26,86,219,0.3);"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });
    L.marker([latitud, longitud], { icon: iconoUsuario })
        .addTo(mapa)
        .bindPopup('Tu ubicación actual');

    /* ═══════════════════════════════════════════════════════════
       CREAR ICONO DE MARCADOR SEGÚN ESTADO
    ════════════════════════════════════════════════════════════ */
    function crearIcono(estado) {
        const colores = {
            libre:         '#3B6D11',
            ocupado:       '#A32D2D',
            en_reparacion: '#854F0B'
        };
        const color = colores[estado] || '#888780';
        return L.divIcon({
            className: '',
            html: `<div style="width:18px;height:18px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 18],
            popupAnchor: [0, -18]
        });
    }

    /* ═══════════════════════════════════════════════════════════
       CARGAR CARGADORES DESDE LA API
    ════════════════════════════════════════════════════════════ */
    async function cargarCargadores() {
        try {
            const datos = await obtenerCargadores();
            todosLosCargadores = datos;
            renderizarMarcadores(datos);
        } catch (error) {
            console.error('Error al cargar cargadores:', error.message);
        }
    }

    /* ═══════════════════════════════════════════════════════════
       RENDERIZAR MARCADORES EN EL MAPA
    ════════════════════════════════════════════════════════════ */
    function renderizarMarcadores(cargadores) {
        // Eliminar marcadores anteriores
        marcadores.forEach(m => mapa.removeLayer(m));
        marcadores = [];

        cargadores.forEach(cargador => {
            const marcador = L.marker(
                [cargador.latitud, cargador.longitud],
                { icon: crearIcono(cargador.estado) }
            ).addTo(mapa);

            marcador.on('click', (e) => {
                L.DomEvent.stopPropagation(e);
                mostrarDetalle(cargador);
            });

            marcadores.push(marcador);
        });
    }

    /* ═══════════════════════════════════════════════════════════
       MOSTRAR DETALLE DEL CARGADOR EN EL PANEL LATERAL
    ════════════════════════════════════════════════════════════ */
    function mostrarDetalle(cargador) {
        cargadorActivo = cargador;

        panelNombre.textContent    = cargador.nombre;
        panelTipo.textContent      = capitalizarPrimera(cargador.tipo);
        panelCoste.textContent     = `${cargador.coste} €/kWh`;
        panelTiempo.textContent    = `${cargador.tiempoEstimado} min`;
        panelDireccion.textContent = cargador.direccion;

        // Badge de estado
        panelEstado.className  = `panel-valor estado-${cargador.estado}`;
        panelEstado.textContent = etiquetaEstado(cargador.estado);

        // Deshabilitar reserva si no está libre
        botonReservar.disabled = cargador.estado !== 'libre';

        // Mostrar el panel
        panelDetalle.classList.remove('oculto');
    }

    /* ═══════════════════════════════════════════════════════════
       OCULTAR PANEL LATERAL
    ════════════════════════════════════════════════════════════ */
    function ocultarDetalle() {
        panelDetalle.classList.add('oculto');
        cargadorActivo = null;
    }

    /* ═══════════════════════════════════════════════════════════
       CERRAR PANEL AL HACER CLIC EN EL MAPA
    ════════════════════════════════════════════════════════════ */
    mapa.on('click', () => {
        ocultarDetalle();
    });

    botonCerrarPanel.addEventListener('click', ocultarDetalle);

    /* ═══════════════════════════════════════════════════════════
       FILTROS
    ════════════════════════════════════════════════════════════ */
    function aplicarFiltros() {
        const tipo   = filtroTipo.value;
        const estado = filtroEstado.value;
        const busqueda = inputBusqueda.value.trim().toLowerCase();

        const filtrados = todosLosCargadores.filter(c => {
            const coincideTipo    = !tipo   || c.tipo   === tipo;
            const coincideEstado  = !estado || c.estado === estado;
            const coincideBusqueda = !busqueda ||
                c.nombre.toLowerCase().includes(busqueda) ||
                c.direccion.toLowerCase().includes(busqueda);
            return coincideTipo && coincideEstado && coincideBusqueda;
        });

        renderizarMarcadores(filtrados);
        ocultarDetalle();
    }

    filtroTipo.addEventListener('change',   aplicarFiltros);
    filtroEstado.addEventListener('change', aplicarFiltros);
    botonBusqueda.addEventListener('click', aplicarFiltros);
    inputBusqueda.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') aplicarFiltros();
    });

    /* ═══════════════════════════════════════════════════════════
       RESERVAR CARGADOR
    ════════════════════════════════════════════════════════════ */
    botonReservar.addEventListener('click', () => {
        if (!cargadorActivo) return;
        modalNombreReserva.textContent = cargadorActivo.nombre;
        mensajeReserva.classList.add('oculto');
        fondoModalReserva.classList.remove('oculto');
    });

    botonCancelarReserva.addEventListener('click', () => {
        fondoModalReserva.classList.add('oculto');
    });

    botonConfirmarReserva.addEventListener('click', async () => {
        if (!cargadorActivo) return;
        try {
            await crearReserva(cargadorActivo.id);
            mostrarMensajeModal(mensajeReserva, 'Reserva creada correctamente.', false);
            setTimeout(() => {
                fondoModalReserva.classList.add('oculto');
                cargarCargadores();
                ocultarDetalle();
            }, 1500);
        } catch (error) {
            mostrarMensajeModal(mensajeReserva, error.message, true);
        }
    });

    /* ═══════════════════════════════════════════════════════════
       AÑADIR A FAVORITOS
    ════════════════════════════════════════════════════════════ */
    botonFavorito.addEventListener('click', async () => {
        if (!cargadorActivo) return;
        try {
            await añadirFavorito(cargadorActivo.id);
            botonFavorito.textContent = 'Añadido a favoritos';
            botonFavorito.disabled = true;
        } catch (error) {
            console.error('Error al añadir favorito:', error.message);
        }
    });

    /* ═══════════════════════════════════════════════════════════
       ABRIR EN NAVEGADOR EXTERNO
    ════════════════════════════════════════════════════════════ */
    botonNavegador.addEventListener('click', () => {
        if (!cargadorActivo) return;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${cargadorActivo.latitud},${cargadorActivo.longitud}`;
        window.open(url, '_blank');
    });

    /* ═══════════════════════════════════════════════════════════
       REPORTAR INCIDENCIA
    ════════════════════════════════════════════════════════════ */
    botonIncidencia.addEventListener('click', () => {
        if (!cargadorActivo) return;
        modalNombreCargador.textContent = cargadorActivo.nombre;
        textoIncidencia.value = '';
        mensajeIncidencia.classList.add('oculto');
        fondoModalIncidencia.classList.remove('oculto');
    });

    botonCancelarInc.addEventListener('click', () => {
        fondoModalIncidencia.classList.add('oculto');
    });

    botonEnviarInc.addEventListener('click', async () => {
        if (!cargadorActivo) return;
        const mensaje = textoIncidencia.value.trim();
        if (!mensaje) {
            mostrarMensajeModal(mensajeIncidencia, 'Por favor describe el problema.', true);
            return;
        }
        try {
            await reportarIncidencia(cargadorActivo.id, mensaje);
            mostrarMensajeModal(mensajeIncidencia, 'Incidencia reportada correctamente.', false);
            setTimeout(() => {
                fondoModalIncidencia.classList.add('oculto');
            }, 1500);
        } catch (error) {
            mostrarMensajeModal(mensajeIncidencia, error.message, true);
        }
    });

    /* ═══════════════════════════════════════════════════════════
       UTILIDADES
    ════════════════════════════════════════════════════════════ */
    function etiquetaEstado(estado) {
        const etiquetas = {
            libre:         'Libre',
            ocupado:       'Ocupado',
            en_reparacion: 'En reparación'
        };
        return etiquetas[estado] || estado;
    }

    function capitalizarPrimera(texto) {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    function mostrarMensajeModal(elemento, texto, esError) {
        elemento.textContent = texto;
        elemento.className   = 'modal-mensaje' + (esError ? ' error' : '');
        elemento.classList.remove('oculto');
    }

    /* ═══════════════════════════════════════════════════════════
       INICIALIZACIÓN
    ════════════════════════════════════════════════════════════ */
    cargarCargadores();

});