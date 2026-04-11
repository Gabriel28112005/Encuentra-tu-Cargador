// Rutas de gestión de usuarios (CRUD). Solo es accesible por el administrador.

'use strict';

const express = require('express');
const router  = express.Router();
const pool    = require('../Db');
const { verificarToken, verificarRol } = require('../autentificacionRoles/Middleware');
const { enviarNotificacion }           = require('../WebSocket');


// Petición GET /api/usuarios que devuelve la lista completa de usuarios
router.get('/usuarios', verificarToken, verificarRol('administrador'), async (req, res) => {
    try {
        const [filas] = await pool.execute(
            `SELECT u.id, u.nombre, u.apellido, u.nombreUsuario, u.timestamp, r.nombre AS rol
             FROM usuarios u
             JOIN roles r ON u.idRol = r.id
             ORDER BY u.id ASC`
        );
        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error en GET /api/usuarios:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});


// Método GET /api/usuarios/:id que devuelve los datos de un usuario concreto
router.get('/usuarios/:id', verificarToken, verificarRol('administrador'), async (req, res) => {
    try {
        const [filas] = await pool.execute(
            `SELECT u.id, u.nombre, u.apellido, u.nombreUsuario, u.timestamp, r.nombre AS rol
             FROM usuarios u
             JOIN roles r ON u.idRol = r.id
             WHERE u.id = ?`,
            [req.params.id]
        );
        if (filas.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }
        return res.status(200).json(filas[0]);
    } catch (error) {
        console.error('Error en GET /api/usuarios/:id:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});


// Método POST /api/usuarios que crea un nuevo usuario
router.post('/usuarios', verificarToken, verificarRol('administrador'), async (req, res) => {
    const { nombre, apellido, nombreUsuario, contrasena, idRol } = req.body;

    if (!nombre || !apellido || !nombreUsuario || !contrasena || !idRol) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    try {
        const bcrypt = require('bcrypt');
        const hash   = await bcrypt.hash(contrasena, 10);

        await pool.execute(
            `INSERT INTO usuarios (nombre, apellido, nombreUsuario, contrasena, idRol)
             VALUES (?, ?, ?, ?, ?)`,
            [nombre, apellido, nombreUsuario, hash, idRol]
        );

        // Notificar en tiempo real al administrador para que recargue la tabla de usuarios
        enviarNotificacion(['administrador'], { tipo: 'actualizarUsuarios' });

        return res.status(201).json({ mensaje: 'Usuario creado correctamente.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensaje: 'El nombre de usuario ya existe.' });
        }
        console.error('Error en POST /api/usuarios:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});


// Método PUT /api/usuarios/:id que actualiza los datos de un usuario.
router.put('/usuarios/:id', verificarToken, verificarRol('administrador'), async (req, res) => {
    const { nombre, apellido, nombreUsuario, idRol } = req.body;

    if (!nombre || !apellido || !nombreUsuario || !idRol) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    try {
        const [resultado] = await pool.execute(
            `UPDATE usuarios SET nombre = ?, apellido = ?, nombreUsuario = ?, idRol = ?
             WHERE id = ?`,
            [nombre, apellido, nombreUsuario, idRol, req.params.id]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        // Notificar en tiempo real al administrador para que recargue la tabla de usuarios
        enviarNotificacion(['administrador'], { tipo: 'actualizarUsuarios' });

        return res.status(200).json({ mensaje: 'Usuario actualizado correctamente.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensaje: 'El nombre de usuario ya existe.' });
        }
        console.error('Error en PUT /api/usuarios/:id:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});


// Método DELETE /api/usuarios/:id que elimina a un usuario
router.delete('/usuarios/:id', verificarToken, verificarRol('administrador'), async (req, res) => {
    try {
        const [resultado] = await pool.execute(
            `DELETE FROM usuarios WHERE id = ?`,
            [req.params.id]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        }

        // Notificar en tiempo real al administrador para que recargue la tabla de usuarios
        enviarNotificacion(['administrador'], { tipo: 'actualizarUsuarios' });

        return res.status(200).json({ mensaje: 'Usuario eliminado correctamente.' });
    } catch (error) {
        console.error('Error en DELETE /api/usuarios/:id:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

module.exports = router;