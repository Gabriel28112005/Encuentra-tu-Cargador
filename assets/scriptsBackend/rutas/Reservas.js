//Configuración de las rutas para la gestión de reservas

'use strict';

const express = require('express');
const router = require('express').Router();
const pool = require('../Db');
const { verificarToken, verificarRol } = require('../autentificacionRoles/Middleware');
const { enviarNotificacion } = require('../WebSocket');

/*
    Petición GET /api/reservas que devuelve reservas según el rol:
        - Usuario: solo sus propias reservas
        - Administrador y Técnico: todas las reservas
*/
router.get('/reservas', verificarToken, async (req, res) => {
    try {
        let filas;

        if (req.usuario.rol === 'usuario') {
            [filas] = await pool.execute(
                `SELECT r.*, c.nombre AS nombreCargador, c.direccion
                 FROM reservas r
                 JOIN cargadores c ON r.idCargador = c.id
                 WHERE r.idUsuario = ?
                 ORDER BY r.fechaReserva DESC`,
                [req.usuario.id]
            );
        } else {
            [filas] = await pool.execute(
                `SELECT r.*, c.nombre AS nombreCargador, c.direccion,
                 u.nombreUsuario
                 FROM reservas r
                 JOIN cargadores c ON r.idCargador = c.id
                 JOIN usuarios u ON r.idUsuario = u.id
                 ORDER BY r.fechaReserva DESC`
            );
        }

        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error en GET /api/reservas:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});


// Petición POST /api/reservas que crea una nueva reserva
router.post('/reservas', verificarToken, async (req, res) => {
    const { idCargador } = req.body;

    if (!idCargador) {
        return res.status(400).json({ mensaje: 'El id del cargador es obligatorio.' });
    }

    try {
        // Comprobar que el cargador está libre
        const [cargador] = await pool.execute(
            `SELECT * FROM cargadores WHERE id = ? AND estado = 'libre'`,
            [idCargador]
        );

        if (cargador.length === 0) {
            return res.status(400).json({ mensaje: 'El cargador no está disponible.' });
        }

        // Calcular fecha de expiración (30 minutos desde ahora)
        const fechaExpiracion = new Date(Date.now() + 30 * 60 * 1000);

        // Crear la reserva
        await pool.execute(
            `INSERT INTO reservas (idUsuario, idCargador, fechaExpiracion)
             VALUES (?, ?, ?)`,
            [req.usuario.id, idCargador, fechaExpiracion]
        );

        // Actualizar el estado del cargador a ocupado
        await pool.execute(
            `UPDATE cargadores SET estado = 'ocupado' WHERE id = ?`,
            [idCargador]
        );

        // Notificar en tiempo real a todos los roles del cambio de estado del cargador
        enviarNotificacion(['administrador', 'tecnico', 'usuario'], {
            tipo:       'estadoCargador',
            idCargador: parseInt(idCargador),
            estado:     'ocupado'
        });

        // Notificar en tiempo real al administrador y técnico de la nueva reserva
        enviarNotificacion(['administrador', 'tecnico'], {
            tipo: 'reserva'
        });

        return res.status(201).json({ mensaje: 'Reserva creada correctamente.' });
    } catch (error) {
        console.error('Error en POST /api/reservas:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});


// Petición PUT /api/reservas/:id/completar que marca una reserva como completada y libera el cargador. Solo puede realizarla el usuario propietario de la reserva
router.put('/reservas/:id/completar', verificarToken, async (req, res) => {
    try {
        // Obtener la reserva
        const [filas] = await pool.execute(
            `SELECT * FROM reservas WHERE id = ?`,
            [req.params.id]
        );

        if (filas.length === 0) {
            return res.status(404).json({ mensaje: 'Reserva no encontrada.' });
        }

        const reserva = filas[0];

        // Comprobar que el usuario es el propietario
        if (reserva.idUsuario !== req.usuario.id) {
            return res.status(403).json({ mensaje: 'No tienes permiso para completar esta reserva.' });
        }

        // Comprobar que la reserva está activa
        if (reserva.estado !== 'activa') {
            return res.status(400).json({ mensaje: 'Solo se pueden completar reservas activas.' });
        }

        // Marcar la reserva como completada
        await pool.execute(
            `UPDATE reservas SET estado = 'completada' WHERE id = ?`,
            [req.params.id]
        );

        // Liberar el cargador
        await pool.execute(
            `UPDATE cargadores SET estado = 'libre' WHERE id = ?`,
            [reserva.idCargador]
        );

        // Notificar en tiempo real a todos los roles del cambio de estado del cargador
        enviarNotificacion(['administrador', 'tecnico', 'usuario'], {
            tipo:       'estadoCargador',
            idCargador: reserva.idCargador,
            estado:     'libre'
        });

        // Notificar en tiempo real al administrador y técnico del cambio de estado de la reserva
        enviarNotificacion(['administrador', 'tecnico'], {
            tipo: 'reserva'
        });

        return res.status(200).json({ mensaje: 'Reserva completada correctamente.' });
    } catch (error) {
        console.error('Error en PUT /api/reservas/:id/completar:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});


// Método DELETE /api/reservas/:id para cancelar una reserva
router.delete('/reservas/:id', verificarToken, async (req, res) => {
    try {
        // Obtener la reserva
        const [filas] = await pool.execute(
            `SELECT * FROM reservas WHERE id = ?`,
            [req.params.id]
        );

        if (filas.length === 0) {
            return res.status(404).json({ mensaje: 'Reserva no encontrada.' });
        }

        const reserva = filas[0];

        // Comprobar que el usuario es el propietario o es admin
        if (req.usuario.rol === 'usuario' && reserva.idUsuario !== req.usuario.id) {
            return res.status(403).json({ mensaje: 'No tienes permiso para cancelar esta reserva.' });
        }

        // Cancelar la reserva
        await pool.execute(
            `UPDATE reservas SET estado = 'cancelada' WHERE id = ?`,
            [req.params.id]
        );

        // Liberar el cargador
        await pool.execute(
            `UPDATE cargadores SET estado = 'libre' WHERE id = ?`,
            [reserva.idCargador]
        );

        // Notificar en tiempo real a todos los roles del cambio de estado del cargador
        enviarNotificacion(['administrador', 'tecnico', 'usuario'], {
            tipo:       'estadoCargador',
            idCargador: reserva.idCargador,
            estado:     'libre'
        });

        // Notificar en tiempo real al administrador y técnico del cambio de estado de la reserva
        enviarNotificacion(['administrador', 'tecnico'], {
            tipo: 'reserva'
        });

        return res.status(200).json({ mensaje: 'Reserva cancelada correctamente.' });
    } catch (error) {
        console.error('Error en DELETE /api/reservas/:id:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

module.exports = router;