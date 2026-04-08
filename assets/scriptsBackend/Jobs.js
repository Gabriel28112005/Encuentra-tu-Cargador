// Tareas programadas del servidor. Se ejecutan automáticamente en segundo plano cada cierto tiempo sin necesidad de intervención del usuario.

'use strict';

const cron = require('node-cron');
const pool = require('./Db');

// Tarea programada que se ejecuta cada minuto para cancelar las reservas expiradas y liberar los cargadores correspondientes.
function iniciarJobs() {

    cron.schedule('* * * * *', async () => {
        try {

            // Obtener las reservas activas cuya fecha de expiración ya ha pasado
            const [reservasExpiradas] = await pool.execute(
                `SELECT id, idCargador FROM reservas
                 WHERE estado = 'activa' AND fechaExpiracion < NOW()`
            );

            if (reservasExpiradas.length === 0) return;

            // Cancelar las reservas expiradas
            await pool.execute(
                `UPDATE reservas SET estado = 'cancelada'
                 WHERE estado = 'activa' AND fechaExpiracion < NOW()`
            );

            // Liberar los cargadores asociados a las reservas expiradas
            const idsCargadores = reservasExpiradas.map(r => r.idCargador);
            for (const idCargador of idsCargadores) {
                await pool.execute(
                    `UPDATE cargadores SET estado = 'libre' WHERE id = ?`,
                    [idCargador]
                );
            }

            console.log(`Job ejecutado: ${reservasExpiradas.length} reserva(s) expirada(s) cancelada(s).`);

        } catch (error) {
            console.error('Error en el job de reservas:', error.message);
        }
    });

    console.log('Jobs programados iniciados.');
}

module.exports = { iniciarJobs };