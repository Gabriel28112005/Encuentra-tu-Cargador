// Rutas de gestión de cargadores favoritos

'use strict';

const express = require('express');
const router  = express.Router();
const pool    = require('../Db');
const { verificarToken, verificarRol } = require('../autentificacionRoles/Middleware');
const { enviarNotificacion }           = require('../WebSocket');


/*
    Método GET /api/favoritos que devuelve favoritos según el rol:
        - Usuario: solo sus propios favoritos
        - Administrador: todos los favoritos
*/
router.get('/favoritos', verificarToken, async (req, res) => {
    try {
        let filas;

        if (req.usuario.rol === 'usuario') {
            [filas] = await pool.execute(
                `SELECT f.*, c.nombre AS nombreCargador, c.direccion,
                 c.tipo, c.estado, c.coste
                 FROM favoritos f
                 JOIN cargadores c ON f.idCargador = c.id
                 WHERE f.idUsuario = ?
                 ORDER BY f.fechaGuardado DESC`,
                [req.usuario.id]
            );
        } else {
            [filas] = await pool.execute(
                `SELECT f.*, c.nombre AS nombreCargador, c.direccion,
                 c.tipo, c.estado, c.coste, u.nombreUsuario
                 FROM favoritos f
                 JOIN cargadores c ON f.idCargador = c.id
                 JOIN usuarios u ON f.idUsuario = u.id
                 ORDER BY f.fechaGuardado DESC`
            );
        }

        return res.status(200).json(filas);
    } catch (error) {
        console.error('Error en GET /api/favoritos:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});


// Petición POST /api/favoritos que añade un cargador a favoritos
router.post('/favoritos', verificarToken, async (req, res) => {
    const { idCargador } = req.body;

    if (!idCargador) {
        return res.status(400).json({ mensaje: 'El id del cargador es obligatorio.' });
    }

    try {
        await pool.execute(
            `INSERT INTO favoritos (idUsuario, idCargador) VALUES (?, ?)`,
            [req.usuario.id, idCargador]
        );

        // Notificar en tiempo real al administrador para que recargue la tabla de favoritos
        enviarNotificacion(['administrador'], { tipo: 'actualizarFavoritos' });

        return res.status(201).json({ mensaje: 'Cargador añadido a favoritos.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensaje: 'Este cargador ya está en tus favoritos.' });
        }
        console.error('Error en POST /api/favoritos:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});


// Petición DELETE /api/favoritos/:idCargador que elimina un cargador de favoritos
router.delete('/favoritos/:idCargador', verificarToken, async (req, res) => {
    try {
        const [resultado] = await pool.execute(
            `DELETE FROM favoritos WHERE idUsuario = ? AND idCargador = ?`,
            [req.usuario.id, req.params.idCargador]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Favorito no encontrado.' });
        }

        // Notificar en tiempo real al administrador para que recargue la tabla de favoritos
        enviarNotificacion(['administrador'], { tipo: 'actualizarFavoritos' });

        return res.status(200).json({ mensaje: 'Cargador eliminado de favoritos.' });
    } catch (error) {
        console.error('Error en DELETE /api/favoritos/:idCargador:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

module.exports = router;