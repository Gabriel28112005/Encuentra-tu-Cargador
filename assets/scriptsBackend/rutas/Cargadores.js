/**
 * Cargadores.js
 * Rutas de gestión de cargadores.
 * Encuentra tu Cargador — Informática II
 * Autores: Gabriel Kaakedjian, Gabriel Peña
 */

'use strict';

const express = require('express');
const router  = express.Router();
const pool    = require('../Db');
const { verificarToken, verificarRol } = require('../autentificacionRoles/Middleware');

// ═══════════════════════════════════════════════════════════
// GET /api/cargadores
// Devuelve la lista de todos los cargadores.
// Accesible por todos los roles.
// ═══════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════
// GET /api/cargadores/:id
// Devuelve los detalles de un cargador concreto.
// Accesible por todos los roles.
// ═══════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════
// POST /api/cargadores
// Crea un nuevo cargador.
// Solo accesible por el administrador.
// ═══════════════════════════════════════════════════════════
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
        return res.status(201).json({ mensaje: 'Cargador creado correctamente.' });
    } catch (error) {
        console.error('Error en POST /api/cargadores:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// ═══════════════════════════════════════════════════════════
// PUT /api/cargadores/:id
// Actualiza los datos de un cargador.
// Accesible por administrador y técnico.
// ═══════════════════════════════════════════════════════════
router.put('/cargadores/:id', verificarToken, verificarRol('administrador', 'tecnico'), async (req, res) => {
    const { nombre, direccion, latitud, longitud, tipo, estado, nivelBateria, tiempoEstimado, coste } = req.body;

    try {
        const [resultado] = await pool.execute(
            `UPDATE cargadores SET nombre = ?, direccion = ?, latitud = ?, longitud = ?,
             tipo = ?, estado = ?, nivelBateria = ?, tiempoEstimado = ?, coste = ?
             WHERE id = ?`,
            [nombre, direccion, latitud, longitud, tipo, estado,
             nivelBateria, tiempoEstimado, coste, req.params.id]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Cargador no encontrado.' });
        }
        return res.status(200).json({ mensaje: 'Cargador actualizado correctamente.' });
    } catch (error) {
        console.error('Error en PUT /api/cargadores/:id:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// ═══════════════════════════════════════════════════════════
// DELETE /api/cargadores/:id
// Elimina un cargador.
// Solo accesible por el administrador.
// ═══════════════════════════════════════════════════════════
router.delete('/cargadores/:id', verificarToken, verificarRol('administrador'), async (req, res) => {
    try {
        const [resultado] = await pool.execute(
            `DELETE FROM cargadores WHERE id = ?`,
            [req.params.id]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Cargador no encontrado.' });
        }
        return res.status(200).json({ mensaje: 'Cargador eliminado correctamente.' });
    } catch (error) {
        console.error('Error en DELETE /api/cargadores/:id:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

module.exports = router;