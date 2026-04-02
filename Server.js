/**
 * Server.js
 * Servidor principal de la aplicación.
 * Encuentra tu Cargador — Informática II
 * Autores: Gabriel Kaakedjian, Gabriel Peña
 */

'use strict';

const express  = require('express');
const cors     = require('cors');
const dotenv   = require('dotenv');
const path     = require('path');
const http     = require('http');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '.env') });

// ═══════════════════════════════════════════════════════════
// IMPORTAR RUTAS
// ═══════════════════════════════════════════════════════════
const autentificacionRutas = require('./assets/scriptsBackend/rutas/AutentificacionRutas');
const usuariosRutas        = require('./assets/scriptsBackend/rutas/Usuarios');
const cargadoresRutas      = require('./assets/scriptsBackend/rutas/Cargadores');
const reservasRutas        = require('./assets/scriptsBackend/rutas/Reservas');
const favoritosRutas       = require('./assets/scriptsBackend/rutas/Favoritos');
const notificacionesRutas  = require('./assets/scriptsBackend/rutas/Notificaciones');
const sesionesRutas        = require('./assets/scriptsBackend/rutas/Sesiones');
const datosUsuarioRutas    = require('./assets/scriptsBackend/rutas/DatosUsuario');

// ═══════════════════════════════════════════════════════════
// IMPORTAR WEBSOCKET
// ═══════════════════════════════════════════════════════════
const { iniciarWebSocket } = require('./assets/scriptsBackend/WebSocket');

// ═══════════════════════════════════════════════════════════
// CONFIGURACIÓN DE EXPRESS
// ═══════════════════════════════════════════════════════════
const app = express();

// Middleware para parsear JSON en las peticiones
app.use(express.json());

// Middleware CORS — permite peticiones desde el navegador
app.use(cors());

// Servir archivos estáticos desde la raíz del proyecto
// Esto permite que el navegador acceda a los HTML, CSS y JS
app.use(express.static(path.join(__dirname)));

// ═══════════════════════════════════════════════════════════
// REGISTRAR RUTAS DE LA API
// ═══════════════════════════════════════════════════════════
app.use('/api', autentificacionRutas);
app.use('/api', usuariosRutas);
app.use('/api', cargadoresRutas);
app.use('/api', reservasRutas);
app.use('/api', favoritosRutas);
app.use('/api', notificacionesRutas);
app.use('/api', sesionesRutas);
app.use('/api', datosUsuarioRutas);

// ═══════════════════════════════════════════════════════════
// RUTA PRINCIPAL — Servir Index.html
// ═══════════════════════════════════════════════════════════
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Index.html'));
});

// ═══════════════════════════════════════════════════════════
// MANEJO DE RUTAS NO ENCONTRADAS (404)
// ═══════════════════════════════════════════════════════════
app.use((req, res) => {
    res.status(404).json({ mensaje: 'Ruta no encontrada.' });
});

// ═══════════════════════════════════════════════════════════
// MANEJO DE ERRORES INTERNOS (500)
// ═══════════════════════════════════════════════════════════
app.use((error, req, res, next) => {
    console.error('Error interno del servidor:', error.message);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
});

// ═══════════════════════════════════════════════════════════
// CREAR SERVIDOR HTTP E INICIAR WEBSOCKET
// ═══════════════════════════════════════════════════════════
const servidor = http.createServer(app);
iniciarWebSocket(servidor);

// ═══════════════════════════════════════════════════════════
// ARRANCAR EL SERVIDOR
// ═══════════════════════════════════════════════════════════
const PUERTO = process.env.PORT || 3000;

servidor.listen(PUERTO, () => {
    console.log(`Servidor en ejecución en http://localhost:${PUERTO}`);
    console.log('Pulsa Ctrl+C para detenerlo.');
});