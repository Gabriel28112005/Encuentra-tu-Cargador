// Validación de tokens JWT y control de roles para rutas protegidas en el backend

'use strict';

const jwt    = require('jsonwebtoken');
const dotenv = require('dotenv');
const path   = require('path');

// Cargar variables de entorno desde la raíz del proyecto
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });


/*
    Verificación del token JWT y control de roles para rutas protegidas. Se ejecuta antes de acceder a cualquier ruta que requiera
    autenticación o autorización específica. Se comprueba que el token existe, es válido y no ha expirado.
*/

function verificarToken(req, res, next) {
    const cabecera = req.headers['authorization'];

    // Comprobar que se ha enviado el token en la cabecera
    if (!cabecera) {
        return res.status(401).json({ mensaje: 'Acceso denegado. No se ha proporcionado un token.' });
    }

    // El token llega con el formato "Bearer <token>", por lo que se extrae solo el token
    const token = cabecera.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensaje: 'Acceso denegado. Formato de token incorrecto.' });
    }

    try {
        // Verificar y decodificar el token usando la clave secreta del .env
        const datos = jwt.verify(token, process.env.JWT_SECRET);

        // Guardar los datos del usuario en la petición para usarlos en las rutas
        req.usuario = datos;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ mensaje: 'La sesión ha expirado. Por favor, inicia sesión de nuevo.' });
        }
        return res.status(401).json({ mensaje: 'Token inválido.' });
    }
}

// Se verifica que el usuario tiene el rol necesario para acceder a la ruta solicitada. Se ejecuta después de la función "verificarToken"

function verificarRol(...rolesPermitidos) {
    return (req, res, next) => {
        const rolUsuario = req.usuario.rol;

        if (!rolesPermitidos.includes(rolUsuario)) {
            return res.status(403).json({
                mensaje: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}.`
            });
        }

        next();
    };
}

module.exports = { verificarToken, verificarRol };