// Rutas de autenticación: login y logout

'use strict';

const express = require('express');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcrypt');
const dotenv  = require('dotenv');
const path    = require('path');
const router  = express.Router();

// Cargar variables de entorno desde la raíz del proyecto
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '..', '.env') });

// Importar conexión a la base de datos
const pool = require('../Db');

// Importar middleware
const { verificarToken } = require('../autentificacionRoles/Middleware');

// En el post del login se realiza la verificación de las credenciales del usuario y devuelve un token JWT. También registra la sesión en la tabla sesiones

router.post('/login', async (req, res) => {
    const { nombreUsuario, contrasena, tipoDispositivo } = req.body;

    // Validar que se han enviado los campos obligatorios
    if (!nombreUsuario || !contrasena) {
        return res.status(400).json({ mensaje: 'El nombre de usuario y la contraseña son obligatorios.' });
    }

    try {
        // Buscar el usuario en la base de datos junto con su rol
        const [filas] = await pool.execute(
            `SELECT u.id, u.nombre, u.apellido, u.nombreUsuario, u.contrasena, r.nombre AS rol
             FROM usuarios u
             JOIN roles r ON u.idRol = r.id
             WHERE u.nombreUsuario = ?`,
            [nombreUsuario]
        );

        // Comprobar que el usuario existe
        if (filas.length === 0) {
            return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
        }

        const usuario = filas[0];

        // Comprobar la contraseña con bcrypt
        const contrasenaCorrecta = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!contrasenaCorrecta) {
            return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
        }

        // Generar el token JWT con los datos del usuario
        const token = jwt.sign(
            {
                id:            usuario.id,
                nombreUsuario: usuario.nombreUsuario,
                rol:           usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRACION }
        );

        // Registrar la sesión en la tabla sesiones
        const direccionIP     = req.ip || req.connection.remoteAddress || 'Desconocida';
        const dispositivoInfo = tipoDispositivo || 'Desconocido';

        await pool.execute(
            `INSERT INTO sesiones (idUsuario, nombreUsuario, tipoDispositivo, direccionIP)
             VALUES (?, ?, ?, ?)`,
            [usuario.id, usuario.nombreUsuario, dispositivoInfo, direccionIP]
        );

        // Devolver el token y los datos básicos del usuario
        return res.status(200).json({
            token,
            rol:           usuario.rol,
            nombreUsuario: usuario.nombreUsuario
        });

    } catch (error) {
        console.error('Error en /api/login:', error.message);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// En el post del logout se cierra la sesión del usuario. El token se invalida en el frontend eliminándolo del localStorage. Esta ruta confirma el logout al cliente.
router.post('/logout', verificarToken, (req, res) => {
    return res.status(200).json({ mensaje: 'Sesión cerrada correctamente.' });
});

module.exports = router;