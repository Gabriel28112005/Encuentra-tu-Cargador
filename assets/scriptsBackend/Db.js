// Conexión y configuración de la base de datos MySQL que está en el archivo BaseDeDatos.sql

'use strict';

const mysql  = require('mysql2/promise');
const dotenv = require('dotenv');
const path   = require('path');

// Cargar variables de entorno desde la raíz del proyecto
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });


/*
    Configuración del pool de conexiones a MySQL utilizando los datos del ".env". Esto se hace para no tener que 
    abrir y cerrar una conexión por cada peteción que le llega al servidor
*/
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


// Verificación de la conexión al arrancar el servidor
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