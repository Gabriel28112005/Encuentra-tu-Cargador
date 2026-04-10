// Rutas de consulta y actualización del perfil del usuario

'use strict';

const express = require('express');
const router  = express.Router();
const pool    = require('../Db');
const bcrypt  = require('bcrypt');
const { verificarToken } = require('../autentificacionRoles/Middleware');

// Petición GET /api/datosusuario pobtener nombre, apellido y nombreUsuario del usuario autenticado, pero no devuelve rol, timestamp ni contraseña. Esto es accesible por todos los roles.
router.get('/datosusuario', verificarToken, async (req, res) => {
    try {
        const [filas] = await pool.execute(
            `SELECT nombre, apellido, nombreUsuario
             FROM usuarios
             WHERE id = ?`,
            [req.usuario.id]
        );

        if (filas.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        return res.status(200).json(filas[0]);
    } catch (error) {
        console.error('Error en GET /api/datosusuario:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});


// Petición PUT /api/datosusuario/contrasena que actualiza la contraseña del usuario autenticado. Es accesible para todos los roles.
router.put('/datosusuario/contrasena', verificarToken, async (req, res) => {
    const { contrasenaActual, contrasenaNueva } = req.body;

    if (!contrasenaActual || !contrasenaNueva) {
        return res.status(400).json({ mensaje: 'La contraseña actual y la nueva son obligatorias.' });
    }

    if (contrasenaNueva.length < 8) {
        return res.status(400).json({ mensaje: 'La nueva contraseña debe tener al menos 8 caracteres.' });
    }

    try {
        // Obtener la contraseña actual del usuario
        const [filas] = await pool.execute(
            `SELECT contrasena FROM usuarios WHERE id = ?`,
            [req.usuario.id]
        );

        if (filas.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        // Verificar que la contraseña actual es correcta
        const contrasenaCorrecta = await bcrypt.compare(contrasenaActual, filas[0].contrasena);

        if (!contrasenaCorrecta) {
            return res.status(401).json({ mensaje: 'La contraseña actual es incorrecta.' });
        }

        // Cifrar la nueva contraseña y actualizarla
        const hash = await bcrypt.hash(contrasenaNueva, 10);

        await pool.execute(
            `UPDATE usuarios SET contrasena = ? WHERE id = ?`,
            [hash, req.usuario.id]
        );

        return res.status(200).json({ mensaje: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        console.error('Error en PUT /api/datosusuario/contrasena:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

module.exports = router;