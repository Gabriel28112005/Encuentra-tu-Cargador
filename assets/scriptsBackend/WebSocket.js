/**
 * WebSocket.js
 * Configuración del servidor WebSocket para notificaciones en tiempo real.
 * Encuentra tu Cargador — Informática II
 * Autores: Gabriel Kaakedjian, Gabriel Peña
 */

'use strict';

const { WebSocketServer } = require('ws');

// ═══════════════════════════════════════════════════════════
// MAPA DE CLIENTES CONECTADOS
// Almacena las conexiones activas organizadas por rol,
// permitiendo enviar mensajes solo a roles específicos.
// ═══════════════════════════════════════════════════════════
const clientes = {
    administrador: new Set(),
    tecnico:       new Set(),
    usuario:       new Set()
};

// ═══════════════════════════════════════════════════════════
// INICIAR SERVIDOR WEBSOCKET
// Recibe el servidor HTTP creado en Server.js y comparte
// el mismo puerto, evitando abrir un puerto adicional.
// ═══════════════════════════════════════════════════════════
function iniciarWebSocket(servidor) {
    const wss = new WebSocketServer({ server: servidor });

    wss.on('connection', (ws, req) => {

        // Extraer el rol del parámetro de la URL al conectarse
        // Ejemplo de conexión desde el frontend:
        // new WebSocket('ws://localhost:3000?rol=administrador')
        const parametros = new URLSearchParams(req.url.replace('/?', ''));
        const rol        = parametros.get('rol');

        // Registrar el cliente según su rol
        if (rol && clientes[rol]) {
            clientes[rol].add(ws);
            console.log(`Cliente WebSocket conectado con rol: ${rol}`);
        }

        // Eliminar el cliente cuando se desconecte
        ws.on('close', () => {
            if (rol && clientes[rol]) {
                clientes[rol].delete(ws);
                console.log(`Cliente WebSocket desconectado con rol: ${rol}`);
            }
        });

        // Manejo de errores de conexión
        ws.on('error', (error) => {
            console.error('Error en WebSocket:', error.message);
        });
    });

    console.log('Servidor WebSocket iniciado.');
}

// ═══════════════════════════════════════════════════════════
// ENVIAR NOTIFICACIÓN A ROLES ESPECÍFICOS
// Se llama desde las rutas cuando ocurre una incidencia.
// Ejemplo: enviarNotificacion(['administrador', 'tecnico'], datos)
// ═══════════════════════════════════════════════════════════
function enviarNotificacion(roles, datos) {
    const mensaje = JSON.stringify(datos);

    roles.forEach(rol => {
        if (clientes[rol]) {
            clientes[rol].forEach(cliente => {
                if (cliente.readyState === 1) {
                    cliente.send(mensaje);
                }
            });
        }
    });
}

module.exports = { iniciarWebSocket, enviarNotificacion };