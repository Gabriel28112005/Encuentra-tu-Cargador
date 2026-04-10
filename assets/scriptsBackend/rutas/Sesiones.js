// Rutas de consultas del historial de logins

'use strict';

const express = require('express');
const router  = express.Router();
const pool    = require('../Db');
const { verificarToken, verificarRol } = require('../autentificacionRoles/Middleware');


// Método GET /api/sesiones que devuelve el historial completo de logins. Únicamente es accesible por el administrador
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