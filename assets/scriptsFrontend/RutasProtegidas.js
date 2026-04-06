//Protección de páginas según token y rol almacenado en el localStorage. Se incluye en todas las páginas protegidas para verificar que el usuario tiene acceso a ellas

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // Obtención de datos de sesión de localStorage

    const token    = localStorage.getItem('token');
    const rol      = localStorage.getItem('rol');
    const latitud  = localStorage.getItem('latitud');
    const longitud = localStorage.getItem('longitud');

    // Comprobación de si la sesión está activada. En caso de que no haya token o rol, se redirige al login
    if (!token || !rol) {
        window.location.href = '../Index.html';
        return;
    }

    // Comprobación de que el rol tiene acceso a la ruta (se obtiene el rol que está permitido desde el atributo data-rol del body)
    const rolRequerido = document.body.getAttribute('data-rol');

    if (rolRequerido && rol !== rolRequerido) {
        // El usuario no tiene el rol necesario, redirigir según su rol
        redirigirSegunRol(rol);
        return;
    }

    
    // Comprobación de que hay geolocalización (solo para Mapa.html)
    const requiereGeo = document.body.getAttribute('data-geo');

    if (requiereGeo === 'true' && (!latitud || !longitud)) {
        window.location.href = '../Index.html';
        return;
    }

    // Función que redirige según el rol del usuario
    function redirigirSegunRol(rolUsuario) {
        switch (rolUsuario) {
            case 'administrador':
                window.location.href = '../html/Admin.html';
                break;
            case 'tecnico':
                window.location.href = '../html/Tecnico.html';
                break;
            default:
                window.location.href = '../html/Mapa.html';
                break;
        }
    }

    
    // Función de cierre de sesión
    window.cerrarSesion = async function () {
        try {
            await fetch('http://localhost:3000/api/logout', {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error al cerrar sesión:', error.message);
        } finally {
            // Limpiar localStorage y redirigir al login
            localStorage.removeItem('token');
            localStorage.removeItem('rol');
            localStorage.removeItem('nombreUsuario');
            localStorage.removeItem('latitud');
            localStorage.removeItem('longitud');
            window.location.href = '../Index.html';
        }
    };

});