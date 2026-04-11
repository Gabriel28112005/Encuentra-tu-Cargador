// Rutas para la gestión de cargadores

'use strict';

const express = require('express');
const router  = express.Router();
const pool    = require('../Db');
const { verificarToken, verificarRol } = require('../autentificacionRoles/Middleware');
const { enviarNotificacion }           = require('../WebSocket');

// Petición GET /api/cargadores para obtener una lista de todos los cargadores. Está permitida para todos los roles
router.get('/cargadores', verificarToken, async (req, res) => {
    try {
        const [filas] = await pool.execute(
            `SELECT * FROM cargadores ORDER BY id ASC`
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error en GET /api/cargadores:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// Petición GET /api/cargadores/:id para obtener los detalles de un cargador concreto. Pueden hacerla todos los roles
router.get('/cargadores/:id', verificarToken, async (req, res) => {
    try {
        const [filas] = await pool.execute(
            `SELECT * FROM cargadores WHERE id = ?`,
            [req.params.id]
        );
        if (filas.length === 0) {
            return res.status(404).json({ mensaje: 'Cargador no encontrado.' });
        }
        return res.status(200).json(filas[0]);
    } catch (error) {
        console.error('Error en GET /api/cargadores/:id:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// Petición POST /api/cargadores para crear un nuevo cargador. Solo puede realizarla el administrador
router.post('/cargadores', verificarToken, verificarRol('administrador'), async (req, res) => {
    const { nombre, direccion, latitud, longitud, tipo, estado, nivelBateria, tiempoEstimado, coste } = req.body;

    if (!nombre || !direccion || !latitud || !longitud) {
        return res.status(400).json({ mensaje: 'Nombre, dirección, latitud y longitud son obligatorios.' });
    }

    try {
        await pool.execute(
            `INSERT INTO cargadores (nombre, direccion, latitud, longitud, tipo, estado, nivelBateria, tiempoEstimado, coste)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, direccion, latitud, longitud, tipo || 'estandar', estado || 'libre',
             nivelBateria || 100, tiempoEstimado || 30, coste || 0.00]
        );

        // Notificar en tiempo real a todos los roles para que recarguen la lista de cargadores
        enviarNotificacion(['administrador', 'tecnico', 'usuario'], {
            tipo: 'actualizarCargadores'
        });

        return res.status(201).json({ mensaje: 'Cargador creado correctamente.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensaje: 'Ya existe un cargador en esas coordenadas.' });
        }
        console.error('Error en POST /api/cargadores:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// Petición PUT /api/cargadores/:id para actualizar los datos de un cargador. Solo pueden hacerla el administrador y el técnico
router.put('/cargadores/:id', verificarToken, verificarRol('administrador', 'tecnico'), async (req, res) => {
    const { nombre, direccion, latitud, longitud, tipo, estado, nivelBateria, tiempoEstimado, coste } = req.body;

    try {
        // Obtener el cargador actual para conservar los campos no enviados
        const [actual] = await pool.execute(
            `SELECT * FROM cargadores WHERE id = ?`,
            [req.params.id]
        );

        if (actual.length === 0) {
            return res.status(404).json({ mensaje: 'Cargador no encontrado.' });
        }

        const [resultado] = await pool.execute(
            `UPDATE cargadores SET nombre = ?, direccion = ?, latitud = ?, longitud = ?,
             tipo = ?, estado = ?, nivelBateria = ?, tiempoEstimado = ?, coste = ?
             WHERE id = ?`,
            [
                nombre         || actual[0].nombre,
                direccion      || actual[0].direccion,
                latitud        ?? actual[0].latitud,
                longitud       ?? actual[0].longitud,
                tipo           || actual[0].tipo,
                estado         || actual[0].estado,
                nivelBateria   ?? actual[0].nivelBateria,
                tiempoEstimado ?? actual[0].tiempoEstimado,
                coste          ?? actual[0].coste,
                req.params.id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Cargador no encontrado.' });
        }

        // Si el nuevo estado es libre, cancelar cualquier reserva activa asociada
        if (estado === 'libre') {
            await pool.execute(
                `UPDATE reservas SET estado = 'cancelada'
                 WHERE idCargador = ? AND estado = 'activa'`,
                [req.params.id]
            );
        }

        // Notificar en tiempo real a todos los roles del cambio de estado del cargador
        enviarNotificacion(['administrador', 'tecnico', 'usuario'], {
            tipo:       'estadoCargador',
            idCargador: parseInt(req.params.id),
            estado:     estado || actual[0].estado
        });

        // Notificar también para recargar la lista completa de cargadores (por si cambiaron otros campos)
        enviarNotificacion(['administrador', 'tecnico', 'usuario'], {
            tipo: 'actualizarCargadores'
        });

        return res.status(200).json({ mensaje: 'Cargador actualizado correctamente.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensaje: 'Ya existe un cargador en esas coordenadas.' });
        }
        console.error('Error en PUT /api/cargadores/:id:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// Petición DELETE /api/cargadores/:id para eliminar un cargador. Solo puede realizarla el administrador
router.delete('/cargadores/:id', verificarToken, verificarRol('administrador'), async (req, res) => {
    try {
        const [resultado] = await pool.execute(
            `DELETE FROM cargadores WHERE id = ?`,
            [req.params.id]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Cargador no encontrado.' });
        }

        // Notificar en tiempo real a todos los roles para que recarguen la lista de cargadores
        enviarNotificacion(['administrador', 'tecnico', 'usuario'], {
            tipo: 'actualizarCargadores'
        });

        return res.status(200).json({ mensaje: 'Cargador eliminado correctamente.' });
    } catch (error) {
        console.error('Error en DELETE /api/cargadores/:id:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

module.exports = router;