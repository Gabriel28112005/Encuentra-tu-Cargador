/**
 * Sesiones.js
 * Rutas de consulta del log de sesiones.
 * Solo accesible por el administrador.
 * Encuentra tu Cargador — Informática II
 * Autores: Gabriel Kaakedjian, Gabriel Peña
 */

'use strict';

const express = require('express');
const router  = express.Router();
const pool    = require('../Db');
const { verificarToken, verificarRol } = require('../autentificacionRoles/Middleware');

// ═══════════════════════════════════════════════════════════
// GET /api/sesiones
// Devuelve el log completo de sesiones.
// Solo accesible por el administrador.
// ═══════════════════════════════════════════════════════════
router.get('/sesiones', verificarToken, verificarRol('administrador'), async (req, res) => {
    try {
        const [filas] = await pool.execute(
            `SELECT s.id, s.nombreUsuario, s.tipoDispositivo,
             s.direccionIP, s.fechaHora, r.nombre AS rol
             FROM sesiones s
             JOIN usuarios u ON s.idUsuario = u.id
             JOIN roles r ON u.idRol = r.id
             ORDER BY s.fechaHora DESC`
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error en GET /api/sesiones:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

module.exports = router;