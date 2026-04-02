/**
 * Notificaciones.js
 * Rutas de gestión de notificaciones e incidencias.
 * Encuentra tu Cargador — Informática II
 * Autores: Gabriel Kaakedjian, Gabriel Peña
 */

'use strict';

const express = require('express');
const router  = express.Router();
const pool    = require('../Db');
const { verificarToken, verificarRol } = require('../autentificacionRoles/Middleware');
const { enviarNotificacion } = require('../WebSocket');

// ═══════════════════════════════════════════════════════════
// GET /api/notificaciones
// Devuelve las notificaciones pendientes.
// Solo accesible por administrador y técnico.
// ═══════════════════════════════════════════════════════════
router.get('/notificaciones', verificarToken, verificarRol('administrador', 'tecnico'), async (req, res) => {
    try {
        const [filas] = await pool.execute(
            `SELECT n.*, c.nombre AS nombreCargador, c.direccion,
             u.nombreUsuario
             FROM notificaciones n
             JOIN cargadores c ON n.idCargador = c.id
             JOIN usuarios u ON n.idUsuario = u.id
             ORDER BY n.fechaEnvio DESC`
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error en GET /api/notificaciones:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// ═══════════════════════════════════════════════════════════
// POST /api/notificaciones
// Reporta un cargador defectuoso.
// Accesible por todos los roles.
// Envía notificación en tiempo real a administrador y técnico.
// ═══════════════════════════════════════════════════════════
router.post('/notificaciones', verificarToken, async (req, res) => {
    const { idCargador, mensaje } = req.body;

    if (!idCargador || !mensaje) {
        return res.status(400).json({ mensaje: 'El id del cargador y el mensaje son obligatorios.' });
    }

    try {
        // Guardar la notificación en la base de datos
        await pool.execute(
            `INSERT INTO notificaciones (idUsuario, idCargador, mensaje)
             VALUES (?, ?, ?)`,
            [req.usuario.id, idCargador, mensaje]
        );

        // Obtener datos del cargador para la notificación
        const [cargador] = await pool.execute(
            `SELECT nombre, direccion FROM cargadores WHERE id = ?`,
            [idCargador]
        );

        // Enviar notificación en tiempo real a administrador y técnico
        enviarNotificacion(['administrador', 'tecnico'], {
            tipo:             'incidencia',
            idCargador,
            nombreCargador:   cargador[0]?.nombre || 'Desconocido',
            direccion:        cargador[0]?.direccion || 'Desconocida',
            mensaje,
            reportadoPor:     req.usuario.nombreUsuario,
            fechaEnvio:       new Date()
        });

        return res.status(201).json({ mensaje: 'Incidencia reportada correctamente.' });
    } catch (error) {
        console.error('Error en POST /api/notificaciones:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// ═══════════════════════════════════════════════════════════
// PUT /api/notificaciones/:id/leida
// Marca una notificación como leída.
// Solo accesible por administrador y técnico.
// ═══════════════════════════════════════════════════════════
router.put('/notificaciones/:id/leida', verificarToken, verificarRol('administrador', 'tecnico'), async (req, res) => {
    try {
        const [resultado] = await pool.execute(
            `UPDATE notificaciones SET leida = 1 WHERE id = ?`,
            [req.params.id]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Notificación no encontrada.' });
        }
        return res.status(200).json({ mensaje: 'Notificación marcada como leída.' });
    } catch (error) {
        console.error('Error en PUT /api/notificaciones/:id/leida:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

module.exports = router;