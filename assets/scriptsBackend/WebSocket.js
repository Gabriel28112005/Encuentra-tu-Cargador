// Configuración del servidor WebSocket para notificiaciones en tiempo real.

'use strict';

const { WebSocketServer } = require('ws');

// Mapa de clientes conectados. Almacena las conexiones activas según su rol para así enviar mensajes solo a los roles específicos
const clientes = {
    administrador: new Set(),
    tecnico:       new Set(),
    usuario:       new Set()
};


/*
    Inicialización del servidor WebSocket. Este recibe el servidor HTTP creado en Server.js y comparte el mismo puerto para evitar 
    abrir un puerto adicional
*/

function iniciarWebSocket(servidor) {
    const wss = new WebSocketServer({ server: servidor });

    wss.on('connection', (ws, req) => {

        // Extraer el rol del parámetro de la URL al conectarse
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


// Envío de notificación a roles específicos. Se llama desde las rutas cuando ocurre una incidencia
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