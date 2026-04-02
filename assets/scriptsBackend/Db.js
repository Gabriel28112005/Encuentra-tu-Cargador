/**
 * Db.js
 * Conexión y configuración de la base de datos MySQL.
 * Encuentra tu Cargador — Informática II
 * Autores: Gabriel Kaakedjian, Gabriel Peña
 */

'use strict';

const mysql  = require('mysql2/promise');
const dotenv = require('dotenv');
const path   = require('path');

// Cargar variables de entorno desde la raíz del proyecto
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

// ═══════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL POOL DE CONEXIONES
// Un pool gestiona múltiples conexiones simultáneas de forma
// eficiente, evitando abrir y cerrar una conexión por cada
// petición que llega al servidor.
// ═══════════════════════════════════════════════════════════
const pool = mysql.createPool({
    host:            process.env.DB_HOST,
    port:            process.env.DB_PORT,
    user:            process.env.DB_USER,
    password:        process.env.DB_PASSWORD,
    database:        process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0
});

// ═══════════════════════════════════════════════════════════
// VERIFICACIÓN DE LA CONEXIÓN AL ARRANCAR EL SERVIDOR
// ═══════════════════════════════════════════════════════════
async function verificarConexion() {
    try {
        const conexion = await pool.getConnection();
        console.log('Conexión a MySQL establecida correctamente.');
        conexion.release();
    } catch (error) {
        console.error('Error al conectar con MySQL:', error.message);
        console.error('Verifica que MySQL está en ejecución y que los datos del .env son correctos.');
        process.exit(1);
    }
}

verificarConexion();

module.exports = pool;