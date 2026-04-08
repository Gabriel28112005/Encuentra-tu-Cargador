// Servidor principal de la aplicación. Configura Express, registra rutas, maneja errores y también inicia el servidor WebSocket para las notificaciones en tiempo real.

'use strict';

const express  = require('express');
const cors     = require('cors');
const dotenv   = require('dotenv');
const path     = require('path');
const http     = require('http');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '.env') });

// Importación de rutas
const autentificacionRutas = require('./assets/scriptsBackend/rutas/AutentificacionRutas');
const usuariosRutas        = require('./assets/scriptsBackend/rutas/Usuarios');
const cargadoresRutas      = require('./assets/scriptsBackend/rutas/Cargadores');
const reservasRutas        = require('./assets/scriptsBackend/rutas/Reservas');
const favoritosRutas       = require('./assets/scriptsBackend/rutas/Favoritos');
const notificacionesRutas  = require('./assets/scriptsBackend/rutas/Notificaciones');
const sesionesRutas        = require('./assets/scriptsBackend/rutas/Sesiones');
const datosUsuarioRutas    = require('./assets/scriptsBackend/rutas/DatosUsuario');

// Importación WebSocket
const { iniciarWebSocket } = require('./assets/scriptsBackend/WebSocket');

// Importación de jobs programados
const { iniciarJobs } = require('./assets/scriptsBackend/Jobs');

// Configuración de Express
const app = express();

// Middleware para parsear JSON en las peticiones
app.use(express.json());

// Middleware CORS para permitir peticiones desde el navegador
app.use(cors());

// Servir archivos estáticos desde la raíz del proyecto
// Esto permite que el navegador acceda a los HTML, CSS y JS
app.use(express.static(path.join(__dirname)));

// Registro de rutas desde la Api
app.use('/api', autentificacionRutas);
app.use('/api', usuariosRutas);
app.use('/api', cargadoresRutas);
app.use('/api', reservasRutas);
app.use('/api', favoritosRutas);
app.use('/api', notificacionesRutas);
app.use('/api', sesionesRutas);
app.use('/api', datosUsuarioRutas);

// Ruta principal: Servir Index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Index.html'));
});

// Control de rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json({ mensaje: 'Ruta no encontrada.' });
});

// Control de errores internos (500)
app.use((error, req, res, next) => {
    console.error('Error interno del servidor:', error.message);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
});

// Creación del servidor HTTP a partir de la aplicación Express y luego iniciar el WebSocket en ese mismo servidor para compartir el puerto.
const servidor = http.createServer(app);
iniciarWebSocket(servidor);

// Inicio de los jobs programados
iniciarJobs();

// Uso del servidor
const PUERTO = process.env.PORT || 3000;

servidor.listen(PUERTO, () => {
    console.log(`Servidor en ejecución en http://localhost:${PUERTO}`);
    console.log('Pulsa Ctrl+C para detenerlo.');
});